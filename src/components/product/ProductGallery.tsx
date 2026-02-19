import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(0);

    return (
        <div className="w-full">
            <div className="w-full aspect-square bg-orange-100 relative mb-4">
                <img
                    src={images[activeImage]}
                    alt="Product"
                    className="w-full h-full object-cover mix-blend-multiply"
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    -25% OFF
                </div>
            </div>

            <div className="flex justify-center gap-3 px-4">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={cn(
                            "w-16 h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all",
                            activeImage === idx ? "border-blue-500 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                    >
                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover rounded-lg" />
                    </button>
                ))}
            </div>
        </div>
    );
}
