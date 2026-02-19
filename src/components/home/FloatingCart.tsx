import { ShoppingCart, ChevronRight, Clock } from "lucide-react";

export function FloatingCart() {
    return (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
            <div className="w-full max-w-[400px] bg-teal-100/95 backdrop-blur-md rounded-[20px] p-3 shadow-xl flex items-center justify-between cursor-pointer pointer-events-auto hover:bg-teal-200/90 transition-colors border border-teal-200">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg transform -translate-y-1">
                        <ShoppingCart className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-white">
                            3
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-teal-900">Quick Cart</span>
                            <span className="text-[10px] bg-white text-teal-700 px-1.5 py-0.5 rounded font-bold">2 items</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-teal-700 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Arriving in 28 mins</span>
                        </div>
                    </div>
                </div>

                <button className="flex items-center gap-1 pr-1 bg-red-400 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                    <span className="text-xs font-bold">Reorder Last</span>
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
