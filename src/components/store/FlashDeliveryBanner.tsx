export function FlashDeliveryBanner() {
    return (
        <div className="px-4 py-2">
            <div className="relative bg-gradient-to-r from-[#c5c78a] to-[#d4d68e] rounded-2xl overflow-hidden h-[160px]">
                {/* Decorative "Offers" text */}
                <div className="absolute top-2 right-4 text-[#b8ba70] text-5xl font-black italic opacity-40 select-none pointer-events-none leading-tight">
                    Offers
                </div>

                {/* Decorative large circle */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#bfc180]/30 rounded-full pointer-events-none" />
                <div className="absolute right-12 -top-4 w-24 h-24 bg-[#bfc180]/20 rounded-full pointer-events-none" />

                <div className="relative z-10 p-5 flex flex-col justify-center h-full">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md w-fit mb-2">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Flash Delivery</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                        Get it in 15 mins!
                    </h3>
                    <p className="text-xs text-gray-700 font-medium max-w-[200px]">
                        On all pet essentials today
                    </p>
                </div>
            </div>
        </div>
    );
}
