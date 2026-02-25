import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IHealthRecord extends Document {
    petId: Types.ObjectId;
    type: 'vaccination' | 'weight' | 'treatment';
    date: Date;
    notes: string;
    documentUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const HealthRecordSchema = new Schema<IHealthRecord>(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: [true, 'Pet ID is required'],
            index: true,
        },
        type: {
            type: String,
            enum: ['vaccination', 'weight', 'treatment'],
            required: [true, 'Record type is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        notes: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
        documentUrl: {
            type: String,
            default: null,
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
HealthRecordSchema.index({ petId: 1, date: -1 });
HealthRecordSchema.index({ petId: 1, type: 1 });

// ─── Model ───────────────────────────────────────────
const HealthRecord: Model<IHealthRecord> =
    mongoose.models.HealthRecord ||
    mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);

export default HealthRecord;
