import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IPetChatHistory extends Document {
    petId: Types.ObjectId;
    userId: Types.ObjectId;
    question: string;
    answer: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const PetChatHistorySchema = new Schema<IPetChatHistory>(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: [true, 'Pet ID is required'],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
            maxlength: [2000, 'Question cannot exceed 2000 characters'],
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
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
PetChatHistorySchema.index({ userId: 1, createdAt: -1 });
PetChatHistorySchema.index({ petId: 1, createdAt: -1 });

// ─── Model ───────────────────────────────────────────
const PetChatHistory: Model<IPetChatHistory> =
    mongoose.models.PetChatHistory ||
    mongoose.model<IPetChatHistory>('PetChatHistory', PetChatHistorySchema);

export default PetChatHistory;
