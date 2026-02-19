import { Star, Check } from "lucide-react";
import { QuantitySelector } from "./QuantitySelector";

export function ProductInfo() {
    return (
        <div className="px-4 mt-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Premium Brand</span>
            <h1 className="text-xl font-black text-gray-900 leading-tight mt-1 mb-1">
                Premium Dog Food -<br />Chicken Flavor
            </h1>
            <p className="text-xs text-gray-500 mb-2">5kg Pack • High Protein Formula</p>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-sm">4.8</span>
                    <span className="text-xs text-gray-400 underline decoration-gray-300 underline-offset-2">(234 reviews)</span>
                </div>
                <span className="text-xs text-blue-600 font-bold">See all reviews</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-gray-400 line-through decoration-red-400">$39.99</span>
                <span className="text-2xl font-black text-blue-600">$29.99</span>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded ml-1">Save $10.00</span>
            </div>

            {/* Subscription Toggle will be injected here in parent or composed */}

            <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-2">Product Description</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Our Premium Dog Food is specially formulated with high-quality chicken as the primary ingredient, providing essential proteins for your dog's health and vitality.
                    <br /><br />
                    This nutritionally balanced formula includes vitamins, minerals, and omega fatty acids to support healthy skin, coat, and immune system.
                </p>

                <h3 className="font-bold text-gray-800 mb-2">Key Features:</h3>
                <ul className="space-y-2">
                    {[
                        "Real chicken as the #1 ingredient",
                        "No artificial colors, flavors, or preservatives",
                        "Enriched with vitamins and minerals",
                        "Supports healthy digestion",
                        "Made in USA with globally sourced ingredients"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
