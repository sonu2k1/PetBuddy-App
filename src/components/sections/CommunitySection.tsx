"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
    Check,
    Link2,
} from "lucide-react";
import { useCommunityPosts, type CommunityPost, api } from "@/hooks/useData";

const FEELINGS = [
    { emoji: "😊", label: "Happy" },
    { emoji: "🎉", label: "Excited" },
    { emoji: "🙏", label: "Grateful" },
    { emoji: "😍", label: "In Love" },
    { emoji: "🤔", label: "Curious" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😟", label: "Worried" },
    { emoji: "🥳", label: "Proud" },
    { emoji: "😴", label: "Tired" },
    { emoji: "🤗", label: "Blessed" },
    { emoji: "😤", label: "Frustrated" },
    { emoji: "🐾", label: "Pawsome" },
];

const CATEGORIES = [
    { label: "All", value: "all" },
    { label: "Health", value: "health" },
    { label: "Adoption", value: "adoption" },
    { label: "Rescue", value: "rescue" },
];

const SUGGESTED_TAGS = [
    { label: "#Health", value: "health" },
    { label: "#Adoption", value: "adoption" },
    { label: "#Rescue", value: "rescue" },
    { label: "#Training", value: "tips" },
];

const FALLBACK_POSTS = [
    {
        id: 1,
        category: "adoption",
        user: {
            name: "Dr. Sarah Jenkins",
            role: "Veterinarian",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
            badge: "EXPERT",
            badgeColor: "bg-blue-500",
        },
        time: "2h ago",
        content: "Look at this sweet kitten available for adoption! She's 8 weeks old, vaccinated, and looking for a forever home. Who's ready for a new best friend?",
        hashtags: ["#Adoption", "#KittenAdoption"],
        emoji: "🐱",
        image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&h=400&fit=crop",
        likes: 124,
        comments: 28,
        shares: 15,
        views: null as number | null,
    },
    {
        id: 2,
        category: "health",
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
        category: "rescue",
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
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════ */
function Toast({ message, type, onDone }: { message: string; type: "success" | "error" | "info"; onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2500);
        return () => clearTimeout(t);
    }, [onDone]);

    const bgClass = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-gray-700";
    const icon = type === "success" ? <Check className="w-4 h-4" /> : type === "error" ? <X className="w-4 h-4" /> : <Link2 className="w-4 h-4" />;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-down">
            <div className={cn("flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl", bgClass)}>
                {icon}
                {message}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   COMMENT DRAWER
   ═══════════════════════════════════════════════════════ */
interface CommentDrawerProps {
    postId: string;
    comments: { _id: string; userId: string | { _id: string; name: string }; content: string; createdAt: string }[];
    onClose: () => void;
    onCommentAdded: (postId: string, newComment: { _id: string; userId: string; content: string; createdAt: string }) => void;
}

function CommentDrawer({ postId, comments, onClose, onCommentAdded }: CommentDrawerProps) {
    const [commentText, setCommentText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Scroll to bottom when comments change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [comments.length]);

    const getCommentUserName = (userId: string | { _id: string; name: string }) => {
        if (typeof userId === "object" && userId?.name) return userId.name;
        return "Community Member";
    };

    const getTimeAgo = (date: string) => {
        const diffMs = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const handleSend = async () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;
        setIsSending(true);
        setError("");
        try {
            const result = await api.post<{ commentsCount: number; latestComment: { _id: string; userId: string; content: string; createdAt: string } }>(
                `/posts/${postId}/comment`,
                { content: trimmed }
            );
            onCommentAdded(postId, result.latestComment);
            setCommentText("");
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to add comment");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] shadow-2xl flex flex-col animate-slide-up" style={{ maxHeight: "75vh" }}>
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
                    <h2 className="text-base font-black text-gray-900">
                        Comments {comments.length > 0 && <span className="text-gray-400 font-semibold text-sm">({comments.length})</span>}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Comment List */}
                <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[120px]">
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <MessageSquare className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">No comments yet</p>
                            <p className="text-xs text-gray-300 mt-1">Be the first to comment! 💬</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <User className="w-3.5 h-3.5 text-[#F05359]/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-gray-900">{getCommentUserName(comment.userId)}</span>
                                        <span className="text-[10px] text-gray-400">{getTimeAgo(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5 break-words">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="px-5 pb-2">
                        <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-xl">{error}</p>
                    </div>
                )}

                {/* Input */}
                <div className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100">
                        <input
                            ref={inputRef}
                            type="text"
                            value={commentText}
                            onChange={(e) => { setCommentText(e.target.value); setError(""); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a comment..."
                            maxLength={500}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isSending || !commentText.trim()}
                            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#F05359] to-[#FF7EB3] disabled:from-gray-200 disabled:to-gray-200 flex items-center justify-center transition-all active:scale-90 shrink-0"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

    // Location state
    const [location, setLocation] = useState<string | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Feeling state
    const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(null);
    const [showFeelingPicker, setShowFeelingPicker] = useState(false);
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

    // ── Location handler ──
    const handleLocation = async () => {
        if (location) {
            setLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsLoadingLocation(true);
        setError("");

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000,
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode — BigDataCloud first (CORS-safe), then server proxy
            try {
                const bdcRes = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                if (bdcRes.ok) {
                    const d = await bdcRes.json();
                    const locality = d.locality || d.neighbourhood || "";
                    const city = d.city || d.county || d.principalSubdivision || "";
                    const label = locality && city && locality !== city ? `${locality}, ${city}` : city || locality || d.countryName || "";
                    setLocation(label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                } else {
                    throw new Error("BigDataCloud failed");
                }
            } catch {
                // Fallback: server-side proxy
                try {
                    const proxyRes = await fetch(`/api/v1/geocode/reverse?lat=${latitude}&lng=${longitude}`);
                    if (proxyRes.ok) {
                        const d = await proxyRes.json();
                        setLocation(d.data?.label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    } else {
                        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch {
                    setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
            }
        } catch (err: unknown) {
            const geoErr = err as GeolocationPositionError;
            if (geoErr.code === 1) {
                setError("Location permission denied. Please allow access in your browser settings.");
            } else if (geoErr.code === 2) {
                setError("Location unavailable. Please try again.");
            } else {
                setError("Failed to get location. Please try again.");
            }
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // ── Feeling handler ──
    const handleFeelingSelect = (feeling: { emoji: string; label: string }) => {
        setSelectedFeeling(feeling);
        setShowFeelingPicker(false);
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

            // Step 2: Build final content with location & feeling
            let finalContent = content.trim();
            if (selectedFeeling) {
                finalContent += `\n\n${selectedFeeling.emoji} Feeling ${selectedFeeling.label}`;
            }
            if (location) {
                finalContent += `\n📍 ${location}`;
            }

            const category = selectedTags.length > 0 ? selectedTags[0] : "general";
            await api.post("/posts", {
                content: finalContent,
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
                            <button
                                onClick={handleLocation}
                                disabled={isLoadingLocation}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-colors",
                                    location
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-blue-50 hover:bg-blue-100"
                                )}
                            >
                                {isLoadingLocation ? (
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                ) : (
                                    <MapPin className={cn("w-4 h-4", location ? "text-white" : "text-blue-500")} />
                                )}
                                <span className={cn("text-xs font-bold", location ? "text-white" : "text-blue-500")}>
                                    {isLoadingLocation ? "Getting..." : location ? "Located" : "Location"}
                                </span>
                            </button>
                            <button
                                onClick={() => setShowFeelingPicker((v) => !v)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-colors",
                                    selectedFeeling
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-green-50 hover:bg-green-100"
                                )}
                            >
                                {selectedFeeling ? (
                                    <span className="text-sm">{selectedFeeling.emoji}</span>
                                ) : (
                                    <Smile className="w-4 h-4 text-green-500" />
                                )}
                                <span className={cn("text-xs font-bold", selectedFeeling ? "text-white" : "text-green-500")}>
                                    {selectedFeeling ? selectedFeeling.label : "Feeling"}
                                </span>
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

                    {/* ── Feeling Picker ── */}
                    {showFeelingPicker && (
                        <div className="bg-white rounded-[24px] border border-gray-100/60 shadow-sm p-4 mb-4 animate-slide-up">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">How are you feeling?</p>
                                <button onClick={() => setShowFeelingPicker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {FEELINGS.map((f) => (
                                    <button
                                        key={f.label}
                                        onClick={() => handleFeelingSelect(f)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all active:scale-90",
                                            selectedFeeling?.label === f.label
                                                ? "bg-green-50 border-green-300 shadow-sm"
                                                : "bg-gray-50/50 border-transparent hover:bg-gray-100"
                                        )}
                                    >
                                        <span className="text-2xl">{f.emoji}</span>
                                        <span className="text-[10px] font-bold text-gray-600">{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Selected Location & Feeling Chips ── */}
                    {(location || selectedFeeling) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {location && (
                                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200/60 px-3 py-2 rounded-full">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs font-semibold text-blue-600 max-w-[180px] truncate">{location}</span>
                                    <button onClick={() => setLocation(null)} className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                                        <X className="w-3 h-3 text-blue-400" />
                                    </button>
                                </div>
                            )}
                            {selectedFeeling && (
                                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200/60 px-3 py-2 rounded-full">
                                    <span className="text-sm">{selectedFeeling.emoji}</span>
                                    <span className="text-xs font-semibold text-green-600">{selectedFeeling.label}</span>
                                    <button onClick={() => setSelectedFeeling(null)} className="ml-0.5 hover:bg-green-100 rounded-full p-0.5 transition-colors">
                                        <X className="w-3 h-3 text-green-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

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
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState("all");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const activeCategoryForApi = activeCategory === "all" ? "All" : activeCategory;
    const { posts: apiPosts, isLoading, refetch } = useCommunityPosts(activeCategoryForApi);

    // ── Local interactive state ──
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [localComments, setLocalComments] = useState<Record<string, CommunityPost["comments"]>>({});
    const [likeAnimations, setLikeAnimations] = useState<Record<string, boolean>>({});
    const [commentDrawerPostId, setCommentDrawerPostId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // ── Fallback local state ──
    const [fallbackLiked, setFallbackLiked] = useState<Record<number, boolean>>({});
    const [fallbackLikeCounts, setFallbackLikeCounts] = useState<Record<number, number>>({});
    const [fallbackShareCounts, setFallbackShareCounts] = useState<Record<number, number>>({});

    // Initialize local state from API data
    useEffect(() => {
        if (apiPosts.length > 0 && user) {
            const liked: Record<string, boolean> = {};
            const counts: Record<string, number> = {};
            const comments: Record<string, CommunityPost["comments"]> = {};
            apiPosts.forEach((post) => {
                liked[post._id] = post.likes.includes(user._id);
                counts[post._id] = post.likes.length;
                comments[post._id] = post.comments;
            });
            setLikedPosts(liked);
            setLikeCounts(counts);
            setLocalComments(comments);
        }
    }, [apiPosts, user]);

    const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
    }, []);

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

    // ── Like handler (API posts) ──
    const handleLike = async (postId: string) => {
        // Optimistic update
        const wasLiked = likedPosts[postId] || false;
        setLikedPosts((prev) => ({ ...prev, [postId]: !wasLiked }));
        setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? -1 : 1) }));

        // Trigger animation
        setLikeAnimations((prev) => ({ ...prev, [postId]: true }));
        setTimeout(() => setLikeAnimations((prev) => ({ ...prev, [postId]: false })), 600);

        try {
            const result = await api.post<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`);
            // Sync with server response
            setLikedPosts((prev) => ({ ...prev, [postId]: result.liked }));
            setLikeCounts((prev) => ({ ...prev, [postId]: result.likesCount }));
        } catch {
            // Revert on error
            setLikedPosts((prev) => ({ ...prev, [postId]: wasLiked }));
            setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? 1 : -1) }));
            showToast("Failed to update like", "error");
        }
    };

    // ── Comment added handler ──
    const handleCommentAdded = (postId: string, newComment: { _id: string; userId: string; content: string; createdAt: string }) => {
        setLocalComments((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), newComment],
        }));
        showToast("Comment added! 💬", "success");
    };

    // ── Share handler ──
    const handleShare = async (content: string, postId?: string) => {
        const shareData = {
            title: "PetBuddy Community",
            text: content.length > 100 ? content.substring(0, 100) + "..." : content,
            url: typeof window !== "undefined" ? `${window.location.origin}/community${postId ? `?post=${postId}` : ""}` : "",
        };

        try {
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
                showToast("Shared successfully! 🎉", "success");
            } else {
                // Fallback: copy link to clipboard
                await navigator.clipboard.writeText(shareData.url || window.location.href);
                showToast("Link copied to clipboard! 📋", "info");
            }
        } catch (err: unknown) {
            // User cancelled share or error
            if ((err as Error)?.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(shareData.url || window.location.href);
                    showToast("Link copied to clipboard! 📋", "info");
                } catch {
                    showToast("Unable to share", "error");
                }
            }
        }
    };

    // ── Fallback like handler ──
    const handleFallbackLike = (postId: number) => {
        const wasLiked = fallbackLiked[postId] || false;
        setFallbackLiked((prev) => ({ ...prev, [postId]: !wasLiked }));
        setFallbackLikeCounts((prev) => ({
            ...prev,
            [postId]: (prev[postId] !== undefined ? prev[postId] : (FALLBACK_POSTS.find((p) => p.id === postId)?.likes || 0)) + (wasLiked ? -1 : 1),
        }));

        // Trigger animation
        setLikeAnimations((prev) => ({ ...prev, [`fb_${postId}`]: true }));
        setTimeout(() => setLikeAnimations((prev) => ({ ...prev, [`fb_${postId}`]: false })), 600);

        if (!wasLiked) {
            showToast("Post liked! ❤️", "success");
        }
    };

    // ── Fallback share handler ──
    const handleFallbackShare = async (post: typeof FALLBACK_POSTS[0]) => {
        setFallbackShareCounts((prev) => ({
            ...prev,
            [post.id]: (prev[post.id] !== undefined ? prev[post.id] : post.shares) + 1,
        }));
        await handleShare(post.content);
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

    // Get the currently open comment drawer's post data
    const commentDrawerPost = commentDrawerPostId
        ? apiPosts.find((p) => p._id === commentDrawerPostId)
        : null;

    return (
        <>
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

            {/* Comment Drawer */}
            {commentDrawerPostId && commentDrawerPost && (
                <CommentDrawer
                    postId={commentDrawerPostId}
                    comments={localComments[commentDrawerPostId] || commentDrawerPost.comments}
                    onClose={() => setCommentDrawerPostId(null)}
                    onCommentAdded={handleCommentAdded}
                />
            )}

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Community</h1>
                    <button
                        onClick={() => setShowCreatePost(true)}
                        className="bg-[#F05359] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow-lg shadow-red-200 hover:bg-[#e0484e] active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Post
                    </button>
                </div>
                {/* Logged-in user identity */}
                {user?.name && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#F05359]/60" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">Posting as <span className="text-[#F05359]">{user.name}</span></span>
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-2">
                <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={cn(
                                "px-5 py-2 rounded-full text-sm font-semibold transition-all border",
                                activeCategory === cat.value
                                    ? "bg-[#F05359] text-white border-[#F05359]"
                                    : "bg-white text-gray-600 border-gray-200"
                            )}
                        >
                            {cat.label}
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
                        {apiPosts.length > 0 ? apiPosts.map((post) => {
                            const isLiked = likedPosts[post._id] || false;
                            const currentLikes = likeCounts[post._id] ?? post.likes.length;
                            const currentComments = localComments[post._id] || post.comments;
                            const isAnimating = likeAnimations[post._id] || false;

                            return (
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

                                    {/* ── Interactive Action Bar ── */}
                                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                                        {/* Like */}
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-90",
                                                isLiked
                                                    ? "bg-red-50 hover:bg-red-100"
                                                    : "hover:bg-gray-50"
                                            )}
                                        >
                                            <Heart
                                                className={cn(
                                                    "w-[18px] h-[18px] transition-all",
                                                    isLiked ? "text-[#F05359] fill-[#F05359]" : "text-gray-400",
                                                    isAnimating && "animate-like-bounce"
                                                )}
                                            />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                isLiked ? "text-[#F05359]" : "text-gray-500"
                                            )}>
                                                {currentLikes}
                                            </span>
                                        </button>

                                        {/* Comment */}
                                        <button
                                            onClick={() => setCommentDrawerPostId(post._id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all active:scale-90"
                                        >
                                            <MessageSquare className="w-[18px] h-[18px] text-blue-500" />
                                            <span className="text-xs font-bold text-blue-500">{currentComments.length}</span>
                                        </button>

                                        {/* Share */}
                                        <button
                                            onClick={() => handleShare(post.content, post._id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-green-50 transition-all active:scale-90"
                                        >
                                            <Share2 className="w-[18px] h-[18px] text-gray-400" />
                                            <span className="text-xs font-bold text-gray-500">Share</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            /* Fallback static posts — filtered by active category */
                            FALLBACK_POSTS.filter((post) => activeCategory === "all" || post.category === activeCategory).map((post) => {
                                const isLiked = fallbackLiked[post.id] || false;
                                const currentLikes = fallbackLikeCounts[post.id] !== undefined ? fallbackLikeCounts[post.id] : post.likes;
                                const currentShares = fallbackShareCounts[post.id] !== undefined ? fallbackShareCounts[post.id] : post.shares;
                                const isAnimating = likeAnimations[`fb_${post.id}`] || false;

                                return (
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

                                        {/* ── Interactive Action Bar ── */}
                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                                            {/* Like */}
                                            <button
                                                onClick={() => handleFallbackLike(post.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-90",
                                                    isLiked
                                                        ? "bg-red-50 hover:bg-red-100"
                                                        : "hover:bg-gray-50"
                                                )}
                                            >
                                                <Heart
                                                    className={cn(
                                                        "w-[18px] h-[18px] transition-all",
                                                        isLiked ? "text-[#F05359] fill-[#F05359]" : "text-gray-400",
                                                        isAnimating && "animate-like-bounce"
                                                    )}
                                                />
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    isLiked ? "text-[#F05359]" : "text-gray-500"
                                                )}>
                                                    {currentLikes}
                                                </span>
                                            </button>

                                            {/* Comment */}
                                            <button
                                                onClick={() => showToast("Sign in to comment on posts", "info")}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all active:scale-90"
                                            >
                                                <MessageSquare className="w-[18px] h-[18px] text-blue-500" />
                                                <span className="text-xs font-bold text-blue-500">{post.comments}</span>
                                            </button>

                                            {/* Share */}
                                            <button
                                                onClick={() => handleFallbackShare(post)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-green-50 transition-all active:scale-90"
                                            >
                                                <Share2 className="w-[18px] h-[18px] text-gray-400" />
                                                <span className="text-xs font-bold text-gray-500">{currentShares}</span>
                                            </button>

                                            {post.views && (
                                                <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-xs">{post.views}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>


        </>
    );
}
