import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IImpactFund extends Document {
    sourceOrderId: Types.ObjectId;
    percentageAllocated: number;
    amount: number;
    usedFor: string;
    status: 'pending' | 'allocated' | 'disbursed';
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const ImpactFundSchema = new Schema<IImpactFund>(
    {
        sourceOrderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Source order ID is required'],
            index: true,
        },
        percentageAllocated: {
            type: Number,
            required: [true, 'Percentage allocated is required'],
            min: [0, 'Percentage cannot be negative'],
            max: [100, 'Percentage cannot exceed 100'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        usedFor: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'allocated', 'disbursed'],
            default: 'pending',
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
ImpactFundSchema.index({ status: 1, createdAt: -1 });
ImpactFundSchema.index({ sourceOrderId: 1 });

// ─── Model ───────────────────────────────────────────
const ImpactFund: Model<IImpactFund> =
    mongoose.models.ImpactFund ||
    mongoose.model<IImpactFund>('ImpactFund', ImpactFundSchema);

export default ImpactFund;
