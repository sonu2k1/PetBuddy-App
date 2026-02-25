import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IBooking extends Document {
    userId: Types.ObjectId;
    serviceName: string;
    date: Date;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        serviceName: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            maxlength: [100, 'Service name cannot exceed 100 characters'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        notes: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
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
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ date: 1, timeSlot: 1, serviceName: 1 });
BookingSchema.index({ serviceName: 1, status: 1 });

// ─── Model ───────────────────────────────────────────
const Booking: Model<IBooking> =
    mongoose.models.Booking ||
    mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
