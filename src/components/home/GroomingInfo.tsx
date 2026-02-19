import { Scissors } from "lucide-react";

export function GroomingInfo() {
    return (
        <div className="px-4 py-2 mb-20">
            <div className="bg-sky-50 rounded-2xl p-4 flex gap-4 border border-sky-100">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                    <Scissors className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Free Grooming Session</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Get a complimentary grooming session for your pet on every 5th visit!
                        <span className="text-sky-600 font-semibold ml-1 cursor-pointer hover:underline">Learn more</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
