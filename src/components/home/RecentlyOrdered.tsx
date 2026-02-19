import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";

interface RecentlyOrderedProps {
    products: Product[];
}

export function RecentlyOrdered({ products }: RecentlyOrderedProps) {
    return (
        <div className="py-4">
            <div className="flex justify-between items-center px-4 mb-3">
                <h3 className="font-bold text-gray-800 text-lg">Buy Again</h3>
                <button className="text-orange-500 text-xs font-semibold flex items-center gap-1 hover:underline">
                    See All <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
                {products.map((product) => (
                    <div key={product.id} className="min-w-[140px] bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <div className="relative aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                            {/* Placeholder Image */}
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50">
                                📦
                            </div>
                        </div>
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-bold text-gray-900">${product.price}</span>
                            <button className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs hover:bg-orange-600 transition-colors">
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
