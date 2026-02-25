import Post, { IPost } from './post.model';
import {
    CreatePostInput,
    AddCommentInput,
    ReportPostInput,
    PostListQuery,
} from './post.schema';
import { moderateContent, sanitizeContent } from './moderation';
import {
    NotFoundError,
    BadRequestError,
    ConflictError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Constants ───────────────────────────────────────
const AUTO_HIDE_REPORT_COUNT = 5;

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Create a post with content moderation.
 */
export const createPost = async (
    userId: string,
    data: CreatePostInput,
): Promise<IPost> => {
    // ── Content moderation ─────────────────────────────
    const moderation = await moderateContent(data.content);

    if (!moderation.isClean && moderation.toxicityScore >= 0.8) {
        throw new BadRequestError(
            'Your post was flagged for inappropriate content. Please revise and try again.',
        );
    }

    // Sanitize mild bad words
    const sanitizedContent = sanitizeContent(data.content);

    const post = await Post.create({
        authorId: userId,
        content: sanitizedContent,
        imageUrl: data.imageUrl || '',
        category: data.category,
        isHidden: !moderation.isClean, // auto-hide borderline content for review
        moderationScore: moderation.toxicityScore,
    });

    if (!moderation.isClean) {
        logger.warn(
            `🛡️ Post ${post._id} auto-hidden — score: ${moderation.toxicityScore}, reason: ${moderation.aiReason}`,
        );
    }

    logger.info(`📝 Post created: ${post._id} by user ${userId} [category: ${data.category}]`);
    return post;
};

/**
 * List community posts (only visible ones).
 */
export const getPosts = async (query: PostListQuery) => {
    const { category, page, limit } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isHidden: false };
    if (category) filter.category = category;

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate('authorId', 'name phone')
            .populate('comments.userId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Post.countDocuments(filter),
    ]);

    // Add computed fields
    const postsWithMeta = posts.map((p) => ({
        ...p,
        likesCount: p.likes?.length || 0,
        commentsCount: p.comments?.length || 0,
    }));

    return {
        posts: postsWithMeta,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Add a comment to a post. Moderates comment content.
 */
export const addComment = async (
    postId: string,
    userId: string,
    data: AddCommentInput,
): Promise<IPost> => {
    const post = await Post.findById(postId);
    if (!post || post.isHidden) {
        throw new NotFoundError('Post not found');
    }

    // Moderate comment
    const moderation = await moderateContent(data.content);
    if (!moderation.isClean && moderation.toxicityScore >= 0.7) {
        throw new BadRequestError(
            'Your comment was flagged for inappropriate content. Please revise.',
        );
    }

    const sanitizedContent = sanitizeContent(data.content);

    post.comments.push({
        userId: userId as unknown as import('mongoose').Types.ObjectId,
        content: sanitizedContent,
        createdAt: new Date(),
    });

    await post.save();

    logger.info(`💬 Comment added to post ${postId} by user ${userId}`);
    return post;
};

/**
 * Toggle like on a post. If already liked, unlikes it.
 */
export const toggleLike = async (
    postId: string,
    userId: string,
): Promise<{ liked: boolean; likesCount: number }> => {
    const post = await Post.findById(postId);
    if (!post || post.isHidden) {
        throw new NotFoundError('Post not found');
    }

    const userObjId = userId as unknown as import('mongoose').Types.ObjectId;
    const existingIndex = post.likes.findIndex((id) => id.toString() === userId);

    if (existingIndex > -1) {
        // Unlike
        post.likes.splice(existingIndex, 1);
        await post.save();
        return { liked: false, likesCount: post.likes.length };
    }

    // Like
    post.likes.push(userObjId);
    await post.save();
    return { liked: true, likesCount: post.likes.length };
};

/**
 * Report a post. Auto-hides after threshold reports.
 */
export const reportPost = async (
    postId: string,
    userId: string,
    data: ReportPostInput,
): Promise<{ reported: boolean; message: string }> => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new NotFoundError('Post not found');
    }

    // Check for duplicate report
    const alreadyReported = post.reports.some(
        (r) => r.userId.toString() === userId,
    );
    if (alreadyReported) {
        throw new ConflictError('You have already reported this post');
    }

    post.reports.push({
        userId: userId as unknown as import('mongoose').Types.ObjectId,
        reason: data.reason,
        createdAt: new Date(),
    });

    // Auto-hide if report threshold reached
    if (post.reports.length >= AUTO_HIDE_REPORT_COUNT) {
        post.isHidden = true;
        logger.warn(`🛡️ Post ${postId} auto-hidden — ${post.reports.length} reports`);
    }

    await post.save();

    logger.info(`🚩 Post ${postId} reported by user ${userId}: "${data.reason}"`);
    return {
        reported: true,
        message: post.isHidden
            ? 'Post has been reported and hidden for review.'
            : 'Post has been reported. Thank you for keeping the community safe.',
    };
};
