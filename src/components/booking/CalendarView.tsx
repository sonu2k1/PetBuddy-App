"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    selectedDate: Date;
    onSelect: (date: Date) => void;
}

export function CalendarView({ selectedDate, onSelect }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-md">
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <span className="font-bold text-gray-800">{format(currentMonth, "MMMM yyyy")}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md">
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {WEEKDAYS.map((day) => (
                    <span key={day} className="text-[10px] text-gray-400 font-medium uppercase">{day}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
                {daysInMonth.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentMonth = isSameMonth(date, currentMonth);

                    if (!isCurrentMonth) return <div key={date.toString()} />;

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => onSelect(date)}
                            className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all",
                                isSelected
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : isToday(date)
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {format(date, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
