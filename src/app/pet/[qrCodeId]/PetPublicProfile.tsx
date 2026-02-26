"use client";

import { useEffect, useState } from "react";
import {
    PawPrint,
    Syringe,
    Weight,
    Stethoscope,
    Phone,
    AlertTriangle,
    Heart,
    Calendar,
    Scale,
    ShieldCheck,
    Loader2,
    Dog,
    ClipboardList,
} from "lucide-react";

interface HealthRecord {
    _id: string;
    type: "vaccination" | "weight" | "treatment";
    date: string;
    notes: string;
    documentUrl: string | null;
}

interface PetOwner {
    name?: string;
    phone?: string;
}

interface PetData {
    _id: string;
    name: string;
    breed: string;
    gender: "male" | "female";
    dob: string;
    weight: number;
    healthStatus: "healthy" | "sick" | "recovering" | "critical" | "unknown";
    imageUrl: string | null;
    isLostMode: boolean;
    owner: PetOwner;
}

interface ProfileData {
    pet: PetData;
    healthRecords: HealthRecord[];
}

const HEALTH_STATUS_CONFIG = {
    healthy: {
        color: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "Healthy",
        icon: "💚",
    },
    sick: {
        color: "bg-red-500",
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Sick",
        icon: "🤒",
    },
    recovering: {
        color: "bg-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Recovering",
        icon: "🏥",
    },
    critical: {
        color: "bg-red-600",
        text: "text-red-800",
        bg: "bg-red-100",
        border: "border-red-300",
        label: "Critical",
        icon: "🚨",
    },
    unknown: {
        color: "bg-gray-500",
        text: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-200",
        label: "Unknown",
        icon: "❓",
    },
};

const RECORD_TYPE_CONFIG = {
    vaccination: {
        icon: Syringe,
        color: "bg-blue-500",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "Vaccination",
    },
    weight: {
        icon: Weight,
        color: "bg-purple-500",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        label: "Weight Log",
    },
    treatment: {
        icon: Stethoscope,
        color: "bg-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Treatment",
    },
};

