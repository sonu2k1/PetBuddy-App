import { cn } from "@/lib/utils";

interface ServiceFilterProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

const FILTERS = ["Vet", "Grooming", "Walking", "Boarding"];

export function ServiceFilter({ activeFilter, onFilterChange }: ServiceFilterProps) {
    return (
        <div className="px-6 py-2">
            <div className="flex items-center justify-between bg-white rounded-2xl p-1 gap-2">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={cn(
                            "flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all text-center",
                            activeFilter === filter
                                ? "bg-white text-gray-900 shadow-soft border border-gray-100"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
}
