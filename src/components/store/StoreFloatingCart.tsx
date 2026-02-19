import { ShoppingBag, ChevronRight } from "lucide-react";

export function StoreFloatingCart() {
    return (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
            <div className="w-full max-w-[400px] bg-[#2d2d2d] rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F05359] rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white text-xs font-medium">1 item added</p>
                        <p className="text-white text-sm font-bold">₹499 <span className="text-gray-400 text-[10px] font-normal">+ taxes</span></p>
                    </div>
                </div>

                <button className="flex items-center gap-1 bg-[#F05359] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e0484e] transition-colors">
                    View Cart
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
