"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
    Heart,
    MessageSquare,
    Share2,
    Eye,
    MoreHorizontal,
    Plus,
    Loader2,
    User,
    X,
    Image as ImageIcon,
    MapPin,
    Smile,
    Send,
    ChevronRight,
} from "lucide-react";
import { useCommunityPosts, type CommunityPost, api } from "@/hooks/useData";

const CATEGORIES = ["All", "Health", "Adoption", "Rescue"];

const SUGGESTED_TAGS = [
    { label: "#Health", value: "health" },
    { label: "#Adoption", value: "adoption" },
    { label: "#Rescue", value: "rescue" },
    { label: "#Training", value: "tips" },
];

const FALLBACK_POSTS = [
    {
        id: 1,
        user: {
            name: "Dr. Sarah Jenkins",
            role: "Veterinarian",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
            badge: "EXPERT",
            badgeColor: "bg-blue-500",
        },
        time: "2h ago",
        content: "Look at this sweet kitten available for adoption! She's 8 weeks old, vaccinated, and looking for a forever home. Who's ready for a new best friend?",
        hashtags: ["#Rescue", "#KittenAdoption"],
        emoji: "🐱",
        image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&h=400&fit=crop",
        likes: 124,
        comments: 28,
        shares: 15,
        views: null as number | null,
    },
    {
        id: 2,
        user: {
            name: "Mike Thompson",
            role: "Pet Lover",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            badge: null as string | null,
            badgeColor: "",
        },
        time: "5h ago",
        content: "Quick question for the experts: What's the best way to introduce a new puppy to a resident cat who's a bit of a diva? 😄 Any tips for a smooth transition?",
        hashtags: ["#Health", "#Behavior"],
        image: null as string | null,
        likes: 42,
        comments: 56,
        shares: 4,
        views: null as number | null,
    },
    {
        id: 3,
        user: {
            name: "Rescue Network",
            role: "Organization",
            avatar: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop",
            badge: "VERIFIED",
            badgeColor: "bg-green-500",
        },
        time: "1d ago",
        content: "We just took in 4 senior dogs from a local shelter closure. They need immediate dental work and health screenings. Every dollar helps!",
        emoji: "🚨",
        title: "Emergency Fund Drive",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
        fundraiser: {
            goal: "$2,500",
            progress: 65,
        },
        likes: 892,
        comments: 112,
        shares: 230,
        views: null as number | null,
    },
];

/* ═══════════════════════════════════════════════════════
   CREATE POST PAGE (Figma: Bubble UI)
   ═══════════════════════════════════════════════════════ */
