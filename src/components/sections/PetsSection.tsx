"use client";

import {
    ArrowLeft,
    QrCode,
    Edit3,
    Plus,
    Syringe,
    Utensils,
    Send,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";

export function PetsSection() {
    const { setActiveSection } = useSection();
    const [vaccinationAlerts, setVaccinationAlerts] = useState(true);
    const [feedingReminders, setFeedingReminders] = useState(false);

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <button onClick={() => setActiveSection("home")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Pet Profile</h1>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                    <QrCode className="w-5 h-5 text-gray-800" />
                </button>
            </div>

            <main className="pb-32 px-4">
                {/* Pet Avatar */}
                <div className="flex flex-col items-center py-6">
                    <div className="relative mb-3">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop"
                                alt="Bruno"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            HEALTHY
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Bruno</h2>
                    <p className="text-sm text-gray-500 mt-1">Male • 3 years old • Golden Retriever</p>
                    <button className="mt-3 flex items-center gap-2 px-5 py-2 rounded-full border-2 border-[#F05359] text-[#F05359] font-bold text-sm hover:bg-red-50 transition-colors">
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                {/* Health Tracking */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Health Tracking</h3>
                        <button className="text-[#F05359] text-sm font-semibold flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Add Record
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Last Vaccination</p>
                                <p className="text-xs text-gray-500">10 June, 2023 • Rabies & DHPP</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Current Weight</p>
                                <p className="text-xs text-gray-500">25kg • Target: 24-27kg</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Diet Chat */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🧠</span>
                        <h3 className="text-white font-bold text-sm">Ask about Bruno&apos;s diet</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl flex items-center px-3 py-2.5 mb-3">
                        <input
                            type="text"
                            placeholder={`"What's the best treat for 3yo Labs?"`}
                            className="bg-transparent border-none outline-none text-white placeholder:text-white/60 text-xs w-full font-medium"
                        />
                        <button className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center shrink-0 ml-2">
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {["Best food for pups", "Exercise tips", "Coat care"].map((chip) => (
                            <button
                                key={chip}
                                className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Smart Reminders */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Smart Reminders</h3>

                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <Syringe className="w-5 h-5 text-[#F05359]" />
                                </div>
                                <span className="font-bold text-gray-900 text-sm">Vaccination Alerts</span>
                            </div>
                            <button
                                onClick={() => setVaccinationAlerts(!vaccinationAlerts)}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-colors relative",
                                    vaccinationAlerts ? "bg-[#F05359]" : "bg-gray-300"
                                )}
                            >
                                <div className={cn(
                                    "w-5.5 h-5.5 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform",
                                    vaccinationAlerts ? "translate-x-[22px]" : "translate-x-[3px]"
                                )} />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <Utensils className="w-5 h-5 text-purple-500" />
                                </div>
                                <span className="font-bold text-gray-900 text-sm">Feeding Reminders</span>
                            </div>
                            <button
                                onClick={() => setFeedingReminders(!feedingReminders)}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-colors relative",
                                    feedingReminders ? "bg-[#F05359]" : "bg-gray-300"
                                )}
                            >
                                <div className={cn(
                                    "w-5.5 h-5.5 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform",
                                    feedingReminders ? "translate-x-[22px]" : "translate-x-[3px]"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-40">
                <button className="w-14 h-14 bg-[#F05359] rounded-full flex items-center justify-center shadow-xl shadow-red-300 hover:bg-[#e0484e] transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>
        </>
    );
}
