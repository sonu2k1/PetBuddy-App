import { NextRequest } from 'next/server';
import { bootstrap } from '@/server/bootstrap';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { logRequest } from '@/server/middlewares/httpLogger';
import { sendSuccess } from '@/server/utils/apiResponse';
import Product from '@/server/modules/product/product.model';
import { logger } from '@/server/utils/logger';

const SEED_PRODUCTS = [
    {
        name: 'Premium Adult Chicken & Rice',
        category: 'food',
        price: 489,
        discount: 12,
        stock: 50,
        deliveryTime: 'Today, 15m',
        images: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop'],
        description: 'High-quality adult dog food with real chicken and rice for balanced nutrition.',
        availablePincodes: ['208001', '208002', '208003'],
        isActive: true,
    },
    {
        name: 'Durable Rubber Chew Toy',
        category: 'toys',
        price: 650,
        discount: 0,
        stock: 35,
        deliveryTime: 'Today, 30m',
        images: ['https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=300&h=300&fit=crop'],
        description: 'Tough chew toy for aggressive chewers made from 100% natural rubber.',
        availablePincodes: ['208001', '208002'],
        isActive: true,
    },
    {
        name: 'Savory Salmon Cat Treats',
        category: 'food',
        price: 185,
        discount: 15,
        stock: 45,
        deliveryTime: 'Today, 20m',
        images: ['https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=300&h=300&fit=crop'],
        description: 'Premium salmon-flavored cat treats rich in Omega-3 and Omega-6 fatty acids.',
        availablePincodes: ['208001', '208002', '208003'],
        isActive: true,
    },
    {
        name: 'Oatmeal Pet Shampoo',
        category: 'grooming',
        price: 245,
        discount: 10,
        stock: 30,
        deliveryTime: 'Today, 25m',
        images: ['https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=300&h=300&fit=crop'],
        description: 'Gentle oatmeal shampoo for sensitive skin. Paraben-free and cruelty-free.',
        availablePincodes: ['208001', '208002', '208003'],
        isActive: true,
    },
    {
        name: 'Pedigree Dentastix',
        category: 'health',
        price: 320,
        discount: 20,
        stock: 18,
        deliveryTime: 'Today, 15m',
        images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'],
        description: 'Daily oral care treats clinically proven to reduce tartar buildup by up to 80%.',
        availablePincodes: ['208001', '208002'],
        isActive: true,
    },
    {
        name: 'Adjustable Pet Harness',
        category: 'gear',
        price: 799,
        discount: 5,
        stock: 8,
        deliveryTime: 'Tomorrow',
        images: ['https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=300&h=300&fit=crop'],
        description: 'Comfortable and breathable pet harness with reflective strips for night visibility.',
        availablePincodes: ['208001', '208002', '208003'],
        isActive: true,
    },
    {
        name: 'Interactive Puzzle Feeder',
        category: 'toys',
        price: 450,
        discount: 8,
        stock: 22,
        deliveryTime: 'Today, 20m',
        images: ['https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop'],
        description: 'Stimulate your pet\'s brain with this interactive puzzle food dispenser toy.',
        availablePincodes: ['208001', '208002'],
        isActive: true,
    },
    {
        name: 'Premium Flea & Tick Collar',
        category: 'health',
        price: 550,
        discount: 15,
        stock: 40,
        deliveryTime: 'Today, 15m',
        images: ['https://images.unsplash.com/photo-1587764379284-e849ce1dba53?w=300&h=300&fit=crop'],
        description: 'Long-lasting protection against fleas and ticks for up to 8 months.',
        availablePincodes: ['208001', '208002', '208003'],
        isActive: true,
    },
];

// ─── POST /api/v1/seed/products — Seed products into DB ──
export const POST = withErrorHandler(async (req: NextRequest) => {
    logRequest(req);
    await bootstrap();

    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
        return sendSuccess(`Products already exist (${existingCount} found). Skipping seed.`, {
            seeded: false,
            existingCount,
        });
    }

    // Insert seed products
    const inserted = await Product.insertMany(SEED_PRODUCTS);
    logger.info(`🌱 Seeded ${inserted.length} products into the database`);

    return sendSuccess(`Successfully seeded ${inserted.length} products`, {
        seeded: true,
        count: inserted.length,
        products: inserted.map((p) => ({ _id: p._id, name: p.name, category: p.category })),
    }, 201);
});
