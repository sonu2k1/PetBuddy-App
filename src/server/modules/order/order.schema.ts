import { z } from 'zod';

// ─── Add / Update Cart ──────────────────────────────
export const updateCartSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string().trim().length(24, 'Invalid product ID'),
            quantity: z.number().int().min(0, 'Quantity must be 0 or more').max(50, 'Max 50 per item'),
        }),
    ).min(1, 'At least one item is required'),
});

// ─── Create Order ────────────────────────────────────
export const createOrderSchema = z.object({
    deliveryAddress: z.object({
        fullName: z.string().trim().min(1, 'Full name is required').max(100),
        phone: z.string().trim().min(10, 'Invalid phone number').max(15),
        line1: z.string().trim().min(1, 'Address line 1 is required').max(200),
        line2: z.string().trim().max(200).optional().default(''),
        city: z.string().trim().min(1, 'City is required').max(100),
        state: z.string().trim().min(1, 'State is required').max(100),
        pincode: z.string().trim().min(5, 'Invalid pincode').max(10),
    }),
});

export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
