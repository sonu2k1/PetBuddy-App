import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Order Item Sub-Interface ────────────────────────
export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    discount: number;
    quantity: number;
    effectivePrice: number;
}

// ─── Delivery Address Sub-Interface ──────────────────
export interface IDeliveryAddress {
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
}

// ─── Order Interface ─────────────────────────────────
export interface IOrder extends Document {
    userId: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    deliveryAddress: IDeliveryAddress;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-Schemas ─────────────────────────────────────
const OrderItemSchema = new Schema<IOrderItem>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        quantity: { type: Number, required: true, min: 1 },
        effectivePrice: { type: Number, required: true },
    },
    { _id: false },
);

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        line1: { type: String, required: true, trim: true },
        line2: { type: String, default: '', trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
    },
    { _id: false },
);

// ─── Order Schema ────────────────────────────────────
const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have at least one item'],
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryAddress: {
            type: DeliveryAddressSchema,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'placed',
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

// ─── Indexes ─────────────────────────────────────────
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// ─── Model ───────────────────────────────────────────
const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
