"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    Bell,
    MapPin,
    Camera,
    Send,
    AlertTriangle,
    CheckCircle2,
    Mic,
    Square,
    Play,
    Pause,
    Trash2,
    Loader2,
    ImagePlus,
    X,
} from "lucide-react";
import { useSection } from "@/context/SectionContext";
import { useRescueReports, api } from "@/hooks/useData";

/* ─── Voice Note Recorder Sub-Component ─── */
function VoiceNoteRecorder() {
    const [status, setStatus] = useState<"idle" | "recording" | "recorded">("idle");
    const [seconds, setSeconds] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioUrlRef = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animFrameRef = useRef<number | null>(null);

    /* ── Helpers ── */
    const fmt = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const cleanup = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    /* ── Recording ── */
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                audioUrlRef.current = URL.createObjectURL(blob);
                setStatus("recorded");
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setSeconds(0);
            setStatus("recording");

            timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        } catch {
            alert("Microphone access is required to record a voice note.");
        }
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
    };

    /* ── Playback ── */
    const togglePlayback = () => {
        if (!audioUrlRef.current) return;

        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            return;
        }

        const audio = new Audio(audioUrlRef.current);
        audioRef.current = audio;

        const tick = () => {
            if (audio.duration) setPlaybackProgress(audio.currentTime / audio.duration);
            animFrameRef.current = requestAnimationFrame(tick);
        };

        audio.onplay = () => {
            setIsPlaying(true);
            tick();
        };
        audio.onended = () => {
            setIsPlaying(false);
            setPlaybackProgress(0);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
        audio.play();
    };

    /* ── Delete ── */
    const deleteRecording = () => {
        cleanup();
        setStatus("idle");
        setSeconds(0);
        setPlaybackProgress(0);
        setIsPlaying(false);
    };

    /* ── Animated waveform bars ── */
    const WaveBars = ({ animated }: { animated: boolean }) => (
        <div className="flex items-center gap-[3px] h-8">
            {Array.from({ length: 24 }).map((_, i) => (
                <span
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                        height: animated ? undefined : `${6 + Math.random() * 18}px`,
                        backgroundColor: animated ? "#F05359" : "#d1d5db",
                        animation: animated ? `voiceWave 0.8s ease-in-out ${i * 0.05}s infinite alternate` : "none",
                    }}
                />
            ))}
        </div>
    );

    /* ── Render ── */
    if (status === "idle") {
        return (
            <button
                onClick={startRecording}
                className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-5 flex items-center gap-4 bg-gray-50/50 active:scale-95 transition-all group hover:border-[#F05359]/40"
            >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                    <Mic className="w-5 h-5 text-[#F05359]" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-gray-700">Add Voice Note</p>
                    <p className="text-[11px] text-gray-400">Tap to record a description of the incident</p>
                </div>
            </button>
        );
    }

    if (status === "recording") {
        return (
            <div className="bg-red-50/70 border border-red-200/50 rounded-3xl p-5 bubble-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Recording</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-red-600">{fmt(seconds)}</span>
                </div>

                <WaveBars animated />

                <button
                    onClick={stopRecording}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-full font-bold text-sm hover:bg-red-50 active:scale-95 transition-all"
                >
                    <Square className="w-4 h-4 fill-red-600" />
                    Stop Recording
                </button>
            </div>
        );
    }

    /* status === "recorded" */
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-4 bubble-card">
            <div className="flex items-center gap-3">
                <button
                    onClick={togglePlayback}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F05359] to-orange-400 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-white" />
                    ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#F05359] to-orange-400 rounded-full transition-all duration-100"
                            style={{ width: `${playbackProgress * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[11px] text-gray-400 font-medium">Voice Note</span>
                        <span className="text-[11px] text-gray-400 font-mono">{fmt(seconds)}</span>
                    </div>
                </div>

                <button
                    onClick={deleteRecording}
                    className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 hover:bg-red-100 active:scale-90 transition-all"
                >
                    <Trash2 className="w-4 h-4 text-red-400" />
                </button>
            </div>
        </div>
    );
}

export function RescueSection() {
    const { setActiveSection } = useSection();
    const { reports, isLoading, refetch } = useRescueReports();
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // ─── Camera / Photo state ────────────────────────────
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
        // Reset input so the same file can be re-selected
        e.target.value = "";
    };

    const removePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
    };

    const statusConfig: Record<string, { color: string; progressColor: string; label: string }> = {
        pending: { color: "bg-yellow-100 text-yellow-600", progressColor: "bg-yellow-400", label: "Pending" },
        verified: { color: "bg-blue-100 text-blue-600", progressColor: "bg-blue-400", label: "Verified" },
        "in-progress": { color: "bg-orange-100 text-orange-600", progressColor: "bg-orange-400", label: "In Progress" },
        rescued: { color: "bg-green-100 text-green-600", progressColor: "bg-green-500", label: "Rescued" },
    };

    const progressWidths: Record<string, string> = {
        pending: "25%",
        verified: "50%",
        "in-progress": "75%",
        rescued: "100%",
    };

    const [submitError, setSubmitError] = useState("");

    const handleSubmit = async () => {
        if (!description.trim()) {
            setSubmitError("Please describe the situation");
            return;
        }
        if (description.trim().length < 10) {
            setSubmitError("Description must be at least 10 characters");
            return;
        }
        setIsSubmitting(true);
        setSubmitError("");
        try {
            let photoUrl = "";

            // Step 1: Upload photo if selected
            if (photoFile) {
                const formData = new FormData();
                formData.append("file", photoFile);
                const uploadRes = await fetch("/api/v1/upload", {
                    method: "POST",
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok && uploadData?.data?.imageUrl) {
                    photoUrl = uploadData.data.imageUrl;
                }
            }

            // Step 2: Create the rescue report
            await api.post("/rescue/report", {
                description: description.trim(),
                address: "Auto-detected location",
                longitude: 80.35,
                latitude: 26.45,
                ...(photoUrl ? { photo: photoUrl } : {}),
            });
            setDescription("");
            setPhotoPreview(null);
            setPhotoFile(null);
            setSubmitSuccess(true);
            refetch();
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err: unknown) {
            const message = (err as Error).message || "Failed to submit report";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between">
                <button onClick={() => setActiveSection("home")} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Rescue System</h1>
                <button onClick={() => setActiveSection("notifications")} className="relative p-1 hover:bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5 text-gray-800" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </button>
            </div>

            <main className="px-4 pb-32 paw-bg">
                {/* Anti-Fake News Warning */}
                <div className="bg-yellow-50/80 border border-yellow-200/50 rounded-3xl p-4 my-4 bubble-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Anti-Fake News Warning</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                False reports are subject to verification. Help us save lives by ensuring your information is accurate.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">● Authenticity Checklist</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-700">Visual Proof</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-700">Live Location</span>
                        </div>
                    </div>
                </div>

                {/* Report Form */}
                <h2 className="text-xl font-bold text-gray-900 mt-6 mb-1">Report an Animal in Distress</h2>

                {/* Auto-location */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Auto-location</label>
                    <div className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between bubble-card">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">Kanpur Cantt</span>
                        </div>
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            ACTIVE
                        </span>
                    </div>
                </div>

                {/* Evidence Photo */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Evidence Photo</label>

                    {/* Hidden file inputs */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoCapture}
                        className="hidden"
                    />

                    {photoPreview ? (
                        /* ── Photo Preview ── */
                        <div className="relative rounded-3xl overflow-hidden border border-gray-100 bubble-card">
                            <img
                                src={photoPreview}
                                alt="Evidence"
                                className="w-full h-48 object-cover"
                            />
                            {/* Remove button */}
                            <button
                                onClick={removePhoto}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                            {/* Re-take options */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 transition-colors"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    Retake
                                </button>
                                <button
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 transition-colors"
                                >
                                    <ImagePlus className="w-3.5 h-3.5" />
                                    Change
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── Empty state: Take or Pick ── */
                        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50/50 transition-all">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                                <Camera className="w-6 h-6 text-[#F05359]" />
                            </div>
                            <p className="text-sm font-bold text-gray-700 mb-1">Add Evidence Photo</p>
                            <p className="text-[11px] text-gray-400 text-center mb-4">Provide visual evidence for faster rescue</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#F05359] text-white rounded-full text-xs font-bold hover:bg-[#e0484e] active:scale-95 transition-all shadow-md shadow-red-200/50"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    Take Photo
                                </button>
                                <button
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-100 active:scale-95 transition-all"
                                >
                                    <ImagePlus className="w-3.5 h-3.5" />
                                    Gallery
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Incident Details */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Incident Details</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setSubmitError(""); }}
                        placeholder="Describe the animal's condition and exact spot..."
                        className="w-full border border-gray-100 rounded-3xl p-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#F05359] transition-all resize-none bubble-sm"
                    />
                </div>

                {/* Voice Note */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 font-medium mb-2 block">Voice Note (optional)</label>
                    <VoiceNoteRecorder />
                </div>

                {/* Error Display */}
                {submitError && (
                    <div className="bg-red-50 border border-red-200/50 rounded-2xl px-4 py-3 mb-3">
                        <p className="text-xs text-red-500 font-medium">{submitError}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !description.trim()}
                    className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-2 bubble-float hover:scale-105 active:scale-95 transition-all mb-8"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : submitSuccess ? (
                        <><CheckCircle2 className="w-5 h-5" /> Report Submitted!</>
                    ) : (
                        <><Send className="w-5 h-5" /> Submit Rescue Request</>
                    )}
                </button>

                {/* My Reports */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">My Reports</h3>
                        <button className="text-[#F05359] text-sm font-semibold">View History</button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-[#F05359] animate-spin" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-400">No reports yet. Be the first to help!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report) => {
                                const cfg = statusConfig[report.status] || statusConfig.pending;
                                const timeAgo = new Date(report.createdAt).toLocaleDateString();
                                return (
                                    <div key={report._id} className="bg-white border border-gray-100 rounded-3xl p-3 flex items-center gap-3 bubble-card">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                                            {report.photoUrl ? (
                                                <img src={report.photoUrl} alt={report.description.slice(0, 20)} className="w-full h-full object-cover" />
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-orange-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{report.description.slice(0, 30)}...</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500">{timeAgo} • {report.address}</p>
                                            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${cfg.progressColor}`} style={{ width: progressWidths[report.status] || "25%" }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
