import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IReminder extends Document {
    userId: Types.ObjectId;
    petId: Types.ObjectId;
    type: string;
    scheduledAt: Date;
    repeat: 'daily' | 'weekly' | 'monthly' | 'none';
    isActive: boolean;
    lastTriggeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const ReminderSchema = new Schema<IReminder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: [true, 'Pet ID is required'],
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Reminder type is required'],
            trim: true,
            maxlength: [100, 'Type cannot exceed 100 characters'],
        },
        scheduledAt: {
            type: Date,
            required: [true, 'Scheduled date is required'],
        },
        repeat: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'none'],
            default: 'none',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastTriggeredAt: {
            type: Date,
            default: null,
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
ReminderSchema.index({ userId: 1, isActive: 1 });
ReminderSchema.index({ isActive: 1, scheduledAt: 1 });
ReminderSchema.index({ petId: 1 });

// ─── Model ───────────────────────────────────────────
const Reminder: Model<IReminder> =
    mongoose.models.Reminder ||
    mongoose.model<IReminder>('Reminder', ReminderSchema);

export default Reminder;
