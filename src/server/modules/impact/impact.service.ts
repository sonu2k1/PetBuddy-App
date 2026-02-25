import ImpactFund, { IImpactFund } from './impact.model';
import { UpdateImpactInput, ImpactListQuery } from './impact.schema';
import {
    NotFoundError,
    BadRequestError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Create an impact fund entry from an order.
 * Called internally when an order is placed.
 */
export const createImpactFromOrder = async (
    orderId: string,
    orderTotal: number,
    percentage: number = 2,
): Promise<IImpactFund> => {
    const amount = Math.round(orderTotal * (percentage / 100) * 100) / 100;

    const fund = await ImpactFund.create({
        sourceOrderId: orderId,
        percentageAllocated: percentage,
        amount,
        usedFor: '',
        status: 'pending',
    });

    logger.info(`💚 Impact fund created: ₹${amount} from order ${orderId} (${percentage}%)`);
    return fund;
};

/**
 * Admin: List all impact fund entries with filters.
 */
export const getImpactFunds = async (query: ImpactListQuery) => {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [funds, total, stats] = await Promise.all([
        ImpactFund.find(filter)
            .populate('sourceOrderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ImpactFund.countDocuments(filter),
        // Aggregated stats
        ImpactFund.aggregate([
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    // Build summary
    const summary = {
        totalCollected: 0,
        totalDisbursed: 0,
        totalPending: 0,
        totalAllocated: 0,
        fundCount: 0,
    };

    for (const s of stats) {
        const group = s as { _id: string; totalAmount: number; count: number };
        summary.fundCount += group.count;
        summary.totalCollected += group.totalAmount;
        if (group._id === 'disbursed') summary.totalDisbursed = group.totalAmount;
        if (group._id === 'pending') summary.totalPending = group.totalAmount;
        if (group._id === 'allocated') summary.totalAllocated = group.totalAmount;
    }

    // Round
    summary.totalCollected = Math.round(summary.totalCollected * 100) / 100;
    summary.totalDisbursed = Math.round(summary.totalDisbursed * 100) / 100;
    summary.totalPending = Math.round(summary.totalPending * 100) / 100;
    summary.totalAllocated = Math.round(summary.totalAllocated * 100) / 100;

    return {
        funds,
        summary,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Admin: Update an impact fund entry (set usage description, change status).
 */
export const updateImpactFund = async (
    fundId: string,
    data: UpdateImpactInput,
): Promise<IImpactFund> => {
    if (Object.keys(data).length === 0) {
        throw new BadRequestError('At least one field is required for update');
    }

    const fund = await ImpactFund.findByIdAndUpdate(
        fundId,
        { $set: data },
        { new: true, runValidators: true },
    );

    if (!fund) {
        throw new NotFoundError('Impact fund entry not found');
    }

    logger.info(`💚 Impact fund updated: ${fundId} → status: ${fund.status}, usedFor: "${fund.usedFor}"`);
    return fund;
};
