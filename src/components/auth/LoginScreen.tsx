"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

type Step = "phone" | "otp";

export function LoginScreen() {
    const { sendOtp, verifyOtp } = useAuth();
    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first OTP input when we enter OTP step
    useEffect(() => {
        if (step === "otp") {
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    const handleSendOtp = async () => {
        if (phone.replace(/\D/g, "").length < 10) {
            setError("Enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const result = await sendOtp(phone);
            if (result.otp) {
                setDevOtp(result.otp);
            }
            setStep("otp");
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpStr = otp.join("");
        if (otpStr.length < 6) {
            setError("Enter the complete 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            await verifyOtp(phone, otpStr);
        } catch (err: unknown) {
            setError((err as Error).message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
            setOtp(newOtp);
            otpRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    return (
        <div style={styles.container}>
            {/* Subtle background pattern */}
            <div style={styles.bgPattern} />

            <div style={styles.content}>
                {step === "phone" ? (
                    <>
                        {/* Banner Image */}
                        <div style={styles.bannerWrapper}>
                            <img
                                src="/petbuddy-banner-placeholder.svg"
                                alt="PetBuddy Central"
                                style={styles.bannerImage}
                            />
                        </div>

                        {/* Welcome Text */}
                        <div style={styles.welcomeSection}>
                            <h1 style={styles.welcomeTitle}>Welcome!</h1>
                            <h2 style={styles.welcomeSubtitle}>to PetCare Kanpur</h2>
                            <p style={styles.tagline}>where tails wag &amp; hearts melt!</p>
                        </div>

                        {/* Phone Input Card */}
                        <div style={styles.inputCard}>
                            <label style={styles.inputLabel}>Phone Number</label>
                            <div style={styles.phoneInputRow}>
                                <div style={styles.countryCode}>
                                    <span style={styles.flag}>+91</span>
                                    <span style={styles.flagEmoji}>🇮🇳</span>
                                </div>
                                <div style={styles.inputDivider} />
                                <input
                                    type="tel"
                                    placeholder="98765 43210"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                                        setError("");
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                                    style={styles.phoneInput}
                                    maxLength={10}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p style={styles.errorText}>{error}</p>
                            )}

                            {/* GET OTP Button */}
                            <button
                                onClick={handleSendOtp}
                                disabled={isLoading || phone.length < 10}
                                style={{
                                    ...styles.otpButton,
                                    ...(isLoading || phone.length < 10 ? styles.otpButtonDisabled : {}),
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "white" }} />
                                ) : (
                                    <span style={styles.otpButtonText}>
                                        GET OTP <span style={{ fontSize: "16px" }}>🐾</span>
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <p style={styles.footerText}>By hopping in, you agree to our</p>
                            <p style={styles.footerLinks}>
                                <span style={styles.footerLink}>Terms</span>
                                {" & "}
                                <span style={styles.footerLink}>Privacy Policy</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* OTP Verification Step */}
                        {/* Banner Image (smaller) */}
                        <div style={{ ...styles.bannerWrapper, marginTop: "20px" }}>
                            <img
                                src="/petbuddy-banner-placeholder.svg"
                                alt="PetBuddy Central"
                                style={{ ...styles.bannerImage, height: "120px" }}
                            />
                        </div>

                        <div style={styles.welcomeSection}>
                            <h1 style={{ ...styles.welcomeTitle, fontSize: "26px" }}>Verify OTP</h1>
                            <p style={styles.tagline}>
                                Sent to +91 {phone.slice(0, 2)}****{phone.slice(-2)}
                            </p>
                        </div>

                        <div style={styles.inputCard}>
                            <button
                                onClick={() => { setStep("phone"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                                style={styles.backButton}
                            >
                                <ArrowLeft size={16} />
                                <span>Change number</span>
                            </button>

                            {devOtp && (
                                <div style={styles.devOtpBanner}>
                                    <p style={styles.devOtpText}>
                                        🧑‍💻 Dev Mode — OTP: <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 800 }}>{devOtp}</span>
                                    </p>
                                </div>
                            )}

                            <div style={styles.otpRow} onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        style={{
                                            ...styles.otpInput,
                                            borderColor: digit ? "#2A9D8F" : "#e0e0e0",
                                            backgroundColor: digit ? "#F0FAF8" : "#fff",
                                        }}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p style={{ ...styles.errorText, textAlign: "center" as const }}>{error}</p>
                            )}

                            <button
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.join("").length < 6}
                                style={{
                                    ...styles.otpButton,
                                    ...(isLoading || otp.join("").length < 6 ? styles.otpButtonDisabled : {}),
                                }}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "white" }} />
                                ) : (
                                    <span style={styles.otpButtonText}>
                                        VERIFY & LOGIN 🐾
                                    </span>
                                )}
                            </button>
                        </div>

                        <div style={styles.footer}>
                            <p style={styles.footerText}>By hopping in, you agree to our</p>
                            <p style={styles.footerLinks}>
                                <span style={styles.footerLink}>Terms</span>
                                {" & "}
                                <span style={styles.footerLink}>Privacy Policy</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ──────────── Inline Styles ──────────── */

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#FAFBFC",
        position: "relative",
        overflow: "hidden",
    },
    bgPattern: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%232A9D8F'%3E%3Cellipse cx='40' cy='48' rx='9' ry='11'/%3E%3Cellipse cx='28' cy='32' rx='5.5' ry='7' transform='rotate(-15 28 32)'/%3E%3Cellipse cx='52' cy='32' rx='5.5' ry='7' transform='rotate(15 52 32)'/%3E%3Cellipse cx='22' cy='44' rx='4.5' ry='6' transform='rotate(-30 22 44)'/%3E%3Cellipse cx='58' cy='44' rx='4.5' ry='6' transform='rotate(30 58 44)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "80px 80px",
        backgroundRepeat: "repeat",
    },
    content: {
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "420px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px",
    },

    /* ── Banner ── */
    bannerWrapper: {
        width: "100%",
        marginTop: "36px",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    bannerImage: {
        width: "100%",
        height: "160px",
        objectFit: "cover",
        display: "block",
    },

    /* ── Welcome Text ── */
    welcomeSection: {
        textAlign: "center" as const,
        marginTop: "28px",
        marginBottom: "8px",
    },
    welcomeTitle: {
        fontSize: "34px",
        fontWeight: 900,
        color: "#2A9D8F",
        margin: 0,
        letterSpacing: "-0.5px",
        lineHeight: 1.1,
    },
    welcomeSubtitle: {
        fontSize: "18px",
        fontWeight: 700,
        color: "#2A9D8F",
        margin: "4px 0 0",
    },
    tagline: {
        fontSize: "13px",
        fontWeight: 400,
        color: "#999",
        margin: "8px 0 0",
        fontStyle: "italic",
    },

    /* ── Phone Input Card ── */
    inputCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "24px 20px",
        marginTop: "24px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
    },
    inputLabel: {
        fontSize: "14px",
        fontWeight: 700,
        color: "#333",
        marginBottom: "12px",
        display: "block",
    },
    phoneInputRow: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: "14px",
        border: "1.5px solid #E8E8E8",
        padding: "0 16px",
        height: "52px",
        transition: "border-color 0.2s ease",
    },
    countryCode: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexShrink: 0,
    },
    flag: {
        fontSize: "15px",
        fontWeight: 700,
        color: "#333",
    },
    flagEmoji: {
        fontSize: "14px",
    },
    inputDivider: {
        width: "1.5px",
        height: "24px",
        backgroundColor: "#DDD",
        margin: "0 14px",
        flexShrink: 0,
    },
    phoneInput: {
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        fontSize: "16px",
        fontWeight: 500,
        color: "#333",
        width: "100%",
        letterSpacing: "0.5px",
    },

    /* ── Error ── */
    errorText: {
        fontSize: "12px",
        color: "#E74C3C",
        fontWeight: 600,
        marginTop: "8px",
        paddingLeft: "4px",
    },

    /* ── GET OTP Button ── */
    otpButton: {
        width: "100%",
        height: "52px",
        border: "none",
        borderRadius: "26px",
        background: "linear-gradient(135deg, #F7838A 0%, #F05A6A 50%, #E8475A 100%)",
        color: "#fff",
        fontSize: "16px",
        fontWeight: 800,
        cursor: "pointer",
        marginTop: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 20px rgba(240, 90, 106, 0.35)",
        transition: "all 0.2s ease",
        letterSpacing: "1px",
    },
    otpButtonDisabled: {
        background: "linear-gradient(135deg, #E0E0E0, #D0D0D0)",
        color: "#AAA",
        boxShadow: "none",
        cursor: "not-allowed",
    },
    otpButtonText: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    /* ── Back Button (OTP step) ── */
    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        border: "none",
        background: "none",
        color: "#2A9D8F",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        padding: "0",
        marginBottom: "16px",
    },

    /* ── Dev OTP Banner ── */
    devOtpBanner: {
        backgroundColor: "#FFF9E6",
        border: "1px solid #F0D96B",
        borderRadius: "12px",
        padding: "8px 14px",
        marginBottom: "16px",
    },
    devOtpText: {
        fontSize: "11px",
        color: "#A67C00",
        fontWeight: 700,
        margin: 0,
    },

    /* ── OTP Input Row ── */
    otpRow: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "8px",
    },
    otpInput: {
        width: "46px",
        height: "54px",
        borderRadius: "14px",
        border: "2px solid #e0e0e0",
        textAlign: "center" as const,
        fontSize: "20px",
        fontWeight: 800,
        color: "#333",
        outline: "none",
        transition: "all 0.2s ease",
        backgroundColor: "#fff",
    },

    /* ── Footer ── */
    footer: {
        marginTop: "24px",
        marginBottom: "32px",
        textAlign: "center" as const,
    },
    footerText: {
        fontSize: "12px",
        color: "#AAA",
        margin: 0,
        fontWeight: 400,
    },
    footerLinks: {
        fontSize: "12px",
        color: "#F05A6A",
        margin: "4px 0 0",
        fontWeight: 700,
    },
    footerLink: {
        textDecoration: "none",
        borderBottom: "1.5px dotted #F05A6A",
        cursor: "pointer",
    },
};
