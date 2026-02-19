import { Star, ThumbsUp } from "lucide-react";

export function ReviewSummary() {
    return (
        <div className="px-4 py-6 border-t border-gray-100 mt-6 mb-24">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Customer Reviews</h3>
                <button className="text-xs text-blue-600 font-bold">Write a review</button>
            </div>

            {/* Featured Review */}
            <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="User" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-900">John D.</h4>
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-400">2 days ago</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    "Max loves this food! His coat has gotten so much shinier since we switched. Highly recommend."
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful (12)</span>
                </div>
            </div>
        </div>
    );
}
