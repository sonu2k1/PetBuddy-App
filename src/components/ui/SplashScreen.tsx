"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
    onFinish?: () => void;
    duration?: number; // total splash duration in ms (default 5000)
}

export function SplashScreen({ onFinish, duration = 5000 }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // After the full duration, start fading out
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, duration);

        // After fade-out completes, call onFinish
        const finishTimer = setTimeout(() => {
            onFinish?.();
        }, duration + 600);

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [duration, onFinish]);

    // Progress bar fills over `duration` minus a small buffer
    const progressDuration = `${(duration - 400) / 1000}s`;

    return (
        <div
            className={`
                fixed inset-0 z-[9999] flex items-center justify-center
                transition-opacity duration-500 ease-out
                ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
            `}
            style={{ backgroundColor: "#FAF8F5" }}
        >
            {/* Pet Doodle Background Pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="splash-paws" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                            {/* Paw print */}
                            <g fill="#8B7D6B" opacity="0.6">
                                <ellipse cx="30" cy="38" rx="5" ry="6.5" />
                                <ellipse cx="22" cy="26" rx="3.2" ry="4.2" transform="rotate(-15 22 26)" />
                                <ellipse cx="38" cy="26" rx="3.2" ry="4.2" transform="rotate(15 38 26)" />
                                <ellipse cx="18" cy="34" rx="2.6" ry="3.5" transform="rotate(-30 18 34)" />
                                <ellipse cx="42" cy="34" rx="2.6" ry="3.5" transform="rotate(30 42 34)" />
                            </g>
                            {/* Bone */}
                            <g fill="none" stroke="#8B7D6B" strokeWidth="1.5" opacity="0.4">
                                <line x1="75" y1="20" x2="100" y2="20" />
                                <circle cx="75" cy="17" r="3" />
                                <circle cx="75" cy="23" r="3" />
                                <circle cx="100" cy="17" r="3" />
                                <circle cx="100" cy="23" r="3" />
                            </g>
                            {/* Fish */}
                            <g fill="none" stroke="#8B7D6B" strokeWidth="1.2" opacity="0.35" transform="translate(70, 65)">
                                <ellipse cx="15" cy="10" rx="12" ry="7" />
                                <polygon points="27,10 35,4 35,16" />
                                <circle cx="10" cy="8" r="1.5" fill="#8B7D6B" />
                            </g>
                            {/* Heart */}
                            <g fill="#8B7D6B" opacity="0.3" transform="translate(15, 80)">
                                <path d="M10 18 Q0 10 5 3 Q10 -2 14 3 Q15 5 15 5 Q15 5 16 3 Q20 -2 25 3 Q30 10 20 18 L15 22 Z" />
                            </g>
                            {/* Small star */}
                            <g fill="#8B7D6B" opacity="0.3" transform="translate(90, 90)">
                                <polygon points="10,0 12,7 19,7 13,12 15,19 10,14 5,19 7,12 1,7 8,7" />
                            </g>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#splash-paws)" />
                </svg>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-[360px] px-6">
                {/* Banner Image */}
                <div
                    className="w-full mb-8 rounded-2xl overflow-hidden shadow-lg splash-animate-in"
                    style={{ animationDelay: "0.2s" }}
                >
                    <Image
                        src="/petbuddy-banner-placeholder.svg"
                        alt="PetBuddy Central"
                        width={700}
                        height={340}
                        className="w-full h-auto object-contain"
                        priority
                    />
                </div>

                {/* App Name */}
                <h1
                    className="text-3xl font-bold text-gray-800 mb-12 splash-animate-in tracking-wide"
                    style={{
                        fontFamily: "var(--font-playfair), 'Georgia', serif",
                        animationDelay: "0.5s",
                    }}
                >
                    PetBuddy Central
                </h1>

                {/* Spacer to push footer content down */}
                <div className="flex-1" />

                {/* Progress Bar */}
                <div
                    className="w-[75%] mb-6 splash-animate-in"
                    style={{ animationDelay: "0.8s" }}
                >
                    <div className="h-[5px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full splash-progress-bar"
                            style={{
                                animationDuration: progressDuration,
                                animationDelay: "1s",
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex flex-col items-center gap-1.5 mb-8 splash-animate-in"
                    style={{ animationDelay: "1s" }}
                >
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                        <span className="text-red-400">❤️</span>
                        Made with Love in Kanpur
                    </p>
                    <p className="text-xs text-gray-400 font-mono">v1.0.2</p>
                </div>
            </div>
        </div>
    );
}
