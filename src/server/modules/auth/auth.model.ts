import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ──────────────────────────────────────
export interface IRefreshToken {
    token: string;
    sessionId: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface IUser extends Document {
    phone: string;
    name: string;
    role: 'user' | 'expert' | 'organization';
    isVerified: boolean;
    activeSessionId: string | null;
    refreshTokens: IRefreshToken[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── Refresh Token Sub-Schema ────────────────────────
const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: { type: String, required: true },
        sessionId: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    { _id: false },
);

// ─── User Schema ─────────────────────────────────────
const UserSchema = new Schema<IUser>(
    {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            default: '',
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        role: {
            type: String,
            enum: ['user', 'expert', 'organization'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        activeSessionId: {
            type: String,
            default: null,
        },
        refreshTokens: {
            type: [RefreshTokenSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const obj = ret as Record<string, unknown>;
                delete obj.__v;
                delete obj.refreshTokens;
                return obj;
            },
        },
    },
);

// ─── Indexes ─────────────────────────────────────────
UserSchema.index({ 'refreshTokens.token': 1 });
UserSchema.index({ 'refreshTokens.expiresAt': 1 }, { expireAfterSeconds: 0 });

// ─── Model ───────────────────────────────────────────
// Prevent model re-compilation during Next.js hot reload
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
