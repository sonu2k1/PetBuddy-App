import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interface ───────────────────────────────────────
export interface IProduct extends Document {
    name: string;
    category: string;
    price: number;
    discount: number;
    stock: number;
    deliveryTime: string;
    availablePincodes: string[];
    images: string[];
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────
const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            index: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be non-negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        deliveryTime: {
            type: String,
            required: [true, 'Delivery time is required'],
            trim: true,
        },
        availablePincodes: {
            type: [String],
            default: [],
            index: true,
        },
        images: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
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
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ availablePincodes: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

// ─── Model ───────────────────────────────────────────
const Product: Model<IProduct> =
    mongoose.models.Product ||
    mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
