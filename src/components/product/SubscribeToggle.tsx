import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SubscribeToggle() {
    const [enabled, setEnabled] = useState(true);
    const [frequency, setFrequency] = useState("2 weeks");

    return (
        <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/50 mt-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span>Subscribe & Save</span>
                </div>
                <button
                    onClick={() => setEnabled(!enabled)}
                    className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        enabled ? "bg-blue-600" : "bg-gray-300"
                    )}
                >
                    <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                        enabled ? "translate-x-6.5" : "translate-x-0.5"
                    )} />
                </button>
            </div>

            {enabled && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-gray-500 font-medium">Delivery Frequency:</p>
                    <div className="flex gap-2">
                        {["2 weeks", "Month", "3 months"].map((freq) => (
                            <button
                                key={freq}
                                onClick={() => setFrequency(freq)}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                                    frequency === freq
                                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                Every {freq}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-1.5 rounded-lg w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Save extra 10% with subscription
                    </div>
                </div>
            )}
        </div>
    );
}
