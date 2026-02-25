import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import Pet from '../pet/pet.model';
import PetChatHistory from './ai.model';
import { PetAdviceInput } from './ai.schema';
import {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} from '@/server/utils/AppError';
import { getRedisClient } from '@/server/config/redis';
import { logger } from '@/server/utils/logger';

// ─── Constants ───────────────────────────────────────
const AI_RATE_LIMIT_WINDOW = 3600;   // 1 hour
const AI_RATE_LIMIT_MAX = 30;        // Max requests per hour per user
const AI_RATE_LIMIT_KEY = (userId: string) => `ai:ratelimit:${userId}`;
const MAX_CONTEXT_HISTORY = 5;       // Recent chats to include for context

// ─── Gemini Client (lazy singleton) ──────────────────
let geminiClient: GoogleGenerativeAI | null = null;

const getGemini = (): GoogleGenerativeAI => {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new BadRequestError('Gemini API key is not configured');
        }
        geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return geminiClient;
};

// ─── Helpers ─────────────────────────────────────────

/** Calculate pet age from DOB */
const calculateAge = (dob: Date): string => {
    const now = new Date();
    const years = now.getFullYear() - dob.getFullYear();
    const months = now.getMonth() - dob.getMonth();
    if (years < 1) {
        return `${Math.max(1, years * 12 + months)} months`;
    }
    return months > 0 ? `${years} years ${months} months` : `${years} years`;
};

/** Build a structured system prompt with pet context */
const buildSystemPrompt = (pet: {
    name: string;
    breed: string;
    gender: string;
    dob: Date;
    weight: number;
    healthStatus: string;
    isLostMode: boolean;
}): string => {
    const age = calculateAge(pet.dob);

    return `You are PetBuddy AI — a friendly, knowledgeable veterinary assistant.
You are providing advice about a specific pet with the following profile:

🐾 **Pet Profile**
- Name: ${pet.name}
- Breed: ${pet.breed}
- Gender: ${pet.gender}
- Age: ${age}
- Weight: ${pet.weight} kg
- Health Status: ${pet.healthStatus}
${pet.isLostMode ? '⚠️ This pet is currently in LOST MODE.' : ''}

Guidelines:
1. Always consider the pet's breed, age, weight, and health status in your answers.
2. Provide practical, actionable advice.
3. For serious medical concerns, always recommend visiting a veterinarian.
4. Be warm, empathetic, and encouraging.
5. Keep answers concise but thorough (200-400 words).
6. Use simple language a pet owner would understand.
7. If the question is unrelated to pets, politely redirect to pet-related topics.
8. Never prescribe medication — only suggest consulting a vet.`;
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Get AI-powered pet advice.
 * - Validates pet ownership
 * - Rate limits per user (30 requests/hour via Redis)
 * - Fetches recent chat history for context
 * - Sends structured prompt to Gemini
 * - Stores Q&A in database
 */
export const getPetAdvice = async (
    userId: string,
    input: PetAdviceInput,
) => {
    const { petId, question } = input;

    // ── Verify pet ownership ───────────────────────────
    const pet = await Pet.findById(petId);
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to ask about this pet');
    }

    // ── Rate limiting (Redis) ──────────────────────────
    const redis = getRedisClient();
    const rateLimitKey = AI_RATE_LIMIT_KEY(userId);
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
        await redis.expire(rateLimitKey, AI_RATE_LIMIT_WINDOW);
    }
    if (currentCount > AI_RATE_LIMIT_MAX) {
        const ttl = await redis.ttl(rateLimitKey);
        throw new BadRequestError(
            `AI advice rate limit reached. Please try again in ${Math.ceil(ttl / 60)} minutes.`,
        );
    }

    // ── Fetch recent chat history for context ──────────
    const recentChats = await PetChatHistory.find({ petId, userId })
        .sort({ createdAt: -1 })
        .limit(MAX_CONTEXT_HISTORY)
        .lean();

    // Build Gemini-compatible history (oldest first)
    const chatHistory: Content[] = recentChats
        .reverse()
        .flatMap((chat) => [
            { role: 'user' as const, parts: [{ text: chat.question }] },
            { role: 'model' as const, parts: [{ text: chat.answer }] },
        ]);

    // ── Call Gemini ────────────────────────────────────
    const gemini = getGemini();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    const systemPrompt = buildSystemPrompt({
        name: pet.name,
        breed: pet.breed,
        gender: pet.gender,
        dob: pet.dob,
        weight: pet.weight,
        healthStatus: pet.healthStatus,
        isLostMode: pet.isLostMode,
    });

    let answer: string;

    try {
        const model = gemini.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            },
        });

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(question);
        const response = result.response;

        answer = response.text().trim() || 'I was unable to generate a response. Please try again.';
    } catch (error) {
        logger.error('Gemini API error:', error);

        // Detect rate-limit / quota errors from Gemini
        const errMsg = error instanceof Error ? error.message : '';
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('retry')) {
            throw new BadRequestError(
                'Gemini API quota exceeded. Please wait a few seconds and try again.',
            );
        }

        throw new BadRequestError(
            'AI service is temporarily unavailable. Please try again later.',
        );
    }

    // ── Store chat history ─────────────────────────────
    const chatRecord = await PetChatHistory.create({
        petId,
        userId,
        question,
        answer,
    });

    logger.info(`🤖 AI advice generated for pet "${pet.name}" (${petId}) by user ${userId}`);

    // ── Remaining rate limit info ──────────────────────
    const remaining = Math.max(0, AI_RATE_LIMIT_MAX - currentCount);

    return {
        answer,
        chatId: chatRecord._id,
        pet: {
            _id: pet._id,
            name: pet.name,
            breed: pet.breed,
        },
        rateLimit: {
            remaining,
            limit: AI_RATE_LIMIT_MAX,
            windowMinutes: AI_RATE_LIMIT_WINDOW / 60,
        },
    };
};

/**
 * Get chat history for a specific pet.
 * Only the pet owner can access.
 */
export const getChatHistory = async (
    petId: string,
    userId: string,
    page = 1,
    limit = 20,
) => {
    // Verify ownership
    const pet = await Pet.findById(petId);
    if (!pet) {
        throw new NotFoundError('Pet not found');
    }
    if (pet.ownerId.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to view this chat history');
    }

    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
        PetChatHistory.find({ petId, userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        PetChatHistory.countDocuments({ petId, userId }),
    ]);

    return {
        chats,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
