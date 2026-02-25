"use client";

import { BookingStepper } from "@/components/booking/BookingStepper";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { CalendarView } from "@/components/booking/CalendarView";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { DoctorSummary } from "@/components/booking/DoctorSummary";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSection } from "@/context/SectionContext";

const DEMO_DOCTOR = {
    name: "Dr. Sarah Johnson",
    specialty: "Veterinary Specialist",
    rating: 4.9,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
};

export function BookingSection() {
    const { setActiveSection } = useSection();
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState("checkup");
    const [selectedDate, setSelectedDate] = useState(new Date(2025, 0, 15));
    const [selectedTime, setSelectedTime] = useState("2:00 PM");

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            alert("Booking Confirmed!");
            setActiveSection("home");
        }
    };

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 pb-2">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => step > 1 ? setStep(step - 1) : setActiveSection("services")} className="p-1 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-none">Book Appointment</h1>
                        <span className="text-xs text-gray-500">Dr. Sarah Johnson</span>
                    </div>
                </div>
                <BookingStepper currentStep={step} />
            </div>

            <main className="px-4 py-6 pb-24 paw-bg">
                {step === 1 && (
                    <ServiceSelection
                        selectedService={selectedService}
                        onSelect={(id) => { setSelectedService(id); setStep(2); }}
                    />
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Select Date</h3>
                            <CalendarView selectedDate={selectedDate} onSelect={setSelectedDate} />
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Select Time Slot</h3>
                            <TimeSlotPicker selectedTime={selectedTime} onSelect={setSelectedTime} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-800 text-lg">Booking Summary</h3>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                            <DoctorSummary doctor={DEMO_DOCTOR} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmation</h2>
                        <p className="text-gray-500 mb-8">Review your booking details before confirming.</p>
                        <DoctorSummary doctor={DEMO_DOCTOR} />
                    </div>
                )}
            </main>

            {/* Footer Action */}
            {step === 2 && (
                <div className="fixed bottom-[80px] left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex justify-center">
                    <div className="w-full max-w-[430px]">
                        <button
                            onClick={handleNext}
                            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform hover:bg-blue-700"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
