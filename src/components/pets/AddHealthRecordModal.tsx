"use client";

import { useState, useCallback } from "react";
import {
    X,
    Loader2,
    Check,
    Syringe,
    Weight,
    Stethoscope,
    CalendarDays,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

interface AddHealthRecordModalProps {
    open: boolean;
    petId: string;
    petName: string;
    onClose: () => void;
    onSuccess: () => void;
}

type RecordType = "vaccination" | "weight" | "treatment";

interface HealthRecordFormData {
    type: RecordType;
    date: string;
    notes: string;
}

const INITIAL_FORM: HealthRecordFormData = {
    type: "vaccination",
    date: new Date().toISOString().split("T")[0],
    notes: "",
};

const RECORD_TYPES: { value: RecordType; label: string; icon: typeof Syringe; color: string; bgColor: string; borderColor: string }[] = [
    {
        value: "vaccination",
        label: "Vaccination",
        icon: Syringe,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-400",
    },
    {
        value: "weight",
        label: "Weight",
        icon: Weight,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-400",
    },
    {
        value: "treatment",
        label: "Treatment",
        icon: Stethoscope,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-400",
    },
];

export function AddHealthRecordModal({
    open,
    petId,
    petName,
    onClose,
    onSuccess,
}: AddHealthRecordModalProps) {
    const [form, setForm] = useState<HealthRecordFormData>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const update = useCallback(
        <K extends keyof HealthRecordFormData>(key: K, value: HealthRecordFormData[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
            setError(null);
        },
        []
    );

    const canSubmit = (): boolean => {
        return form.date.length > 0 && form.notes.trim().length > 0;
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post(`/pets/${petId}/health-record`, {
                type: form.type,
                date: form.date,
                notes: form.notes.trim(),
            });

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setForm(INITIAL_FORM);
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to add health record. Please try again.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setForm(INITIAL_FORM);
        setError(null);
        onClose();
    };

    if (!open) return null;

    // Success overlay
    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in duration-300 mx-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Record Added!</h3>
                    <p className="text-sm text-gray-500 text-center">
                        Health record for {petName} has been saved 🩺
                    </p>
                </div>
            </div>
        );
    }

    const selectedType = RECORD_TYPES.find((t) => t.value === form.type)!;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 mx-0 sm:mx-6">
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedType.bgColor)}>
                            <selectedType.icon className={cn("w-5 h-5", selectedType.color)} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Add Health Record</h2>
                            <p className="text-xs text-gray-400">
                                For {petName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 space-y-5 animate-in fade-in duration-300">
                    {/* Record Type Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Record Type
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {RECORD_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = form.type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => update("type", type.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 text-xs font-bold transition-all",
                                            isSelected
                                                ? `${type.borderColor} ${type.bgColor} ${type.color} shadow-md`
                                                : "border-gray-200 text-gray-400 hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <CalendarDays className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => update("date", e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                            {form.type === "vaccination"
                                ? "Vaccine Details"
                                : form.type === "weight"
                                    ? "Weight & Notes"
                                    : "Treatment Details"}
                        </label>
                        <textarea
                            placeholder={
                                form.type === "vaccination"
                                    ? "e.g. Rabies & DHPP booster"
                                    : form.type === "weight"
                                        ? "e.g. 12.5 kg — gained 0.5 kg since last check"
                                        : "e.g. Deworming treatment — oral medication prescribed"
                            }
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            rows={3}
                            maxLength={1000}
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors resize-none"
                        />
                        <p className="text-[11px] text-gray-400 mt-1 text-right">
                            {form.notes.length}/1000
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Button */}
                <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit() || isSubmitting}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all",
                            canSubmit() && !isSubmitting
                                ? "bg-[#F05359] text-white shadow-lg shadow-red-200 hover:bg-[#e0484e] active:scale-[0.98]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Save Record
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
