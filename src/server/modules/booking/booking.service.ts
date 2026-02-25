import Booking, { IBooking } from './booking.model';
import {
    CreateBookingInput,
    SlotsQueryInput,
    TIME_SLOTS,
    MAX_BOOKINGS_PER_SLOT,
} from './booking.schema';
import {
    BadRequestError,
    ConflictError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Get available slots for a given service and date.
 * Returns all time slots with their availability status.
 */
export const getAvailableSlots = async (query: SlotsQueryInput) => {
    const { serviceName, date } = query;

    // Normalise to start of day
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    // Count bookings per slot for that date + service
    const bookings = await Booking.aggregate([
        {
            $match: {
                serviceName,
                date: { $gte: dateStart, $lt: dateEnd },
                status: { $nin: ['cancelled'] },
            },
        },
        {
            $group: {
                _id: '$timeSlot',
                count: { $sum: 1 },
            },
        },
    ]);

    const bookingMap = new Map<string, number>(
        bookings.map((b: { _id: string; count: number }) => [b._id, b.count]),
    );

    // Build slot availability
    const slots = TIME_SLOTS.map((slot) => {
        const booked = bookingMap.get(slot) || 0;
        return {
            timeSlot: slot,
            available: booked < MAX_BOOKINGS_PER_SLOT,
            bookedCount: booked,
            maxCapacity: MAX_BOOKINGS_PER_SLOT,
        };
    });

    return {
        serviceName,
        date: dateStart.toISOString().split('T')[0],
        slots,
        totalAvailable: slots.filter((s) => s.available).length,
        totalSlots: slots.length,
    };
};

/**
 * Book a service. Validates slot availability before booking.
 */
export const createBooking = async (
    userId: string,
    data: CreateBookingInput,
): Promise<IBooking> => {
    const { serviceName, date, timeSlot, notes } = data;

    // Normalise date
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const dateEnd = new Date(bookingDate);
    dateEnd.setDate(dateEnd.getDate() + 1);

    // ── Check for duplicate booking by same user ───────
    const existingUserBooking = await Booking.findOne({
        userId,
        serviceName,
        date: { $gte: bookingDate, $lt: dateEnd },
        timeSlot,
        status: { $nin: ['cancelled'] },
    });

    if (existingUserBooking) {
        throw new ConflictError(
            'You already have a booking for this service at the selected time.',
        );
    }

    // ── Check slot capacity ────────────────────────────
    const slotCount = await Booking.countDocuments({
        serviceName,
        date: { $gte: bookingDate, $lt: dateEnd },
        timeSlot,
        status: { $nin: ['cancelled'] },
    });

    if (slotCount >= MAX_BOOKINGS_PER_SLOT) {
        throw new BadRequestError(
            `This time slot is fully booked. Please choose a different slot.`,
        );
    }

    // ── Create booking ─────────────────────────────────
    const booking = await Booking.create({
        userId,
        serviceName,
        date: bookingDate,
        timeSlot,
        notes,
        status: 'pending',
    });

    logger.info(`📅 Booking created: ${serviceName} on ${bookingDate.toISOString().split('T')[0]} at ${timeSlot} for user ${userId}`);
    return booking;
};

/**
 * Get all bookings for the authenticated user.
 */
export const getUserBookings = async (
    userId: string,
    page = 1,
    limit = 20,
    status?: string,
) => {
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        filter.status = status;
    }

    const [bookings, total] = await Promise.all([
        Booking.find(filter)
            .sort({ date: -1, timeSlot: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Booking.countDocuments(filter),
    ]);

    return {
        bookings,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
