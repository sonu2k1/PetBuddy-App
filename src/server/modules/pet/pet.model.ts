import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IPet extends Document {
    ownerId: Types.ObjectId;
    name: string;
    breed: string;
    gender: 'male' | 'female';
    dob: Date;
    weight: number;
    healthStatus: 'healthy' | 'sick' | 'recovering' | 'critical' | 'unknown';
    imageUrl: string | null;
    qrCodeId: string | null;
    isLostMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const PetSchema = new Schema<IPet>(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Pet name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        breed: {
            type: String,
            required: [true, 'Breed is required'],
            trim: true,
            maxlength: [80, 'Breed cannot exceed 80 characters'],
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: [true, 'Gender is required'],
        },
        dob: {
            type: Date,
            required: [true, 'Date of birth is required'],
        },
        weight: {
            type: Number,
            required: [true, 'Weight is required'],
            min: [0.1, 'Weight must be greater than 0'],
            max: [200, 'Weight cannot exceed 200 kg'],
        },
        healthStatus: {
            type: String,
            enum: ['healthy', 'sick', 'recovering', 'critical', 'unknown'],
            default: 'healthy',
        },
        imageUrl: {
            type: String,
            default: null,
        },
        qrCodeId: {
            type: String,
            default: null,
            sparse: true,
        },
        isLostMode: {
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

// ─── Compound Indexes ────────────────────────────────
PetSchema.index({ ownerId: 1, createdAt: -1 });
PetSchema.index({ ownerId: 1, isLostMode: 1 });
PetSchema.index({ qrCodeId: 1 }, { unique: true, sparse: true });

// ─── Model ───────────────────────────────────────────
const Pet: Model<IPet> =
    mongoose.models.Pet || mongoose.model<IPet>('Pet', PetSchema);

export default Pet;
