"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Heart,
    MessageSquare,
    Share2,
    Eye,
    MoreHorizontal,
    Plus,
} from "lucide-react";

const CATEGORIES = ["All", "Health", "Adoption", "Rescue"];

const POSTS = [
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
        views: null,
    },
    {
        id: 2,
        user: {
            name: "Mike Thompson",
            role: "Pet Lover",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            badge: null,
            badgeColor: "",
        },
        time: "5h ago",
        content: "Quick question for the experts: What's the best way to introduce a new puppy to a resident cat who's a bit of a diva? 😄 Any tips for a smooth transition?",
        hashtags: ["#Health", "#Behavior"],
        image: null,
        likes: 42,
        comments: 56,
        shares: 4,
        views: null,
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
        views: null,
    },
];

export function CommunitySection() {
    const [activeCategory, setActiveCategory] = useState("All");

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Community</h1>
                <button className="bg-[#F05359] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow-lg shadow-red-200">
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
            <main className="pb-32">
                <div className="divide-y divide-gray-100">
                    {POSTS.map((post) => (
                        <div key={post.id} className="px-4 py-4">
                            {/* User Info */}
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

                            {/* Title (for special posts) */}
                            {post.title && (
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                                    {post.emoji && <span>{post.emoji}</span>}
                                </div>
                            )}

                            {/* Content */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                {!post.title && post.emoji && <span className="mr-1">{post.emoji}</span>}
                                {post.content}
                            </p>

                            {/* Hashtags */}
                            {post.hashtags && (
                                <p className="text-sm mb-3">
                                    {post.hashtags.map((tag) => (
                                        <span key={tag} className="text-blue-500 font-medium mr-2">{tag}</span>
                                    ))}
                                </p>
                            )}

                            {/* Image */}
                            {post.image && (
                                <div className="rounded-2xl overflow-hidden mb-3">
                                    <img src={post.image} alt="Post" className="w-full h-52 object-cover" />
                                </div>
                            )}

                            {/* Fundraiser Progress */}
                            {post.fundraiser && (
                                <div className="bg-green-50 rounded-xl p-3 mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-700">
                                            Goal: {post.fundraiser.goal} • {post.fundraiser.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{ width: `${post.fundraiser.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Engagement Bar */}
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
                    ))}
                </div>
            </main>
        </>
    );
}
