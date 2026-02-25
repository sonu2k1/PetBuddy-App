import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── GeoJSON Point Interface ─────────────────────────
export interface IGeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// ─── Interface ───────────────────────────────────────
export interface IRescueReport extends Document {
    reporterId: Types.ObjectId;
    location: IGeoPoint;
    address: string;
    photoUrl: string;
    description: string;
    status: 'pending' | 'verified' | 'in-progress' | 'rescued';
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const GeoPointSchema = new Schema<IGeoPoint>(
    {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required'],
            validate: {
                validator: (coords: number[]) =>
                    coords.length === 2 &&
                    coords[0] >= -180 && coords[0] <= 180 &&
                    coords[1] >= -90 && coords[1] <= 90,
                message: 'Invalid coordinates. Must be [longitude, latitude] within valid range.',
            },
        },
    },
    { _id: false },
);

const RescueReportSchema = new Schema<IRescueReport>(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter ID is required'],
            index: true,
        },
        location: {
            type: GeoPointSchema,
            required: [true, 'Location is required'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters'],
        },
        photoUrl: {
            type: String,
            default: '',
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'verified', 'in-progress', 'rescued'],
            default: 'pending',
        },
        verified: {
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

// ─── Geo Index (2dsphere) ────────────────────────────
RescueReportSchema.index({ location: '2dsphere' });
RescueReportSchema.index({ status: 1, createdAt: -1 });
RescueReportSchema.index({ reporterId: 1, createdAt: -1 });

// ─── Model ───────────────────────────────────────────
const RescueReport: Model<IRescueReport> =
    mongoose.models.RescueReport ||
    mongoose.model<IRescueReport>('RescueReport', RescueReportSchema);

export default RescueReport;
