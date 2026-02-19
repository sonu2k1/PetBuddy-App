import { Timer } from "lucide-react";

export function PromoBanner() {
    return (
        <div className="px-4 py-4">
            <div className="bg-gradient-to-r from-red-400 to-rose-400 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden h-[180px] flex flex-col justify-center">
                {/* Bone Pattern Background (CSS) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm30 0c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zM15 40c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm30 0c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Large Bone Outline Overlay */}
                <div className="absolute right-[-40px] top-[20px] w-[200px] h-[100px] border-8 border-white/20 rounded-full transform rotate-12 opacity-30 pointer-events-none"></div>
                <div className="absolute right-[-40px] top-[20px] w-[200px] h-[100px] bg-white/10 rounded-full transform rotate-12 opacity-20 pointer-events-none blur-xl"></div>

                <div className="relative z-10 w-2/3">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 text-white border border-white/20">
                        Flash Sale
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-1">
                        40% OFF on<br />Royal Canin
                    </h3>
                    <p className="text-[10px] text-white/90 font-medium mb-4 leading-relaxed max-w-[160px]">
                        Limited time grooming offer included!
                    </p>
                    <button className="bg-white text-rose-500 px-5 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform hover:bg-gray-50">
                        Claim Now
                    </button>
                </div>
            </div>
        </div>
    );
}
