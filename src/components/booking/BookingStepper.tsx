import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
    currentStep: number;
}

const STEPS = ["Service", "Date & Time", "Confirm"];

export function BookingStepper({ currentStep }: StepperProps) {
    return (
        <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-100">
            {STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                    <div key={step} className="flex items-center">
                        {/* Connector Line */}
                        {index > 0 && (
                            <div className={cn(
                                "h-[2px] w-8 mx-2",
                                isCompleted ? "bg-blue-600" : "bg-gray-200"
                            )} />
                        )}

                        <div className="flex flex-col items-center gap-1">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                                    isCompleted ? "bg-blue-600 text-white" :
                                        "bg-gray-100 text-gray-400"
                            )}>
                                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                            </div>
                            {isActive && <span className="text-[10px] font-bold text-gray-800 absolute mt-9">{step}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
