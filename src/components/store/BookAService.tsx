import { Star } from "lucide-react";

export function BookAService() {
    return (
        <div className="px-4 py-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Book a Service</h2>

            <div className="bg-white overflow-hidden border border-gray-100/50 bubble-card">
                {/* Service Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop"
                        alt="Professional Dog Grooming"
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                </div>

                {/* Service Info */}
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-[#F05359] uppercase tracking-wider bg-red-50/50 px-2.5 py-1 rounded-full">
                            AT HOME
                        </span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Professional Grooming at Home
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">
                        Expert stylists for baths, haircuts, and spa treatments.
                        Safe & stress-free.
                    </p>

                    <button className="w-full bg-[#F05359] text-white py-4 rounded-2xl font-black text-sm bubble-float active:scale-95 transition-all">
                        Book a Slot Today
                    </button>
                </div>
            </div>
        </div>
    );
}
