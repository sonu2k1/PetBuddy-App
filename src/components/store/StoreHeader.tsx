import { MapPin, User, ChevronDown } from "lucide-react";

export function StoreHeader() {
    return (
        <header className="sticky top-0 z-50 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F05359] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900 truncate">
                                Delivering to Civil Lines, Kanpur, 20...
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                        <p className="text-[10px] font-bold text-[#F05359] uppercase tracking-wide">
                            Fastest Delivery: 15 mins
                        </p>
                    </div>
                </div>
                <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ml-3">
                    <User className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </header>
    );
}
