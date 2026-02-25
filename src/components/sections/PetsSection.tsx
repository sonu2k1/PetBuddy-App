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
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSection } from "@/context/SectionContext";
import { PawToggle } from "@/components/ui/PawToggle";
import { usePets } from "@/hooks/useData";
import { AddPetModal } from "@/components/pets/AddPetModal";
import { EditPetModal } from "@/components/pets/EditPetModal";
import { PetHealthChat } from "@/components/pets/PetHealthChat";

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

export function PetsSection() {
    const { setActiveSection } = useSection();
    const { pets, isLoading, refetch } = usePets();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [vaccinationAlerts, setVaccinationAlerts] = useState(true);
    const [feedingReminders, setFeedingReminders] = useState(false);
    const [showAddPet, setShowAddPet] = useState(false);
    const [showEditPet, setShowEditPet] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const pet = pets[selectedIndex] || null;
    const petAge = useMemo(() => (pet ? getAge(pet.dob) : ""), [pet]);

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
                                <button className="text-[#F05359] text-sm font-semibold flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    Add Record
                                </button>
                            </div>

                            <div className="bg-gray-50/50 rounded-3xl p-4 space-y-4 border border-gray-100 bubble-card">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Last Vaccination</p>
                                        <p className="text-xs text-gray-500">10 June, 2023 • Rabies &amp; DHPP</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Current Weight</p>
                                        <p className="text-xs text-gray-500">{pet.weight}kg</p>
                                    </div>
                                </div>
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
                                            <Utensils className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">Feeding Reminders</span>
                                    </div>
                                    <PawToggle
                                        checked={feedingReminders}
                                        onChange={setFeedingReminders}
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
                onSuccess={refetch}
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
        </>
    );
}

