"use client";

import { Edit2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePets } from "@/hooks/useData";

export function ProfileHeader() {
    const { user } = useAuth();
    const { pets } = usePets();

    const displayName = user?.name || "Pet Parent";
    const displayPhone = user?.phone || "";

    return (
        <div className="flex flex-col items-center pt-8 pb-6 bg-white">
            <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-pink-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-[#F05359]/50" />
                    </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white hover:bg-blue-700 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            {displayPhone && (
                <p className="text-sm text-gray-500 font-medium">+91 {displayPhone}</p>
            )}

            <div className="flex gap-4 mt-4 w-full px-10">
                <div className="flex-1 bg-purple-50 rounded-xl p-3 flex flex-col items-center border border-purple-100">
                    <span className="text-lg font-black text-purple-500">{pets.length}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Pets</span>
                </div>
            </div>
        </div>
    );
}
