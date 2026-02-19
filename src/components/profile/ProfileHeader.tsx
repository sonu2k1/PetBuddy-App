import { Edit2 } from "lucide-react";

export function ProfileHeader() {
    return (
        <div className="flex flex-col items-center pt-8 pb-6 bg-white">
            <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-pink-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white hover:bg-blue-700 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">Jessica Parker</h2>
            <p className="text-sm text-gray-500 font-medium">jessica.parker@email.com</p>

            <div className="flex gap-4 mt-4 w-full px-10">
                <div className="flex-1 bg-orange-50 rounded-xl p-3 flex flex-col items-center border border-orange-100">
                    <span className="text-lg font-black text-orange-500">12</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Orders</span>
                </div>
                <div className="flex-1 bg-purple-50 rounded-xl p-3 flex flex-col items-center border border-purple-100">
                    <span className="text-lg font-black text-purple-500">4</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Pets</span>
                </div>
            </div>
        </div>
    );
}
