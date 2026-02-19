import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

interface PetSelectorProps {
    pets: Pet[];
}

export function PetSelector({ pets }: PetSelectorProps) {
    return (
        <div className="py-4">
            <div className="flex items-center gap-5 overflow-x-auto px-4 hide-scrollbar pb-2">
                {/* Add Pet Button */}
                <button className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm">
                        <Plus className="w-6 h-6 text-pink-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Add Pet</span>
                </button>

                {/* Existing Pets */}
                {pets.map((pet) => (
                    <button key={pet.id} className="flex flex-col items-center gap-2 min-w-[60px] relative">
                        <div
                            className={cn(
                                "w-16 h-16 rounded-full p-0.5 border-2 transition-all",
                                pet.selected ? "border-pink-500 shadow-md" : "border-transparent"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-full h-full rounded-full overflow-hidden bg-cover bg-center",
                                    "bg-gray-200" // Fallback color
                                )}
                                style={{ backgroundImage: `url(${pet.image})` }}
                                role="img"
                                aria-label={pet.name}
                            />
                        </div>
                        <span
                            className={cn(
                                "text-xs font-bold",
                                pet.selected ? "text-pink-500" : "text-gray-500"
                            )}
                        >
                            {pet.name}
                        </span>
                        {pet.selected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
