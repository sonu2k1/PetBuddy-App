import { z } from 'zod';

export const petAdviceSchema = z.object({
    petId: z
        .string()
        .trim()
        .length(24, 'Invalid pet ID'),
    question: z
        .string()
        .trim()
        .min(3, 'Question must be at least 3 characters')
        .max(2000, 'Question cannot exceed 2000 characters'),
});

export type PetAdviceInput = z.infer<typeof petAdviceSchema>;
