import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Cart Item Sub-Interface ─────────────────────────
export interface ICartItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    discount: number;
    quantity: number;
}

// ─── Cart Interface ──────────────────────────────────
export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Cart Item Sub-Schema ────────────────────────────
const CartItemSchema = new Schema<ICartItem>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            max: [50, 'Quantity cannot exceed 50'],
        },
    },
    { _id: false },
);

// ─── Cart Schema ─────────────────────────────────────
const CartSchema = new Schema<ICart>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: {
            type: [CartItemSchema],
            default: [],
        },
        total: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const obj = ret as Record<string, unknown>;
                delete obj.__v;
                return obj;
            },
        },
    },
);

// ─── Model ───────────────────────────────────────────
const Cart: Model<ICart> =
    mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
