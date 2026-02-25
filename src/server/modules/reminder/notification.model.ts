import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface INotification extends Document {
    userId: Types.ObjectId;
    petId: Types.ObjectId;
    reminderId: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: true,
        },
        reminderId: {
            type: Schema.Types.ObjectId,
            ref: 'Reminder',
            required: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
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
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// ─── Model ───────────────────────────────────────────
const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
