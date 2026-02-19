import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/types";
import { Link } from "lucide-react"; // Import Link not used here but next/link is needed for navigation if we wrap buttons
// actually we should probably use next/link for navigation.
// Let's use simple div for now as per previous implementation but updated style.

interface ServicesGridProps {
    services: ServiceItem[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-gray-800 text-lg">Pet Services & Shop</h3>
                <span className="text-pink-500 text-xs font-bold cursor-pointer">View All</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                    <button
                        key={service.id}
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform group-active:scale-95 shadow-sm",
                            service.color
                        )}>
                            {service.icon}
                        </div>
                        <span className="font-bold text-xs text-gray-700">{service.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
