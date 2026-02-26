"use client";

import { useState } from "react";
import {
    X,
    Clock,
    Plus,
    Trash2,
    Utensils,
    Check,
    Loader2,
    Sun,
    Sunrise,
    Moon,
} from "lucide-react";
import { api } from "@/lib/api-client";

interface Pet {
    _id: string;
    name: string;
}

interface FeedingReminderModalProps {
    open: boolean;
    pet: Pet;
    onClose: () => void;
    onSuccess: () => void; // refetch reminders after saving
}

interface TimeSlot {
    id: string;
    time: string;   // "HH:MM"
    label: string;  // "Morning", "Afternoon", "Evening" or custom
}

const PRESET_SLOTS: TimeSlot[] = [
    { id: "morning", time: "08:00", label: "Morning" },
    { id: "afternoon", time: "13:00", label: "Afternoon" },
    { id: "evening", time: "18:00", label: "Evening" },
];

const SLOT_ICON: Record<string, React.ReactNode> = {
    Morning: <Sunrise className="w-4 h-4 text-amber-500" />,
    Afternoon: <Sun className="w-4 h-4 text-orange-500" />,
    Evening: <Moon className="w-4 h-4 text-indigo-500" />,
};

function getSlotIconByTime(time: string): React.ReactNode {
    const [h] = time.split(":").map(Number);
    if (h >= 5 && h < 12) return <Sunrise className="w-4 h-4 text-amber-500" />;
    if (h >= 12 && h < 17) return <Sun className="w-4 h-4 text-orange-500" />;
    return <Moon className="w-4 h-4 text-indigo-500" />;
}

/** Build the next scheduledAt ISO string for a given "HH:MM" time */
function buildScheduledAt(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }
    return scheduled.toISOString();
}

export function FeedingReminderModal({
    open,
    pet,
    onClose,
    onSuccess,
}: FeedingReminderModalProps) {
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([
        { ...PRESET_SLOTS[0] }, // Morning default
    ]);
    const [isCustomTime, setIsCustomTime] = useState(false);
    const [customTime, setCustomTime] = useState("12:00");
    const [customLabel, setCustomLabel] = useState("Custom");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const togglePreset = (preset: TimeSlot) => {
        setSelectedSlots((prev) => {
            const exists = prev.find((s) => s.id === preset.id);
            if (exists) {
                // Don't remove the last one
                if (prev.length === 1) return prev;
                return prev.filter((s) => s.id !== preset.id);
            }
            return [...prev, { ...preset }];
        });
    };

    const addCustomSlot = () => {
        if (!customTime) return;
        const id = `custom-${Date.now()}`;
        setSelectedSlots((prev) => [
            ...prev,
            { id, time: customTime, label: customLabel || "Custom" },
        ]);
        setIsCustomTime(false);
        setCustomTime("12:00");
        setCustomLabel("Custom");
    };

    const removeSlot = (id: string) => {
        setSelectedSlots((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((s) => s.id !== id);
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Create one reminder per selected time slot
            await Promise.all(
                selectedSlots.map((slot) =>
                    api.post("/reminders", {
                        petId: pet._id,
                        type: `feeding:${slot.label}`,
                        scheduledAt: buildScheduledAt(slot.time),
                        repeat: "daily",
                        isActive: true,
                    })
                )
            );
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save reminders";
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-600" />
                </button>

                {/* Header */}
                <div className="px-6 pt-2 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900">Feeding Reminders</h2>
                            <p className="text-xs text-gray-400">{pet.name} • Repeats daily</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 space-y-5 overflow-y-auto max-h-[70vh]">
                    {/* Quick preset selector */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Select Feeding Times
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESET_SLOTS.map((preset) => {
                                const active = !!selectedSlots.find((s) => s.id === preset.id);
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => togglePreset(preset)}
                                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all active:scale-95 ${active
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-100 bg-gray-50"
                                            }`}
                                    >
                                        {active && (
                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                        <span className="text-lg">{SLOT_ICON[preset.label]}</span>
                                        <span className={`text-xs font-bold ${active ? "text-purple-700" : "text-gray-600"}`}>
                                            {preset.label}
                                        </span>
                                        <span className={`text-[10px] font-medium ${active ? "text-purple-500" : "text-gray-400"}`}>
                                            {preset.time}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected times list */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Scheduled Times
                        </p>
                        <div className="space-y-2">
                            {selectedSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3"
                                >
                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        {getSlotIconByTime(slot.time)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{slot.label}</p>
                                        <p className="text-xs text-purple-500 font-medium">{slot.time} • Daily</p>
                                    </div>
                                    <button
                                        onClick={() => removeSlot(slot.id)}
                                        disabled={selectedSlots.length === 1}
                                        className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-30"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add custom time */}
                    {isCustomTime ? (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Custom Time
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-400 font-semibold uppercase mb-1 block">
                                        Label
                                    </label>
                                    <input
                                        type="text"
                                        value={customLabel}
                                        onChange={(e) => setCustomLabel(e.target.value)}
                                        placeholder="e.g. Snack"
                                        className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-gray-400 font-semibold uppercase mb-1 block">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsCustomTime(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addCustomSlot}
                                    className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-colors"
                                >
                                    Add Time
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCustomTime(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-purple-200 text-purple-500 font-bold text-sm hover:bg-purple-50 transition-colors active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            Add Custom Time
                        </button>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Info badge */}
                    <div className="flex items-start gap-2 bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100">
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Feeding reminders will show on your home page every day at the selected times. You can turn them off anytime.
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || selectedSlots.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#F05359] text-white font-black text-base shadow-lg shadow-red-200 hover:bg-[#e0484e] transition-colors active:scale-[0.98] disabled:opacity-60"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Set {selectedSlots.length} Feeding Reminder{selectedSlots.length > 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
