"use client";

import { useState, useCallback, useRef } from "react";
import {
    X,
    PawPrint,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Check,
    Dog,
    Cat,
    Camera,
    ImagePlus,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/api-client";

interface AddPetModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Gender = "male" | "female";
type HealthStatus = "healthy" | "sick" | "recovering" | "critical" | "unknown";

interface PetFormData {
    name: string;
    breed: string;
    gender: Gender;
    dob: string;
    weight: string;
    healthStatus: HealthStatus;
}

const INITIAL_FORM: PetFormData = {
    name: "",
    breed: "",
    gender: "male",
    dob: "",
    weight: "",
    healthStatus: "healthy",
};

const HEALTH_OPTIONS: { value: HealthStatus; label: string; color: string }[] = [
    { value: "healthy", label: "Healthy", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "recovering", label: "Recovering", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "sick", label: "Sick", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function AddPetModal({ open, onClose, onSuccess }: AddPetModalProps) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<PetFormData>(INITIAL_FORM);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSteps = 3;

    const update = useCallback(
        <K extends keyof PetFormData>(key: K, value: PetFormData[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
            setError(null);
        },
        []
    );

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setError("Please select a valid image (JPEG, PNG, WebP, or GIF)");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }

        setImageFile(file);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const canProceed = (): boolean => {
        if (step === 0) return form.name.trim().length > 0 && form.breed.trim().length > 0;
        if (step === 1) return form.dob.length > 0;
        if (step === 2) return parseFloat(form.weight) > 0;
        return false;
    };

    const handleNext = () => {
        if (!canProceed()) return;
        if (step < totalSteps - 1) {
            setStep((s) => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = getAccessToken();

            // Use FormData to support image upload
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("breed", form.breed.trim());
            formData.append("gender", form.gender);
            formData.append("dob", form.dob);
            formData.append("weight", form.weight);
            formData.append("healthStatus", form.healthStatus);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await fetch("/api/v1/pets", {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to add pet");
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setForm(INITIAL_FORM);
                setImageFile(null);
                setImagePreview(null);
                setStep(0);
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to add pet. Please try again.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setForm(INITIAL_FORM);
        setImageFile(null);
        setImagePreview(null);
        setStep(0);
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
                    <h3 className="text-xl font-bold text-gray-900">Pet Added!</h3>
                    <p className="text-sm text-gray-500 text-center">
                        {form.name} has been added to your pets 🎉
                    </p>
                </div>
            </div>
        );
    }

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
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl flex items-center justify-center">
                            <PawPrint className="w-5 h-5 text-[#F05359]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Add New Pet</h2>
                            <p className="text-xs text-gray-400">
                                Step {step + 1} of {totalSteps}
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

                {/* Progress bar */}
                <div className="px-5 pb-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#F05359] to-[#FF8A65] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-5">
                    {/* Step 0: Image, Name, and Breed */}
                    {step === 0 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="pet-image-input"
                                />

                                {imagePreview ? (
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg shadow-pink-100">
                                            <img
                                                src={imagePreview}
                                                alt="Pet preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Overlay actions */}
                                        <div className="absolute inset-0 w-28 h-28 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                            >
                                                <Camera className="w-4 h-4 text-gray-700" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="w-9 h-9 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                        {/* Edit hint on mobile */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#F05359] rounded-full flex items-center justify-center shadow-md border-2 border-white sm:hidden"
                                        >
                                            <Camera className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group w-28 h-28 rounded-full border-3 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-red-50 flex flex-col items-center justify-center gap-1.5 hover:border-[#F05359] hover:from-pink-100 hover:to-red-100 transition-all active:scale-95"
                                    >
                                        <ImagePlus className="w-7 h-7 text-[#F05359]/60 group-hover:text-[#F05359] transition-colors" />
                                        <span className="text-[10px] font-bold text-[#F05359]/60 group-hover:text-[#F05359] transition-colors">
                                            Add Photo
                                        </span>
                                    </button>
                                )}
                                <p className="text-[11px] text-gray-400 mt-2">Optional • Max 5MB</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Pet Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Buddy"
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors"
                                    autoFocus
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Breed
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Golden Retriever"
                                    value={form.breed}
                                    onChange={(e) => update("breed", e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors"
                                    maxLength={80}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 1: Gender and DOB */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Gender
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => update("gender", "male")}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold text-sm transition-all",
                                            form.gender === "male"
                                                ? "border-blue-400 bg-blue-50 text-blue-600 shadow-md shadow-blue-100"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Dog className="w-5 h-5" />
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => update("gender", "female")}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold text-sm transition-all",
                                            form.gender === "female"
                                                ? "border-pink-400 bg-pink-50 text-pink-600 shadow-md shadow-pink-100"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Cat className="w-5 h-5" />
                                        Female
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => update("dob", e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Weight and Health Status */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    max="200"
                                    placeholder="e.g. 12.5"
                                    value={form.weight}
                                    onChange={(e) => update("weight", e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Health Status
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {HEALTH_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => update("healthStatus", opt.value)}
                                            className={cn(
                                                "py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all",
                                                form.healthStatus === opt.value
                                                    ? `${opt.color} shadow-md`
                                                    : "border-gray-200 text-gray-400 hover:bg-gray-50"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all",
                            canProceed() && !isSubmitting
                                ? "bg-[#F05359] text-white shadow-lg shadow-red-200 hover:bg-[#e0484e] active:scale-[0.98]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding…
                            </>
                        ) : step === totalSteps - 1 ? (
                            <>
                                <PawPrint className="w-4 h-4" />
                                Add Pet
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
