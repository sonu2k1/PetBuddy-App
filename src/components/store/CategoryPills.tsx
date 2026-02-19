"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bone, Scissors } from "lucide-react";

const CATEGORIES = [
    { id: "all", label: "All", icon: null },
    { id: "food", label: "Food", icon: <Bone className="w-4 h-4" /> },
    { id: "grooming", label: "Grooming", icon: <Scissors className="w-4 h-4" /> },
];

export function CategoryPills() {
    const [active, setActive] = useState("all");

    return (
        <div className="px-4 py-3">
            <div className="flex gap-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActive(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                            active === cat.id
                                ? "bg-[#F05359] text-white border-[#F05359] shadow-md shadow-red-200"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                    >
                        {cat.icon && (
                            <span className={cn(active === cat.id ? "text-white" : "text-gray-500")}>
                                {cat.icon}
                            </span>
                        )}
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
