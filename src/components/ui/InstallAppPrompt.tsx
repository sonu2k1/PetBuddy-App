"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Extend Window interface for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export function InstallAppPrompt() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [installing, setInstalling] = useState(false);
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            setExiting(false);
        }, 400);
    }, []);

    const handleInstall = useCallback(async () => {
        const deferredPrompt = deferredPromptRef.current;
        if (!deferredPrompt) {
            // Fallback: if no prompt is available (e.g. iOS), show manual instructions
            dismiss();
            return;
        }

        setInstalling(true);

        try {
            // Trigger the native install prompt
            await deferredPrompt.prompt();

            // Wait for the user's choice
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === "accepted") {
                console.log("PetBuddy PWA installed successfully!");
            }

            // Clear the deferred prompt — it can only be used once
            deferredPromptRef.current = null;
        } catch (err) {
            console.error("Install prompt error:", err);
        } finally {
            setInstalling(false);
            dismiss();
        }
    }, [dismiss]);

    useEffect(() => {
        // Don't show if already installed as PWA (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        // Also check iOS standalone
        if ((navigator as unknown as { standalone?: boolean }).standalone) return;

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Store the event for later use
            deferredPromptRef.current = e;
            // Show our custom install prompt
            setTimeout(() => setVisible(true), 800);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Also show prompt after a delay even without the event (for iOS / browsers that don't support beforeinstallprompt)
        const fallbackTimer = setTimeout(() => {
            if (!deferredPromptRef.current) {
                setVisible(true);
            }
        }, 2000);

        // Auto-dismiss after 10 seconds
        const hideTimer = setTimeout(() => dismiss(), 11000);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            clearTimeout(fallbackTimer);
            clearTimeout(hideTimer);
        };
    }, [dismiss]);

    if (!visible) return null;

    const isNativeInstallSupported = !!deferredPromptRef.current;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`
                    fixed inset-0 z-[9990] bg-black/15 backdrop-blur-[2px]
                    transition-opacity duration-400
                    ${exiting ? "opacity-0" : "opacity-100"}
                `}
                onClick={dismiss}
            />

            {/* Top Popup Card */}
            <div
                className={`
                    fixed top-0 left-1/2 z-[9991] w-full max-w-[430px]
                    -translate-x-1/2 px-3 pt-3
                    transition-all duration-400 ease-out
                    ${exiting
                        ? "-translate-y-full opacity-0"
                        : "translate-y-0 opacity-100"
                    }
                `}
                style={{
                    animation: exiting ? "none" : "install-slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                <div className="relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)",
                        borderRadius: "20px",
                        boxShadow: "0 8px 32px rgba(240, 83, 89, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors z-10"
                        style={{ background: "rgba(0,0,0,0.06)" }}
                        aria-label="Close install prompt"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <div className="p-4 pb-3">
                        {/* Row: icon + text + install button */}
                        <div className="flex items-center gap-3">
                            {/* App Icon — using icon.svg */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{
                                    background: "linear-gradient(135deg, #F05359 0%, #FF6B72 100%)",
                                    boxShadow: "0 3px 10px rgba(240, 83, 89, 0.3)",
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/icon.svg"
                                    alt="PetBuddy"
                                    width={36}
                                    height={36}
                                    className="drop-shadow-sm"
                                    style={{ objectFit: "contain" }}
                                />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                                    Install PetBuddy 🐾
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {isNativeInstallSupported
                                        ? "Add to your home screen for quick access"
                                        : (
                                            <>Tap <span className="font-semibold text-gray-500">⋮</span> → <span className="font-semibold text-gray-500">Add to Home Screen</span></>
                                        )
                                    }
                                </p>
                            </div>

                            {/* Install CTA */}
                            <button
                                onClick={handleInstall}
                                disabled={installing}
                                className="flex-shrink-0 py-2 px-5 rounded-xl text-white font-semibold text-xs tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-70"
                                style={{
                                    background: "linear-gradient(135deg, #F05359 0%, #E0474D 100%)",
                                    boxShadow: "0 3px 12px rgba(240, 83, 89, 0.35)",
                                }}
                            >
                                {installing ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Installing…
                                    </span>
                                ) : (
                                    "Install"
                                )}
                            </button>
                        </div>

                        {/* Feature pills */}
                        <div className="flex gap-1.5 mt-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-red-50 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                Instant
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                Notifications
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-teal-50 text-teal-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                App-like
                            </span>
                        </div>
                    </div>

                    {/* Auto-dismiss progress bar at bottom */}
                    <div className="h-[3px] bg-gray-100 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                background: "linear-gradient(90deg, #F05359, #FF8A9B, #4ECDC4)",
                                animation: "install-progress 10s linear forwards",
                                animationDelay: "0.8s",
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
