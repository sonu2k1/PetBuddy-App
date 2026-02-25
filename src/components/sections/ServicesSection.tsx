"use client";

import { useState } from "react";
import { ServiceFilter } from "@/components/services/ServiceFilter";
import { DoctorCard } from "@/components/services/DoctorCard";
import { useSection } from "@/context/SectionContext";

const DOCTORS = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "Veterinary Specialist",
        experience: 12,
        rating: 4.9,
        reviews: 342,
        distance: 1.2,
        price: 75,
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
        tags: ["Emergency Care", "Surgery", "Dental"],
        nextAvailable: "Today 2:00 PM",
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Exotic Animal Specialist",
        experience: 8,
        rating: 4.8,
        reviews: 218,
        distance: 2.5,
        price: 85,
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
        tags: ["Exotic Pets", "Birds", "Reptiles"],
        nextAvailable: "Today 4:30 PM",
    },
    {
        id: 3,
        name: "Dr. Emily Rodriguez",
        specialty: "General Practice",
        experience: 15,
        rating: 5.0,
        reviews: 456,
        distance: 0.8,
        price: 65,
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop",
        tags: ["Wellness Exams", "Vaccinations", "Nutrition"],
        nextAvailable: "Tomorrow 9:00 AM",
    },
    {
        id: 4,
        name: "Dr. James Wilson",
        specialty: "Mobile Vet Service",
        experience: 10,
        rating: 4.7,
        reviews: 189,
        distance: 3.2,
        price: 95,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
        tags: ["Home Visits", "Senior Care", "Hospice"],
        nextAvailable: "Today 6:00 PM",
    }
];

export function ServicesSection() {
    const [activeFilter, setActiveFilter] = useState("Vet");
    const { setActiveSection } = useSection();

    return (
        <>
            {/* Custom Header */}
            <div className="sticky top-0 z-50 bg-white px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900">Pet Services</h1>
                <button
                    onClick={() => setActiveSection("booking")}
                    className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-red-200"
                >
                    <span className="text-sm">SOS</span>
                </button>
            </div>

            <ServiceFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            <main className="px-5 py-4 pb-32 space-y-6 paw-bg">
                {/* Top Rated Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-lg font-bold text-gray-800 leading-none">Top Rated Veterinarians</h2>
                        <button className="text-primary text-xs font-bold hover:opacity-80">View All</button>
                    </div>

                    {DOCTORS.map((doctor) => (
                        <DoctorCard key={doctor.id} {...doctor} />
                    ))}
                </div>

                {/* Verified Professionals Banner */}
                <div className="bg-red-50 rounded-3xl p-5 flex items-center gap-4 bubble-card">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-gray-900 text-sm mb-1">Verified Professionals</h3>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Every provider is background checked and certified for your pet&apos;s safety.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
