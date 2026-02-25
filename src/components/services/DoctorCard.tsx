import { Star, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
    name: string;
    specialty: string;
    rating: number;
    distance: number;
    price: number;
    image: string;
    nextAvailable: string;
}

export function DoctorCard({
    name,
    specialty,
    rating,
    distance,
    price,
    image,
    nextAvailable,
}: DoctorCardProps) {
    return (
        <div className="bg-white rounded-[24px] p-4 border border-gray-50 mb-4 bubble-card">
            <div className="flex gap-4 mb-4">
                {/* Avatar Area */}
                <div className="relative shrink-0">
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>

                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-yellow-100 mt-2 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-700">{rating}</span>
                    </div>
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{name}</h3>
                            <p className="text-xs text-gray-400 font-medium">{specialty}</p>
                        </div>
                        <div className="bg-red-50 px-2 py-1 rounded-lg">
                            <span className="text-xs font-bold text-primary">${price}/hr</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span>{distance} km</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Next: {nextAvailable.split(" ").slice(1).join(" ")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Available Today</span>
                </div>
                <button className="bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-200 active:scale-95 transition-all">
                    Book Now
                </button>
            </div>
        </div>
    );
}
