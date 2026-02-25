export function PetEssentials() {
    const products = [
        {
            id: 1,
            brand: "Royal Canin",
            name: "Mini Adult Dry Food 1.2kg",
            price: 499,
            originalPrice: 699,
            discount: "20% OFF",
            image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop",
        },
        {
            id: 2,
            brand: "Whiskas",
            name: "Gourmet Wet Food 400g",
            price: 129,
            originalPrice: 159,
            discount: "15% OFF",
            image: "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=300&h=300&fit=crop",
        },
    ];

    return (
        <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Pet Essentials</h2>
                <button className="text-[#F05359] text-sm font-semibold">See All</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100/50 bubble-card overflow-hidden">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-gray-50/50 p-3">
                            {/* Discount Badge */}
                            <span className="absolute top-2 left-2 bg-[#F05359] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm shadow-red-200">
                                {product.discount}
                            </span>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>

                        {/* Info */}
                        <div className="p-3 pt-2">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{product.brand}</p>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5em] mt-0.5">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                                    <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>
                                </div>
                                <button className="bg-[#F05359] text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all">
                                    ADD
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
