import { Zap, ChevronRight } from "lucide-react";

export function ExpressDelivery() {
    return (
        <div className="px-4 py-2">
            <div className="bg-orange-50 rounded-2xl p-4 flex items-center justify-between border border-orange-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Express Delivery</h4>
                        <p className="text-xs text-gray-500">Get essentials in 60 mins</p>
                    </div>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}
