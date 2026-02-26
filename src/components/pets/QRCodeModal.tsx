"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
    X,
    Download,
    Share2,
    QrCode,
    PawPrint,
    Copy,
    Check,
    ExternalLink,
} from "lucide-react";

interface Pet {
    _id: string;
    name: string;
    breed: string;
    qrCodeId: string | null;
    imageUrl?: string | null;
    healthStatus?: string;
}

interface QRCodeModalProps {
    open: boolean;
    pet: Pet;
    onClose: () => void;
    onQrGenerated?: (qrCodeId: string) => void;
}

export function QRCodeModal({ open, pet, onClose, onQrGenerated }: QRCodeModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrUrl, setQrUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [localQrCodeId, setLocalQrCodeId] = useState<string | null>(pet.qrCodeId);

    // Sync local state with prop (pet can change)
    useEffect(() => {
        setLocalQrCodeId(pet.qrCodeId);
    }, [pet.qrCodeId, pet._id]);

    const publicUrl =
        typeof window !== "undefined" && localQrCodeId
            ? `${window.location.origin}/pet/${localQrCodeId}`
            : "";

    // Auto-generate QR code ID for existing pets that don't have one
    useEffect(() => {
        if (!open || localQrCodeId) return;

        const assignQrCodeId = async () => {
            try {
                const { api } = await import("@/lib/api-client");
                const result = await api.post<{ qrCodeId: string }>(`/pets/${pet._id}/generate-qr`);
                setLocalQrCodeId(result.qrCodeId);
                onQrGenerated?.(result.qrCodeId);
            } catch (err) {
                console.error("Failed to generate QR code ID:", err);
            }
        };

        assignQrCodeId();
    }, [open, localQrCodeId, pet._id, onQrGenerated]);

    useEffect(() => {
        if (!open || !localQrCodeId || !canvasRef.current) return;

        const generateQR = async () => {
            setIsGenerating(true);
            try {
                await QRCode.toCanvas(canvasRef.current!, publicUrl, {
                    width: 220,
                    margin: 2,
                    color: {
                        dark: "#1a1a2e",
                        light: "#ffffff",
                    },
                    errorCorrectionLevel: "H",
                });
                // Also get data URL for download
                const dataUrl = await QRCode.toDataURL(publicUrl, {
                    width: 512,
                    margin: 2,
                    color: {
                        dark: "#1a1a2e",
                        light: "#ffffff",
                    },
                    errorCorrectionLevel: "H",
                });
                setQrUrl(dataUrl);
            } catch (err) {
                console.error("Failed to generate QR code:", err);
            } finally {
                setIsGenerating(false);
            }
        };

        generateQR();
    }, [open, localQrCodeId, publicUrl]);

    const handleDownload = () => {
        if (!qrUrl) return;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `${pet.name.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
        link.click();
    };

    const handleCopyLink = async () => {
        if (!publicUrl) return;
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = publicUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleShare = async () => {
        if (!publicUrl) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${pet.name}'s Medical Profile`,
                    text: `View ${pet.name}'s complete medical history and health profile on PetBuddy.`,
                    url: publicUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            handleCopyLink();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 pb-8">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-600" />
                </button>

                {/* Header */}
                <div className="px-6 pt-3 pb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                            <QrCode className="w-4 h-4 text-[#F05359]" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900">{pet.name}'s QR Code</h2>
                    </div>
                    <p className="text-xs text-gray-400">
                        Anyone who scans this QR code can view {pet.name}'s full medical history
                    </p>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center px-6">
                    {/* QR Card */}
                    <div className="relative bg-white rounded-3xl p-5 shadow-[0_8px_40px_rgba(240,83,89,0.15)] border border-gray-100 mb-5">
                        {/* Corner decorations */}
                        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#F05359] rounded-tl-lg" />
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#F05359] rounded-tr-lg" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#F05359] rounded-bl-lg" />
                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#F05359] rounded-br-lg" />

                        {!localQrCodeId ? (
                            <div className="w-[220px] h-[220px] flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#F05359] border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-gray-400 text-center px-4">
                                    Generating QR code…
                                </p>
                            </div>
                        ) : isGenerating ? (
                            <div className="w-[220px] h-[220px] flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-[#F05359] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : null}

                        <canvas
                            ref={canvasRef}
                            className={!localQrCodeId || isGenerating ? "hidden" : "rounded-xl"}
                        />

                        {/* Pet name below QR */}
                        {localQrCodeId && !isGenerating && (
                            <div className="mt-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                    <PawPrint className="w-3 h-3 text-[#F05359]" />
                                    <span className="text-xs font-bold text-gray-700">PetBuddy</span>
                                    <PawPrint className="w-3 h-3 text-[#F05359]" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">Scan to view medical history</p>
                            </div>
                        )}
                    </div>

                    {/* URL Preview */}
                    {publicUrl && (
                        <div className="w-full bg-gray-50 rounded-2xl p-3 mb-5 flex items-center gap-2 border border-gray-100">
                            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-xs text-gray-500 flex-1 truncate font-mono">{publicUrl}</p>
                            <button
                                onClick={handleCopyLink}
                                className="shrink-0 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                )}
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {localQrCodeId && (
                        <div className="w-full grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={!qrUrl}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors active:scale-[0.97] disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#F05359] text-white font-bold text-sm hover:bg-[#e0484e] transition-colors active:scale-[0.97] shadow-lg shadow-red-200"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
