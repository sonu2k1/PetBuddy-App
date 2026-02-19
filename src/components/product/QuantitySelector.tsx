"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export function QuantitySelector() {
    const [quantity, setQuantity] = useState(1);

    const decrease = () => setQuantity((q) => Math.max(1, q - 1));
    const increase = () => setQuantity((q) => Math.min(10, q + 1));

    return (
        <div className="flex items-center gap-4 my-4">
            <span className="text-sm font-bold text-gray-700">Quantity:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                    onClick={decrease}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black active:scale-95 transition-all disabled:opacity-50"
                    disabled={quantity <= 1}
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                <button
                    onClick={increase}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black active:scale-95 transition-all disabled:opacity-50"
                    disabled={quantity >= 12}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <span className="text-xs text-orange-500 font-medium">Only 12 left in stock</span>
        </div>
    );
}
