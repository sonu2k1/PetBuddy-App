import { BadgeCheck, Star } from "lucide-react";

interface DoctorSummaryProps {
    doctor: {
        name: string;
        specialty: string;
        rating: number;
        reviews: number;
        image: string;
    };
}

export function DoctorSummary({ doctor }: DoctorSummaryProps) {
    return (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm mt-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                    {doctor.name}
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                </h4>
                <p className="text-xs text-gray-500 mb-1">{doctor.specialty}</p>
                <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">{doctor.rating}</span>
                    <span className="text-[10px] text-gray-400">({doctor.reviews} reviews)</span>
                </div>
            </div>
        </div>
    );
}
