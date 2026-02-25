import Cart, { ICart, ICartItem } from './cart.model';
import Order, { IOrder } from './order.model';
import Product from '../product/product.model';
import { UpdateCartInput, CreateOrderInput } from './order.schema';
import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ═════════════════════════════════════════════════════
//  CART SERVICE
// ═════════════════════════════════════════════════════

/** Recalculate cart total from items */
const recalcTotal = (items: ICartItem[]): number => {
    return items.reduce((sum, item) => {
        const effective = item.price * (1 - item.discount / 100);
        return sum + effective * item.quantity;
    }, 0);
};

/**
 * Update cart — sets items (quantity 0 removes the item).
 * Validates product existence and stock.
 */
export const updateCart = async (
    userId: string,
    data: UpdateCartInput,
): Promise<ICart> => {
    // Fetch all referenced products in one query
    const productIds = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Validate & build cart items
    const cartItems: ICartItem[] = [];

    for (const item of data.items) {
        if (item.quantity === 0) continue; // quantity 0 = remove

        const product = productMap.get(item.productId);
        if (!product) {
            throw new NotFoundError(`Product ${item.productId} not found or inactive`);
        }
        if (product.stock < item.quantity) {
            throw new BadRequestError(
                `Insufficient stock for "${product.name}". Available: ${product.stock}`,
            );
        }

        cartItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            quantity: item.quantity,
        });
    }

    const total = Math.round(recalcTotal(cartItems) * 100) / 100;

    // Upsert cart (one cart per user)
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: cartItems, total } },
        { new: true, upsert: true, runValidators: true },
    );

    logger.info(`🛒 Cart updated for user ${userId} — ${cartItems.length} items, ₹${total}`);
    return cart;
};

/**
 * Get user's cart. Returns empty cart if none exists.
 */
export const getCart = async (userId: string): Promise<ICart> => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [], total: 0 });
    }
    return cart;
};

// ═════════════════════════════════════════════════════
//  ORDER SERVICE
// ═════════════════════════════════════════════════════

/**
 * Create an order from the user's cart.
 * - Validates stock for every item at checkout time
 * - Atomically decrements stock
 * - Clears the cart after order placement
 */
export const createOrder = async (
    userId: string,
    data: CreateOrderInput,
): Promise<IOrder> => {
    // ── Get cart ────────────────────────────────────────
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty. Add items before placing an order.');
    }

    // ── Stock validation (re-check at order time) ──────
    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    const stockUpdates = [];

    for (const item of cart.items) {
        const product = productMap.get(item.productId.toString());
        if (!product) {
            throw new ConflictError(
                `Product "${item.name}" is no longer available. Please update your cart.`,
            );
        }
        if (product.stock < item.quantity) {
            throw new ConflictError(
                `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            );
        }

        const effectivePrice = Math.round(product.price * (1 - product.discount / 100) * 100) / 100;

        orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            quantity: item.quantity,
            effectivePrice,
        });

        stockUpdates.push({
            updateOne: {
                filter: { _id: product._id, stock: { $gte: item.quantity } },
                update: { $inc: { stock: -item.quantity } },
            },
        });
    }

    // ── Atomically decrement stock ─────────────────────
    const bulkResult = await Product.bulkWrite(stockUpdates);
    if (bulkResult.modifiedCount !== stockUpdates.length) {
        throw new ConflictError(
            'Stock changed while placing order. Please refresh your cart and try again.',
        );
    }

    // ── Calculate total ────────────────────────────────
    const totalAmount = Math.round(
        orderItems.reduce((sum, i) => sum + i.effectivePrice * i.quantity, 0) * 100,
    ) / 100;

    // ── Create order ───────────────────────────────────
    const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        deliveryAddress: data.deliveryAddress,
        paymentStatus: 'pending',
        status: 'placed',
    });

    // ── Clear cart ─────────────────────────────────────
    cart.items = [];
    cart.total = 0;
    await cart.save();

    logger.info(`📦 Order placed: ${order._id} by user ${userId} — ₹${totalAmount}`);

    // ── Create impact fund (2% of order) ──────────────
    try {
        const { createImpactFromOrder } = await import('../impact/impact.service');
        await createImpactFromOrder(order._id.toString(), totalAmount);
    } catch (err) {
        logger.error('Failed to create impact fund entry:', err);
    }

    return order;
};

/**
 * Get all orders for the authenticated user.
 */
export const getUserOrders = async (
    userId: string,
    page = 1,
    limit = 20,
) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments({ userId }),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