function CreatePostPage({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const toggleTag = (value: string) => {
        setSelectedTags((prev) =>
            prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
        );
    };

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError("Write something for your post");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            let imageUrl = "";

            // Step 1: Upload image if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await fetch("/api/v1/upload", {
                    method: "POST",
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok && uploadData?.data?.imageUrl) {
                    imageUrl = uploadData.data.imageUrl;
                }
            }

            // Step 2: Create the post with the uploaded image URL
            const category = selectedTags.length > 0 ? selectedTags[0] : "general";
            await api.post("/posts", {
                content: content.trim(),
                category,
                imageUrl,
            });
            onCreated();
            onClose();
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to create post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const userName = user?.name || "Pet Lover";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-pink-50/90 to-orange-50/90 backdrop-blur-md" />

            {/* Full Page Card */}
            <div className="relative w-full max-w-[430px] h-full bg-gradient-to-b from-[#fef5f5] to-[#fff8f0] flex flex-col overflow-y-auto">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Create Post</h1>
                    <div className="w-9" /> {/* Spacer */}
                </div>

                {/* ── User Info ── */}
                <div className="px-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center shadow-sm">
                            <User className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{userName}</p>
                            <p className="text-[11px] text-gray-400 font-medium">Posting to Dog Lovers Community</p>
                        </div>
                    </div>
                </div>

                {/* ── Content Card ── */}
                <div className="px-5 flex-1 min-h-0">
                    <div className="bg-white rounded-[28px] border border-gray-100/60 shadow-sm p-5 mb-4">
                        {/* Text Area */}
                        <textarea
                            rows={5}
                            value={content}
                            onChange={(e) => { setContent(e.target.value); setError(""); }}
                            placeholder="What's on your mind?"
                            className="w-full border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 resize-none mb-4 leading-relaxed bg-transparent"
                            maxLength={3000}
                        />

                        {/* Action Chips */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-full transition-colors"
                            >
                                <ImageIcon className="w-4 h-4 text-[#F05359]" />
                                <span className="text-xs font-bold text-[#F05359]">Photo/Video</span>
                            </button>
                            <button className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition-colors">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-blue-500">Location</span>
                            </button>
                            <button className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-full transition-colors">
                                <Smile className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-green-500">Feeling</span>
                            </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImagePick}
                            className="hidden"
                        />
                    </div>

                    {/* Image Preview — OUTSIDE the card for visibility */}
                    {imagePreview && (
                        <div className="relative rounded-[24px] overflow-hidden mb-4 border border-gray-100 shadow-sm bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imagePreview}
                                alt="Selected photo"
                                style={{ display: "block", width: "100%", height: "180px", objectFit: "cover" }}
                            />
                            <button
                                onClick={() => { setImagePreview(null); setImageFile(null); }}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                📷 Photo attached
                            </div>
                        </div>
                    )}

                    {/* ── Suggested Tags ── */}
                    <div className="mb-6">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggested Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_TAGS.map((tag) => (
                                <button
                                    key={tag.value}
                                    onClick={() => toggleTag(tag.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95",
                                        selectedTags.includes(tag.value)
                                            ? "bg-[#F05359] text-white border-[#F05359] shadow-md shadow-red-200/40"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200/50 rounded-2xl px-4 py-3 mb-4">
                            <p className="text-xs text-red-500 font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* ── Footer: Post Button ── */}
                <div className="px-5 pb-8 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="w-full bg-gradient-to-r from-[#F05359] to-[#FF7EB3] disabled:from-gray-300 disabled:to-gray-300 text-white font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-xl shadow-pink-300/40 disabled:shadow-none active:scale-[0.97] transition-all text-base"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Post Content
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-3">
                        Posting to Public Feed
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   COMMUNITY SECTION (MAIN)
   ═══════════════════════════════════════════════════════ */
export function CommunitySection() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const { posts: apiPosts, isLoading, refetch } = useCommunityPosts(activeCategory);

    const getAuthorName = (post: CommunityPost) => {
        if (typeof post.authorId === "object" && post.authorId?.name) return post.authorId.name;
        return "Community Member";
    };

    const getTimeAgo = (date: string) => {
        const diffMs = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    // If Create Post page is open, render it instead
    if (showCreatePost) {
        return (
            <CreatePostPage
                onClose={() => setShowCreatePost(false)}
                onCreated={refetch}
            />
        );
    }

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Community</h1>
                <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-[#F05359] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow-lg shadow-red-200 hover:bg-[#e0484e] active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Post
                </button>
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-2">
                <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-full text-sm font-semibold transition-all border",
                                activeCategory === cat
                                    ? "bg-[#F05359] text-white border-[#F05359]"
                                    : "bg-white text-gray-600 border-gray-200"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Post Feed */}
            <main className="pb-32 paw-bg">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#F05359] animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Render API posts if available, otherwise fallback */}
                        {apiPosts.length > 0 ? apiPosts.map((post) => (
                            <div key={post._id} className="px-4 py-4 bg-white rounded-3xl border border-gray-100 bubble-card mb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-[#F05359]/60" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 text-sm">{getAuthorName(post)}</span>
                                            <p className="text-[11px] text-gray-500">{post.category} • {getTimeAgo(post.createdAt)}</p>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-gray-100 rounded-full">
                                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">{post.content}</p>
                                {post.imageUrl && (
                                    <div className="rounded-2xl overflow-hidden mb-3">
                                        <img src={post.imageUrl} alt="Post" className="w-full h-52 object-cover" />
                                    </div>
                                )}
                                <div className="flex items-center gap-5 mt-2">
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
                                        <Heart className="w-4 h-4 text-[#F05359]" />
                                        <span className="text-xs font-bold text-[#F05359]">{post.likes.length}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-blue-500">{post.comments.length}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            /* Fallback static posts */
                            FALLBACK_POSTS.map((post) => (
                                <div key={post.id} className="px-4 py-4 bg-white rounded-3xl border border-gray-100 bubble-card mb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">{post.user.name}</span>
                                                    {post.user.badge && (
                                                        <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded ${post.user.badgeColor}`}>
                                                            {post.user.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500">{post.user.role} • {post.time}</p>
                                            </div>
                                        </div>
                                        <button className="p-1 hover:bg-gray-100 rounded-full">
                                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{post.content}</p>
                                    {post.hashtags && (
                                        <p className="text-sm mb-3">
                                            {post.hashtags.map((tag) => (
                                                <span key={tag} className="text-blue-500 font-medium mr-2">{tag}</span>
                                            ))}
                                        </p>
                                    )}
                                    {post.image && (
                                        <div className="rounded-2xl overflow-hidden mb-3">
                                            <img src={post.image} alt="Post" className="w-full h-52 object-cover" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-5 mt-2">
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
                                            <Heart className="w-4 h-4 text-[#F05359] fill-[#F05359]" />
                                            <span className="text-xs font-bold text-[#F05359]">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-bold text-blue-500">{post.comments}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-xs font-bold">{post.shares}</span>
                                        </button>
                                        {post.views && (
                                            <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
                                                <Eye className="w-4 h-4" />
                                                <span className="text-xs">{post.views}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </>
    );
}