function getAge(dob: string): string {
    const birth = new Date(dob);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    if (years >= 1) return `${years} yr${years > 1 ? "s" : ""}`;
    const months = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mo${months > 1 ? "s" : ""}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function PetPublicProfile({ qrCodeId }: { qrCodeId: string }) {
    const [data, setData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/v1/pets/qr/${qrCodeId}`);
                const json = await res.json();
                if (!res.ok || !json.success) {
                    setError(json.message || "Pet not found");
                } else {
                    setData(json.data);
                }
            } catch {
                setError("Failed to load pet profile. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [qrCodeId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#F05359] animate-spin" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Loading pet profile…</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {error || "This QR code doesn't link to any pet. It may be invalid or outdated."}
                    </p>
                </div>
            </div>
        );
    }

    const { pet, healthRecords } = data;
    const statusConfig = HEALTH_STATUS_CONFIG[pet.healthStatus] || HEALTH_STATUS_CONFIG.unknown;

    // Group records by type for summary
    const vaccinationCount = healthRecords.filter((r) => r.type === "vaccination").length;
    const treatmentCount = healthRecords.filter((r) => r.type === "treatment").length;
    const weightCount = healthRecords.filter((r) => r.type === "weight").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#F05359] to-[#ff8c8f] pt-12 pb-24 px-6 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute top-8 -right-2 w-16 h-16 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 -left-8 w-28 h-28 bg-white/10 rounded-full" />

                {/* PetBuddy Brand */}
                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <PawPrint className="w-4 h-4 text-[#F05359]" />
                    </div>
                    <span className="text-white font-bold text-base tracking-wide">PetBuddy</span>
                </div>

                <div className="relative z-10">
                    <p className="text-white/80 text-sm font-medium mb-1">Medical Profile</p>
                    <h1 className="text-3xl font-black text-white">{pet.name}</h1>
                    <p className="text-white/70 text-sm mt-1">
                        {pet.gender === "male" ? "Male" : "Female"} • {pet.breed}
                    </p>
                </div>
            </div>

            {/* Content — overlaps banner */}
            <div className="px-4 -mt-16 pb-12 max-w-lg mx-auto">

                {/* Lost Mode Alert */}
                {pet.isLostMode && (
                    <div className="bg-amber-500 rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-lg shadow-amber-200 animate-pulse">
                        <AlertTriangle className="w-6 h-6 text-white shrink-0" />
                        <div>
                            <p className="text-white font-bold text-sm">🚨 This Pet is LOST!</p>
                            <p className="text-white/90 text-xs">If found, please contact the owner immediately.</p>
                        </div>
                    </div>
                )}

                {/* Pet Avatar Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-4 relative">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center shadow-lg">
                                {pet.imageUrl ? (
                                    <img
                                        src={pet.imageUrl}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Dog className="w-12 h-12 text-[#F05359]/40" />
                                )}
                            </div>
                            {/* Health status badge */}
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${statusConfig.color} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
                                <span className="text-sm">{statusConfig.icon}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} mb-2`}>
                                <ShieldCheck className="w-3 h-3" />
                                {statusConfig.label}
                            </div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">{pet.name}</h2>
                            <p className="text-gray-500 text-sm">{pet.breed}</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
                        <div className="text-center">
                            <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                                <Calendar className="w-4 h-4 text-[#F05359]" />
                            </div>
                            <p className="text-xs font-bold text-gray-900">{getAge(pet.dob)}</p>
                            <p className="text-[10px] text-gray-400">Age</p>
                        </div>
                        <div className="text-center">
                            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                                <Scale className="w-4 h-4 text-purple-500" />
                            </div>
                            <p className="text-xs font-bold text-gray-900">{pet.weight} kg</p>
                            <p className="text-[10px] text-gray-400">Weight</p>
                        </div>
                        <div className="text-center">
                            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                                <Heart className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-xs font-bold text-gray-900 capitalize">{pet.gender}</p>
                            <p className="text-[10px] text-gray-400">Gender</p>
                        </div>
                    </div>
                </div>

                {/* Owner Contact Card */}
                {pet.owner && (pet.owner.name || pet.owner.phone) && (
                    <div className="bg-white rounded-3xl shadow-xl p-5 mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Owner Contact</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                {pet.owner.name && (
                                    <p className="font-bold text-gray-900 text-base">{pet.owner.name}</p>
                                )}
                                {pet.owner.phone && (
                                    <p className="text-gray-500 text-sm mt-0.5">{pet.owner.phone}</p>
                                )}
                            </div>
                            {pet.owner.phone && (
                                <a
                                    href={`tel:${pet.owner.phone}`}
                                    className="flex items-center gap-2 bg-[#F05359] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e0484e] transition-colors active:scale-95"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Health Summary Stats */}
                <div className="bg-white rounded-3xl shadow-xl p-5 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-[#F05359]" />
                        </div>
                        <h3 className="font-bold text-gray-900">Health Summary</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                            <p className="text-2xl font-black text-blue-700">{vaccinationCount}</p>
                            <p className="text-[10px] text-blue-500 font-semibold mt-0.5">Vaccinations</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                            <p className="text-2xl font-black text-emerald-700">{treatmentCount}</p>
                            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Treatments</p>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
                            <p className="text-2xl font-black text-purple-700">{weightCount}</p>
                            <p className="text-[10px] text-purple-500 font-semibold mt-0.5">Weight Logs</p>
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className="bg-white rounded-3xl shadow-xl p-5 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                            <Syringe className="w-4 h-4 text-[#F05359]" />
                        </div>
                        <h3 className="font-bold text-gray-900">Medical History</h3>
                        <span className="ml-auto text-xs text-gray-400 font-medium">{healthRecords.length} records</span>
                    </div>

                    {healthRecords.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <PawPrint className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No medical records yet</p>
                            <p className="text-xs text-gray-300 mt-1">Records will appear here once added</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {healthRecords.map((record, index) => {
                                const config = RECORD_TYPE_CONFIG[record.type];
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={record._id}
                                        className={`flex items-start gap-3 p-3.5 rounded-2xl border ${config.border} ${config.bg}`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className={`w-9 h-9 ${config.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm font-bold ${config.text}`}>
                                                    {config.label}
                                                </p>
                                                <p className="text-xs text-gray-400 shrink-0">
                                                    {formatDate(record.date)}
                                                </p>
                                            </div>
                                            {record.notes && (
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                    {record.notes}
                                                </p>
                                            )}
                                            {record.documentUrl && (
                                                <a
                                                    href={record.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-600 font-semibold hover:underline"
                                                >
                                                    📄 View Document
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center pt-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <PawPrint className="w-4 h-4 text-[#F05359]" />
                        <span className="text-sm font-bold text-gray-700">PetBuddy</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        This medical profile is shared via QR code
                    </p>
                </div>
            </div>
        </div>
    );
}
