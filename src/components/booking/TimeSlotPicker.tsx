import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
    selectedTime: string;
    onSelect: (time: string) => void;
}

const TIME_SLOTS = {
    Morning: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
    Afternoon: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"],
    Evening: ["3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"],
};

export function TimeSlotPicker({ selectedTime, onSelect }: TimeSlotPickerProps) {
    return (
        <div className="space-y-4 py-2">
            {Object.entries(TIME_SLOTS).map(([period, slots]) => (
                <div key={period}>
                    <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{period}</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {slots.map((time) => (
                            <button
                                key={time}
                                onClick={() => onSelect(time)}
                                className={cn(
                                    "py-2 px-1 rounded-xl text-xs font-bold border transition-all",
                                    selectedTime === time
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
