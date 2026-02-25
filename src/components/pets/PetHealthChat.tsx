"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Stethoscope, Loader2, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface PetHealthChatProps {
    petId: string;
    petName: string;
}

interface AiResponse {
    answer: string;
    chatId: string;
    pet: { _id: string; name: string; breed: string };
    rateLimit: { remaining: number; limit: number; windowMinutes: number };
}

const SYMPTOM_CHIPS = [
    { label: "Coughing after eating?", color: "bg-red-100 text-red-600 border-red-200/60" },
    { label: "Scratching behind ears?", color: "bg-orange-100 text-orange-600 border-orange-200/60" },
    { label: "Is he too tired?", color: "bg-purple-100 text-purple-600 border-purple-200/60" },
    { label: "Change in appetite?", color: "bg-blue-100 text-blue-600 border-blue-200/60" },
];

/** Simple markdown-ish renderer for AI responses */
function formatAiText(text: string) {
    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, pi) => {
        // Check for bullet lists
        const lines = para.split("\n");
        const isList = lines.every(
            (l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || l.trim().startsWith("• ") || /^\d+\./.test(l.trim()) || l.trim() === ""
        );

        if (isList) {
            return (
                <ul key={pi} className="space-y-1.5 my-1">
                    {lines
                        .filter((l) => l.trim())
                        .map((line, li) => {
                            const cleanLine = line.replace(/^[\s]*[-*•]\s?/, "").replace(/^\d+\.\s?/, "");
                            return (
                                <li key={li} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#F05359] rounded-full mt-1.5 shrink-0" />
                                    <span dangerouslySetInnerHTML={{ __html: boldify(cleanLine) }} />
                                </li>
                            );
                        })}
                </ul>
            );
        }

        // Regular paragraph
        return (
            <p
                key={pi}
                className="text-xs text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: boldify(para.replace(/\n/g, "<br/>")) }}
            />
        );
    });
}

/** Convert **bold** to <strong> */
function boldify(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold text-gray-900'>$1</strong>");
}

export function PetHealthChat({ petId, petName }: PetHealthChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Reset messages when pet changes
    useEffect(() => {
        setMessages([]);
        setInput("");
        setError(null);
    }, [petId]);

    const sendQuestion = useCallback(
        async (question: string) => {
            if (!question.trim() || isLoading) return;

            const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: question.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);
            setError(null);

            try {
                const result = await api.post<AiResponse>("/ai/pet-advice", {
                    petId,
                    question: question.trim(),
                });

                const aiMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: "assistant",
                    content: result.answer,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, aiMsg]);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Failed to get a response. Please try again.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        [petId, isLoading]
    );

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        sendQuestion(input);
    };

    const handleChipClick = (label: string) => {
        // Convert chip label to a question about the specific pet
        const question = `My pet ${petName} has been ${label.toLowerCase().replace("?", "")}. Should I be concerned?`;
        sendQuestion(question);
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="bg-gradient-to-br from-pink-50 via-white to-red-50 rounded-3xl p-5 mb-6 border border-pink-200/50 bubble-card">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#F05359] rounded-xl flex items-center justify-center shadow-sm">
                    <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Ask about {petName}&apos;s health</h3>
                    <p className="text-[10px] text-gray-400">Powered by Gemini AI</p>
                </div>
                {hasMessages && (
                    <button
                        onClick={() => {
                            setMessages([]);
                            setError(null);
                        }}
                        className="ml-auto text-[10px] font-bold text-gray-400 hover:text-[#F05359] transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                        Clear chat
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            {hasMessages && (
                <div className="mb-3 max-h-[400px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === "user" ? "flex-row-reverse" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                    msg.role === "user"
                                        ? "bg-[#F05359]"
                                        : "bg-gradient-to-br from-violet-500 to-purple-600"
                                )}
                            >
                                {msg.role === "user" ? (
                                    <User className="w-3.5 h-3.5 text-white" />
                                ) : (
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div
                                className={cn(
                                    "rounded-2xl px-3.5 py-2.5 max-w-[85%]",
                                    msg.role === "user"
                                        ? "bg-[#F05359] text-white rounded-tr-md"
                                        : "bg-white border border-gray-100 shadow-sm rounded-tl-md"
                                )}
                            >
                                {msg.role === "user" ? (
                                    <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                                ) : (
                                    <div className="space-y-2">{formatAiText(msg.content)}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-2.5 animate-in fade-in duration-300">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        Analyzing...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {/* Symptom chips (show when no messages yet or always) */}
            {!hasMessages && (
                <div className="flex gap-2 flex-wrap mb-3">
                    {SYMPTOM_CHIPS.map((chip) => (
                        <button
                            key={chip.label}
                            onClick={() => handleChipClick(chip.label)}
                            disabled={isLoading}
                            className={`${chip.color} border text-[11px] font-semibold px-3 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Quick suggestions after messages */}
            {hasMessages && !isLoading && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                    {[
                        `What food is best for ${petName}?`,
                        "Any signs to watch for?",
                        "When should I see a vet?",
                    ].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => sendQuestion(suggestion)}
                            className="bg-white/80 border border-gray-200/60 text-[10px] font-semibold text-gray-500 px-2.5 py-1.5 rounded-full hover:bg-gray-50 hover:text-gray-700 active:scale-95 transition-all flex items-center gap-1"
                        >
                            <Sparkles className="w-2.5 h-2.5" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200/60 rounded-2xl flex items-center px-4 py-3 bubble-sm">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask me anything about ${petName}'s health...`}
                    disabled={isLoading}
                    className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full font-medium disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2 shadow-md transition-all",
                        input.trim() && !isLoading
                            ? "bg-[#F05359] text-white active:scale-90 hover:bg-[#e0484e]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </form>
        </div>
    );
}
