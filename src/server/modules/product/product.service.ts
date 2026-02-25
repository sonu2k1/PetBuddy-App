import Product, { IProduct } from './product.model';
import { ProductListQuery } from './product.schema';
import { getRedisClient } from '@/server/config/redis';
import { NotFoundError } from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Cache Constants ─────────────────────────────────
const CACHE_TTL = 300;  // 5 minutes
const CACHE_PREFIX = 'products';

/** Build a deterministic cache key from query params */
const buildCacheKey = (query: ProductListQuery): string => {
    const parts = [
        CACHE_PREFIX,
        `p:${query.page}`,
        `l:${query.limit}`,
        `s:${query.sortBy}:${query.sortOrder}`,
    ];
    if (query.pincode) parts.push(`pin:${query.pincode}`);
    if (query.category) parts.push(`cat:${query.category}`);
    if (query.search) parts.push(`q:${query.search}`);
    return parts.join(':');
};

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * List products with optional pincode filtering.
 * Results are cached in Redis for 5 minutes.
 */
export const getProducts = async (query: ProductListQuery) => {
    const redis = getRedisClient();
    const cacheKey = buildCacheKey(query);

    // ── Check cache ────────────────────────────────────
    const cached = await redis.get(cacheKey);
    if (cached) {
        logger.debug(`📦 Products cache HIT: ${cacheKey}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    logger.debug(`📦 Products cache MISS: ${cacheKey}`);

    // ── Build query filter ─────────────────────────────
    const filter: Record<string, unknown> = { isActive: true };

    if (query.pincode) {
        filter.availablePincodes = query.pincode;
    }

    if (query.category) {
        filter.category = query.category;
    }

    if (query.search) {
        filter.$text = { $search: query.search };
    }

    // ── Sort ────────────────────────────────────────────
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = {
        [query.sortBy]: sortDirection,
    };

    // ── Paginate ────────────────────────────────────────
    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(query.limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    // ── Compute effective price ────────────────────────
    const productsWithEffectivePrice = products.map((p) => ({
        ...p,
        effectivePrice: Math.round(p.price * (1 - p.discount / 100) * 100) / 100,
        inStock: p.stock > 0,
    }));

    const result = {
        products: productsWithEffectivePrice,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };

    // ── Store in cache ─────────────────────────────────
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

/**
 * Get a single product by ID.
 * Individual products cached for 5 minutes.
 */
export const getProductById = async (productId: string) => {
    const redis = getRedisClient();
    const cacheKey = `${CACHE_PREFIX}:id:${productId}`;

    // ── Check cache ────────────────────────────────────
    const cached = await redis.get(cacheKey);
    if (cached) {
        logger.debug(`📦 Product cache HIT: ${productId}`);
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    // ── Fetch from DB ──────────────────────────────────
    const product = await Product.findById(productId).lean();
    if (!product || !product.isActive) {
        throw new NotFoundError('Product not found');
    }

    const result = {
        ...product,
        effectivePrice: Math.round(product.price * (1 - product.discount / 100) * 100) / 100,
        inStock: product.stock > 0,
    };

    // ── Store in cache ─────────────────────────────────
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
};

/**
 * Invalidate all product caches.
 * Call this when products are created/updated/deleted (admin ops).
 */
export const invalidateProductCache = async (): Promise<void> => {
    const redis = getRedisClient();
    const keys = await redis.keys(`${CACHE_PREFIX}:*`);
    if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`🗑️  Invalidated ${keys.length} product cache keys`);
    }
};
