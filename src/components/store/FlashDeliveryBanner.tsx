export function FlashDeliveryBanner() {
    return (
        <div className="px-4 py-2">
            <div className="relative bg-gradient-to-br from-[#c5c78a] to-[#d4d68e] overflow-hidden h-[160px] bubble-float">
                {/* Decorative "Offers" text */}
                <div className="absolute top-2 right-4 text-[#b8ba70] text-7xl font-black italic opacity-30 select-none pointer-events-none leading-tight">
                    Offers
                </div>

                {/* Decorative large circle */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/20 rounded-full pointer-events-none" />
                <div className="absolute right-12 -top-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />

                <div className="relative z-10 p-6 flex flex-col justify-center h-full">
                    <div className="inline-flex items-center gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Flash Delivery</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 leading-none mb-1.5">
                        Get it in 15 mins!
                    </h3>
                    <p className="text-sm text-gray-800/80 font-bold max-w-[200px]">
                        On all pet essentials today
                    </p>
                </div>
            </div>
        </div>
    );
}
