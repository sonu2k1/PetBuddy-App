import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ServiceOption {
    id: string;
    name: string;
    description: string;
    duration: string;
    price: number;
}

const SERVICES: ServiceOption[] = [
    { id: "checkup", name: "General Checkup", description: "Comprehensive health examination for your pet", duration: "30 minutes", price: 75 },
    { id: "vaccination", name: "Vaccination", description: "Annual vaccines and booster shots", duration: "20 minutes", price: 45 },
    { id: "dental", name: "Dental Cleaning", description: "Professional teeth cleaning and oral care", duration: "45 minutes", price: 120 },
    { id: "emergency", name: "Emergency Care", description: "Urgent medical attention for critical cases", duration: "60 minutes", price: 150 },
];

interface ServiceSelectionProps {
    selectedService: string;
    onSelect: (id: string) => void;
}

export function ServiceSelection({ selectedService, onSelect }: ServiceSelectionProps) {
    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Select Service</h3>
            {SERVICES.map((service) => (
                <button
                    key={service.id}
                    onClick={() => onSelect(service.id)}
                    className={cn(
                        "w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-start group",
                        selectedService === service.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                >
                    <div>
                        <h4 className={cn(
                            "font-bold text-base mb-1",
                            selectedService === service.id ? "text-blue-900" : "text-gray-900"
                        )}>{service.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mb-2">{service.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{service.duration}</span>
                        </div>
                    </div>
                    <span className={cn(
                        "text-lg font-black",
                        selectedService === service.id ? "text-blue-600" : "text-blue-600"
                    )}>${service.price}</span>
                </button>
            ))}
        </div>
    );
}
