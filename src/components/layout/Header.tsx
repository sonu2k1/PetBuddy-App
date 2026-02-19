import { MapPin, ShoppingCart, Dog } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white px-4 py-3 pb-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-pink-400 p-1.5 rounded-lg">
                    <Dog className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="flex flex-col flex-1 mx-3">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold tracking-wide uppercase">
                    <MapPin className="w-3 h-3 text-pink-500" />
                    <span>Deliver to</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer group">
                    <span className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-pink-500 transition-colors">
                        214-A, Swaraj Nagar, Kanpur...
                    </span>
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400"
                    >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="p-1 px-2 bg-gray-100 rounded-full flex items-center gap-1 text-[10px] font-bold text-gray-600">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                    Fastest
                </div>
                <button className="relative p-1 hover:bg-gray-50 rounded-full transition-colors">
                    <ShoppingCart className="w-6 h-6 text-gray-800" />
                    <span className="absolute top-0 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                        3
                    </span>
                </button>
            </div>
        </header>
    );
}
