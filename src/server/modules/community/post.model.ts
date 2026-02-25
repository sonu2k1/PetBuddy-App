import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Sub-Interfaces ──────────────────────────────────
export interface IComment {
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface IReport {
    userId: Types.ObjectId;
    reason: string;
    createdAt: Date;
}

// ─── Post Interface ──────────────────────────────────
export interface IPost extends Document {
    authorId: Types.ObjectId;
    content: string;
    imageUrl: string;
    category: string;
    likes: Types.ObjectId[];
    comments: IComment[];
    reports: IReport[];
    isHidden: boolean;
    moderationScore: number;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-Schemas ─────────────────────────────────────
const CommentSchema = new Schema<IComment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true },
);

const ReportSchema = new Schema<IReport>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: {
            type: String,
            required: [true, 'Report reason is required'],
            trim: true,
            maxlength: [300, 'Reason cannot exceed 300 characters'],
        },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true },
);

// ─── Post Schema ─────────────────────────────────────
const PostSchema = new Schema<IPost>(
    {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author ID is required'],
            index: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            trim: true,
            maxlength: [3000, 'Post content cannot exceed 3000 characters'],
        },
        imageUrl: {
            type: String,
            default: '',
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            index: true,
        },
        likes: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
        comments: {
            type: [CommentSchema],
            default: [],
        },
        reports: {
            type: [ReportSchema],
            default: [],
        },
        isHidden: {
            type: Boolean,
            default: false,
        },
        moderationScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 1,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const obj = ret as Record<string, unknown>;
                delete obj.__v;
                delete obj.reports; // hide reports from public view
                return obj;
            },
        },
    },
);

// ─── Indexes ─────────────────────────────────────────
PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ isHidden: 1, createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });

// ─── Model ───────────────────────────────────────────
const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
