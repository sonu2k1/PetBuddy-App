"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    X,
    PawPrint,
    Loader2,
    Check,
    Dog,
    Cat,
    Camera,
    ImagePlus,
    Trash2,
    Save,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, getAccessToken } from "@/lib/api-client";
import type { Pet } from "@/hooks/useData";

interface EditPetModalProps {
    open: boolean;
    pet: Pet;
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

const HEALTH_OPTIONS: { value: HealthStatus; label: string; emoji: string; color: string }[] = [
    { value: "healthy", label: "Healthy", emoji: "💚", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "recovering", label: "Recovering", emoji: "💛", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "sick", label: "Sick", emoji: "🩹", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "critical", label: "Critical", emoji: "🚨", color: "bg-red-200 text-red-800 border-red-300" },
    { value: "unknown", label: "Unknown", emoji: "❓", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function EditPetModal({ open, pet, onClose, onSuccess }: EditPetModalProps) {
    const [form, setForm] = useState<PetFormData>({
        name: "",
        breed: "",
        gender: "male",
        dob: "",
        weight: "",
        healthStatus: "healthy",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Populate form from pet data when modal opens
    useEffect(() => {
        if (open && pet) {
            setForm({
                name: pet.name,
                breed: pet.breed,
                gender: pet.gender,
                dob: pet.dob ? pet.dob.split("T")[0] : "",
                weight: String(pet.weight),
                healthStatus: (pet.healthStatus as HealthStatus) || "healthy",
            });
            setImagePreview(pet.imageUrl || null);
            setImageFile(null);
            setRemoveExistingImage(false);
            setError(null);
            setShowDeleteConfirm(false);
        }
    }, [open, pet]);

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

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setError("Please select a valid image (JPEG, PNG, WebP, or GIF)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }

        setImageFile(file);
        setRemoveExistingImage(false);
        setError(null);

        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveExistingImage(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const isFormValid = (): boolean => {
        return (
            form.name.trim().length > 0 &&
            form.breed.trim().length > 0 &&
            form.dob.length > 0 &&
            parseFloat(form.weight) > 0
        );
    };

    const handleSave = async () => {
        if (!isFormValid()) return;
        setIsSaving(true);
        setError(null);

        try {
            // First, upload the new image if one was selected
            let newImageUrl: string | undefined;

            if (imageFile) {
                // Upload via /api/v1/upload
                const uploadForm = new FormData();
                uploadForm.append("file", imageFile);

                const token = getAccessToken();
                const uploadRes = await fetch("/api/v1/upload", {
                    method: "POST",
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: uploadForm,
                });
                const uploadJson = await uploadRes.json();

                if (!uploadRes.ok || !uploadJson.success) {
                    throw new Error(uploadJson.message || "Failed to upload image");
                }
                newImageUrl = uploadJson.data.imageUrl;
            }

            // Build update payload
            const payload: Record<string, unknown> = {
                name: form.name.trim(),
                breed: form.breed.trim(),
                gender: form.gender,
                dob: form.dob,
                weight: parseFloat(form.weight),
                healthStatus: form.healthStatus,
            };

            if (newImageUrl) {
                payload.imageUrl = newImageUrl;
            } else if (removeExistingImage) {
                payload.imageUrl = null;
            }

            await api.patch(`/pets/${pet._id}`, payload);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1200);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save changes.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await api.delete(`/pets/${pet._id}`);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1200);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete pet.";
            setError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (isSaving || isDeleting) return;
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
                    <h3 className="text-xl font-bold text-gray-900">
                        {isDeleting ? "Pet Removed" : "Changes Saved!"}
                    </h3>
                    <p className="text-sm text-gray-500 text-center">
                        {isDeleting
                            ? `${pet.name} has been removed from your pets`
                            : `${pet.name}'s profile has been updated 🎉`}
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
                            <h2 className="text-lg font-bold text-gray-900">Edit Pet</h2>
                            <p className="text-xs text-gray-400">Update {pet.name}&apos;s profile</p>
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
                <div className="px-5 pb-5 space-y-5">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="edit-pet-image"
                        />

                        {imagePreview ? (
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg shadow-pink-100">
                                    <img
                                        src={imagePreview}
                                        alt="Pet preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-gray-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F05359] rounded-full flex items-center justify-center shadow-md border-2 border-white sm:hidden"
                                >
                                    <Camera className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="group w-24 h-24 rounded-full border-3 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-red-50 flex flex-col items-center justify-center gap-1 hover:border-[#F05359] hover:from-pink-100 hover:to-red-100 transition-all active:scale-95"
                            >
                                <ImagePlus className="w-6 h-6 text-[#F05359]/60 group-hover:text-[#F05359] transition-colors" />
                                <span className="text-[9px] font-bold text-[#F05359]/60 group-hover:text-[#F05359] transition-colors">
                                    Add Photo
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pet Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                            maxLength={50}
                        />
                    </div>

                    {/* Breed */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Breed</label>
                        <input
                            type="text"
                            value={form.breed}
                            onChange={(e) => update("breed", e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                            maxLength={80}
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => update("gender", "male")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all",
                                    form.gender === "male"
                                        ? "border-blue-400 bg-blue-50 text-blue-600 shadow-sm"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <Dog className="w-4 h-4" />
                                Male
                            </button>
                            <button
                                type="button"
                                onClick={() => update("gender", "female")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all",
                                    form.gender === "female"
                                        ? "border-pink-400 bg-pink-50 text-pink-600 shadow-sm"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <Cat className="w-4 h-4" />
                                Female
                            </button>
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                        <input
                            type="date"
                            value={form.dob}
                            onChange={(e) => update("dob", e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="200"
                            value={form.weight}
                            onChange={(e) => update("weight", e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#F05359] focus:ring-0 outline-none text-sm font-medium text-gray-900 transition-colors"
                        />
                    </div>

                    {/* Health Status */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Health Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {HEALTH_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => update("healthStatus", opt.value)}
                                    className={cn(
                                        "py-2.5 px-3 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1",
                                        form.healthStatus === opt.value
                                            ? `${opt.color} shadow-sm`
                                            : "border-gray-200 text-gray-400 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="text-base">{opt.emoji}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-red-700">Delete {pet.name}?</span>
                            </div>
                            <p className="text-xs text-red-600 mb-3">
                                This action cannot be undone. All data for this pet will be permanently removed.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                    {!showDeleteConfirm && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving}
                            className="px-4 py-3 rounded-2xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid() || isSaving}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all",
                            isFormValid() && !isSaving
                                ? "bg-[#F05359] text-white shadow-lg shadow-red-200 hover:bg-[#e0484e] active:scale-[0.98]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
