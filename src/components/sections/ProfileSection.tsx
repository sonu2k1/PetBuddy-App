"use client";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { Bell } from "lucide-react";
import { useSection } from "@/context/SectionContext";

export function ProfileSection() {
    const { setActiveSection } = useSection();

    return (
        <>
            {/* Custom Header for Profile */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                <button onClick={() => setActiveSection("notifications")} className="relative p-2 hover:bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>

            <ProfileHeader />
            <ProfileMenu />
        </>
    );
}
