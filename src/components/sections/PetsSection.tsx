"use client";

import {
    ArrowLeft,
    QrCode,
    Edit3,
    Plus,
    Syringe,
    Utensils,
    PawPrint,
    Loader2,
    Trash2,
    AlertTriangle,
    Weight,
    Stethoscope,
    X,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";
import { PawToggle } from "@/components/ui/PawToggle";
import { usePets } from "@/hooks/useData";
import { AddPetModal } from "@/components/pets/AddPetModal";
import { EditPetModal } from "@/components/pets/EditPetModal";
import { PetHealthChat } from "@/components/pets/PetHealthChat";
import { AddHealthRecordModal } from "@/components/pets/AddHealthRecordModal";
import { QRCodeModal } from "@/components/pets/QRCodeModal";
import { FeedingReminderModal } from "@/components/pets/FeedingReminderModal";
import { api } from "@/lib/api-client";
import { useReminders } from "@/hooks/useData";

function getAge(dob: string): string {
    const birth = new Date(dob);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    if (years >= 1) return `${years} year${years > 1 ? "s" : ""} old`;
    const months = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} month${months > 1 ? "s" : ""} old`;
}

const healthColors: Record<string, string> = {
    healthy: "bg-green-500",
    sick: "bg-red-500",
    recovering: "bg-amber-500",
    critical: "bg-red-600",
    unknown: "bg-gray-500",
};

interface HealthRecord {
    _id: string;
    petId: string;
    type: "vaccination" | "weight" | "treatment";
    date: string;
    notes: string;
    documentUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

const RECORD_TYPE_CONFIG = {
    vaccination: { icon: Syringe, color: "bg-blue-500", label: "Vaccination" },
    weight: { icon: Weight, color: "bg-purple-500", label: "Weight" },
    treatment: { icon: Stethoscope, color: "bg-emerald-500", label: "Treatment" },
};

export function PetsSection() {
    const { setActiveSection } = useSection();
    const { pets, isLoading, refetch } = usePets();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [vaccinationAlerts, setVaccinationAlerts] = useState(true);
    const [showAddPet, setShowAddPet] = useState(false);
    const [showEditPet, setShowEditPet] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddHealthRecord, setShowAddHealthRecord] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showFeedingModal, setShowFeedingModal] = useState(false);
    const [isDeletingFeedingReminders, setIsDeletingFeedingReminders] = useState(false);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
    const [showPostAddSplash, setShowPostAddSplash] = useState(false);

    const pet = pets[selectedIndex] || null;
    const petAge = useMemo(() => (pet ? getAge(pet.dob) : ""), [pet]);

    // Fetch feeding reminders for the selected pet
    const { reminders: petReminders, refetch: refetchReminders } = useReminders(pet?._id);

    // Derive toggle state from existing active feeding reminders
    const feedingReminders = useMemo(
        () => petReminders.some((r) => r.isActive && r.type.startsWith("feeding:")),
        [petReminders]
    );

    // Handler: toggle feeding reminders ON / OFF
    const handleFeedingToggle = useCallback(async (newValue: boolean) => {
        if (newValue) {
            // Open the setup modal
            setShowFeedingModal(true);
        } else {
            // Delete all feeding reminders for this pet
            const feedingRems = petReminders.filter(
                (r) => r.isActive && r.type.startsWith("feeding:")
            );
            if (feedingRems.length === 0) return;
            setIsDeletingFeedingReminders(true);
            try {
                await Promise.all(
                    feedingRems.map((r) => api.delete(`/reminders/${r._id}`))
                );
                refetchReminders();
            } catch (err) {
                console.error("Failed to delete feeding reminders:", err);
            } finally {
                setIsDeletingFeedingReminders(false);
            }
        }
    }, [petReminders, refetchReminders]);

    // Fetch health records when pet changes
    const fetchHealthRecords = useCallback(async () => {
        if (!pet?._id) return;
        setIsLoadingRecords(true);
        try {
            const data = await api.get<{ records: HealthRecord[] }>(
                `/pets/${pet._id}/health-records?limit=50`
            );
            setHealthRecords(data.records || []);
        } catch (err) {
            console.error("Failed to fetch health records:", err);
            setHealthRecords([]);
        } finally {
            setIsLoadingRecords(false);
        }
    }, [pet?._id]);

    useEffect(() => {
        fetchHealthRecords();
    }, [fetchHealthRecords]);

    const handleDeleteRecord = async (recordId: string) => {
        setDeletingRecordId(recordId);
        try {
            await api.delete(`/health-record/${recordId}`);
            setHealthRecords((prev) => prev.filter((r) => r._id !== recordId));
        } catch (err) {
            console.error("Failed to delete health record:", err);
        } finally {
            setDeletingRecordId(null);
        }
    };

    const handleEditSuccess = () => {
        refetch();
        // Reset index if the pet was deleted
        if (selectedIndex >= pets.length - 1 && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const handleDeletePet = async () => {
        if (!pet) return;
        setIsDeleting(true);
        try {
            const { api } = await import("@/lib/api-client");
            await api.delete(`/pets/${pet._id}`);
            setShowDeleteConfirm(false);
            if (selectedIndex >= pets.length - 1 && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
            } else {
                setSelectedIndex(0);
            }
            refetch();
        } catch (err: unknown) {
            console.error("Failed to delete pet:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle pet added: show splash then refetch
    const handlePetAdded = useCallback(() => {
        setShowPostAddSplash(true);
    }, []);

    const handlePostAddSplashFinish = useCallback(() => {
        setShowPostAddSplash(false);
        refetch();
        // Select the last pet (newly added) on next tick after refetch triggers
        setTimeout(() => {
            setSelectedIndex(pets.length);
        }, 500);
    }, [refetch, pets.length]);

    // Show splash screen after adding a pet
    if (showPostAddSplash) {
        return <SplashScreen duration={5000} onFinish={handlePostAddSplashFinish} />;
    }

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <button onClick={() => setActiveSection("home")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Pet Profile</h1>
                <button
                    onClick={() => pet && setShowQRModal(true)}
                    className={`p-1 rounded-full transition-colors ${pet ? "hover:bg-red-50 text-[#F05359]" : "text-gray-300 cursor-not-allowed"
                        }`}
                    title={pet ? `Show QR code for ${pet.name}` : "No pet selected"}
                    disabled={!pet}
                >
                    <QrCode className="w-5 h-5" />
                </button>
            </div>

            <main className="pb-32 px-4 paw-bg">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#F05359] animate-spin" />
                    </div>
                ) : !pet ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <PawPrint className="w-10 h-10 text-[#F05359]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No pets yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Add your first pet to get started!</p>
                        <button onClick={() => setShowAddPet(true)} className="bg-[#F05359] text-white font-bold px-6 py-3 rounded-full shadow-lg active:scale-95 transition-transform">
                            <Plus className="w-4 h-4 inline mr-2" />
                            Add Pet
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Pet Selector (if multiple pets) */}
                        {pets.length > 1 && (
                            <div className="flex gap-2 px-2 py-3 overflow-x-auto no-scrollbar">
                                {pets.map((p, i) => (
                                    <button
                                        key={p._id}
                                        onClick={() => setSelectedIndex(i)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all",
                                            i === selectedIndex
                                                ? "bg-[#F05359] text-white shadow-md"
                                                : "bg-gray-100 text-gray-600"
                                        )}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Pet Avatar */}
                        <div className="flex flex-col items-center py-6">
                            <div className="relative mb-3">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bubble-card bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                    {pet.imageUrl ? (
                                        <img
                                            src={pet.imageUrl}
                                            alt={pet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PawPrint className="w-14 h-14 text-[#F05359]/40" />
                                    )}
                                </div>
                                <span className={cn(
                                    "absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                    healthColors[pet.healthStatus] || "bg-green-500"
                                )}>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    {pet.healthStatus.toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {pet.gender === "male" ? "Male" : "Female"} • {petAge} • {pet.breed}
                            </p>
                            <button
                                onClick={() => setShowEditPet(true)}
                                className="mt-3 flex items-center gap-2 px-5 py-2 rounded-full border-2 border-[#F05359] text-[#F05359] font-bold text-sm hover:bg-red-50 transition-colors active:scale-95"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>

                        {/* Health Tracking */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Health Tracking</h3>
                                <button
                                    onClick={() => setShowAddHealthRecord(true)}
                                    className="text-[#F05359] text-sm font-semibold flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Record
                                </button>
                            </div>

                            <div className="bg-gray-50/50 rounded-3xl p-4 space-y-3 border border-gray-100 bubble-card">
                                {/* Always show current weight from pet profile */}
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Current Weight</p>
                                        <p className="text-xs text-gray-500">{pet.weight}kg</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                {healthRecords.length > 0 && (
                                    <div className="border-t border-gray-100" />
                                )}

                                {/* Dynamic health records */}
                                {isLoadingRecords ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 text-[#F05359] animate-spin" />
                                    </div>
                                ) : healthRecords.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-400">No health records yet. Tap &quot;+ Add Record&quot; to get started.</p>
                                    </div>
                                ) : (
                                    healthRecords.map((record) => {
                                        const config = RECORD_TYPE_CONFIG[record.type];
                                        const recordDate = new Date(record.date).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        });
                                        return (
                                            <div
                                                key={record._id}
                                                className="group flex items-start gap-3 relative"
                                            >
                                                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", config.color)} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm">{config.label}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {recordDate}{record.notes ? ` • ${record.notes}` : ""}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                    disabled={deletingRecordId === record._id}
                                                    className="opacity-0 group-hover:opacity-100 shrink-0 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90"
                                                    title="Delete record"
                                                >
                                                    {deletingRecordId === record._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 text-red-500" />
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Ask about Pet's Health — AI Chat */}
                        <PetHealthChat petId={pet._id} petName={pet.name} />

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
                                    <PawToggle
                                        checked={vaccinationAlerts}
                                        onChange={setVaccinationAlerts}
                                        variant="paw"
                                        size="md"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                            {isDeletingFeedingReminders ? (
                                                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                                            ) : (
                                                <Utensils className="w-5 h-5 text-purple-500" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 text-sm">Feeding Reminders</span>
                                            {feedingReminders && (
                                                <p className="text-[10px] text-purple-500 font-semibold mt-0.5">Active · Repeats daily</p>
                                            )}
                                        </div>
                                    </div>
                                    <PawToggle
                                        checked={feedingReminders}
                                        onChange={handleFeedingToggle}
                                        variant="bone"
                                        size="md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Remove Pet */}
                        <div className="mb-6">
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98]"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Pet
                                </button>
                            ) : (
                                <div className="p-5 bg-red-50 rounded-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-700">Remove {pet.name}?</p>
                                            <p className="text-xs text-red-500">This cannot be undone.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2.5 mt-4">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeletePet}
                                            disabled={isDeleting}
                                            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Yes, Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-40">
                <button onClick={() => setShowAddPet(true)} className="w-14 h-14 bg-[#F05359] rounded-full flex items-center justify-center shadow-xl shadow-red-300 hover:bg-[#e0484e] transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Add Pet Modal */}
            <AddPetModal
                open={showAddPet}
                onClose={() => setShowAddPet(false)}
                onSuccess={handlePetAdded}
            />

            {/* Edit Pet Modal */}
            {pet && (
                <EditPetModal
                    open={showEditPet}
                    pet={pet}
                    onClose={() => setShowEditPet(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Add Health Record Modal */}
            {pet && (
                <AddHealthRecordModal
                    open={showAddHealthRecord}
                    petId={pet._id}
                    petName={pet.name}
                    onClose={() => setShowAddHealthRecord(false)}
                    onSuccess={fetchHealthRecords}
                />
            )}

            {/* QR Code Modal */}
            {pet && (
                <QRCodeModal
                    open={showQRModal}
                    pet={pet}
                    onClose={() => setShowQRModal(false)}
                />
            )}

            {/* Feeding Reminder Modal */}
            {pet && (
                <FeedingReminderModal
                    open={showFeedingModal}
                    pet={pet}
                    onClose={() => setShowFeedingModal(false)}
                    onSuccess={refetchReminders}
                />
            )}
        </>
    );
}

