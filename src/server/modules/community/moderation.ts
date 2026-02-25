/**
 * Content Moderation Module
 *
 * Two-layer approach:
 * 1. Fast bad-word filter (synchronous, regex-based)
 * 2. AI toxicity check via Gemini (async, for borderline content)
 */

import { GoogleGenAI } from '@google/genai';
import { logger } from '@/server/utils/logger';

// ═════════════════════════════════════════════════════
//  LAYER 1: BAD WORD FILTER
// ═════════════════════════════════════════════════════

const BAD_WORDS = [
    // Profanity / slurs (keep this list internal)
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'crap',
    'dick', 'piss', 'slut', 'whore', 'cunt', 'nigger', 'faggot',
    'retard', 'idiot', 'moron', 'stupid',
    // Violence
    'kill', 'murder', 'die', 'suicide',
    // Spam triggers
    'buy now', 'click here', 'free money', 'act now',
];

// Build regex: word boundaries, case-insensitive
const badWordPattern = new RegExp(
    `\\b(${BAD_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi',
);

export interface ModerationResult {
    isClean: boolean;
    flaggedWords: string[];
    toxicityScore: number;
    aiReason: string;
}

/**
 * Fast bad-word check. Returns flagged words found.
 */
export const checkBadWords = (text: string): string[] => {
    const matches = text.match(badWordPattern);
    if (!matches) return [];
    // Deduplicate and lowercase
    return [...new Set(matches.map((m) => m.toLowerCase()))];
};

/**
 * Sanitize text by replacing bad words with asterisks.
 */
export const sanitizeContent = (text: string): string => {
    return text.replace(badWordPattern, (match) => '*'.repeat(match.length));
};

// ═════════════════════════════════════════════════════
//  LAYER 2: AI TOXICITY CHECK (GEMINI)
// ═════════════════════════════════════════════════════

const TOXICITY_PROMPT = `You are a content moderation AI. Analyze the following text for toxicity, harassment, hate speech, spam, or inappropriate content in the context of a pet community app.

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "score": <number between 0.0 and 1.0 where 0 = safe, 1 = highly toxic>,
  "reason": "<brief explanation if score > 0.3, otherwise empty string>"
}

Text to analyze:
`;

/**
 * AI-powered toxicity check using Gemini.
 * Returns a score between 0 (safe) and 1 (toxic).
 */
export const checkToxicity = async (
    text: string,
): Promise<{ score: number; reason: string }> => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

        if (!apiKey) {
            logger.warn('GEMINI_API_KEY not set — skipping AI toxicity check');
            return { score: 0, reason: '' };
        }

        const ai = new GoogleGenAI({ apiKey });

        const result = await ai.models.generateContent({
            model: modelName,
            contents: TOXICITY_PROMPT + text,
        });

        const responseText = result.text?.trim() || '';

        // Parse JSON response
        const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            score: Math.min(1, Math.max(0, Number(parsed.score) || 0)),
            reason: String(parsed.reason || ''),
        };
    } catch (error) {
        logger.error('AI toxicity check failed:', error);
        // Fail open — don't block content if AI is unavailable
        return { score: 0, reason: '' };
    }
};

// ═════════════════════════════════════════════════════
//  COMBINED MODERATION
// ═════════════════════════════════════════════════════

const BAD_WORD_THRESHOLD = 2;       // Auto-reject if ≥ 2 bad words
const TOXICITY_SCORE_THRESHOLD = 0.6; // Auto-hide if AI score ≥ 0.6

/**
 * Full moderation pipeline:
 * 1. Check for bad words
 * 2. If borderline, run AI toxicity check
 * 3. Return combined result
 */
export const moderateContent = async (text: string): Promise<ModerationResult> => {
    // ── Step 1: bad word filter ────────────────────────
    const flaggedWords = checkBadWords(text);

    // Immediate reject if too many bad words
    if (flaggedWords.length >= BAD_WORD_THRESHOLD) {
        return {
            isClean: false,
            flaggedWords,
            toxicityScore: 1,
            aiReason: `Contains prohibited words: ${flaggedWords.join(', ')}`,
        };
    }

    // ── Step 2: AI toxicity check ──────────────────────
    // Only run AI check if there are some flags or content is long
    const needsAiCheck = flaggedWords.length > 0 || text.length > 200;

    let toxicityScore = 0;
    let aiReason = '';

    if (needsAiCheck) {
        const aiResult = await checkToxicity(text);
        toxicityScore = aiResult.score;
        aiReason = aiResult.reason;
    }

    // ── Determine result ───────────────────────────────
    const isClean = flaggedWords.length === 0 && toxicityScore < TOXICITY_SCORE_THRESHOLD;

    return {
        isClean,
        flaggedWords,
        toxicityScore,
        aiReason,
    };
};
