"use client";

import {
    ArrowLeft,
    Bell,
    MapPin,
    Camera,
    Send,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { useSection } from "@/context/SectionContext";

const MY_REPORTS = [
    {
        id: 1,
        title: "Street Cat - Leg Injury",
        time: "Reported 2 hours ago • Kanpur Cantt",
        status: "In Progress",
        statusColor: "bg-orange-100 text-orange-600",
        progressColor: "bg-orange-400",
        image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=100&h=100&fit=crop",
    },
    {
        id: 2,
        title: "Stray Dog - Dehydration",
        time: "Reported Yesterday • Civil Lines",
        status: "Rescued",
        statusColor: "bg-green-100 text-green-600",
        progressColor: "bg-green-500",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
    },
];

export function RescueSection() {
    const { setActiveSection } = useSection();

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <button onClick={() => setActiveSection("home")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Rescue System</h1>
                <button onClick={() => setActiveSection("notifications")} className="relative p-1 hover:bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5 text-gray-800" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </button>
            </div>

            <main className="px-4 pb-32">
                {/* Anti-Fake News Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 my-4">
                    <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Anti-Fake News Warning</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                False reports are subject to verification. Help us save lives by ensuring your information is accurate.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">● Authenticity Checklist</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-700">Visual Proof</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-700">Live Location</span>
                        </div>
                    </div>
                </div>

                {/* Report Form */}
                <h2 className="text-xl font-bold text-gray-900 mt-6 mb-1">Report an Animal in Distress</h2>

                {/* Auto-location */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Auto-location</label>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">Kanpur Cantt</span>
                        </div>
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            ACTIVE
                        </span>
                    </div>
                </div>

                {/* Evidence Photo */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Evidence Photo</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                            <Camera className="w-6 h-6 text-[#F05359]" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Upload Photo</p>
                        <p className="text-[11px] text-gray-400 text-center mb-3">Provide visual evidence for faster rescue</p>
                        <button className="px-5 py-2 border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                            Select Image
                        </button>
                    </div>
                </div>

                {/* Incident Details */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Incident Details</label>
                    <textarea
                        rows={4}
                        placeholder="Describe the animal's condition and exact spot..."
                        className="w-full border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#F05359] transition-colors resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl transition-shadow mb-8">
                    <Send className="w-5 h-5" />
                    Submit Rescue Request
                </button>

                {/* My Reports */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">My Reports</h3>
                        <button className="text-[#F05359] text-sm font-semibold">View History</button>
                    </div>

                    <div className="space-y-3">
                        {MY_REPORTS.map((report) => (
                            <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                    <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{report.title}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${report.statusColor}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">{report.time}</p>
                                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${report.progressColor}`} style={{ width: report.status === "Rescued" ? "100%" : "60%" }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
