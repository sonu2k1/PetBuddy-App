import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center">
            {/* Mobile View */}
            <div
                className={cn(
                    "w-full max-w-[430px] bg-white min-h-screen relative shadow-2xl overflow-x-hidden md:hidden pb-[80px]", // Added padding-bottom to prevent content hidden behind nav
                    className
                )}
            >
                {children}
                <div className="fixed bottom-0 w-full max-w-[430px] z-50">
                    <BottomNav />
                </div>
            </div>

            {/* Desktop Warning - Visible only on md screens and up */}
            <div className="hidden md:flex flex-col items-center justify-center h-screen text-center p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                        <path d="M12 18h.01" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Mobile Only Experience</h1>
                <p className="text-gray-500 mb-6">
                    This application is designed specifically for mobile devices.
                    Please use your phone or switch to mobile view in your browser's developer tools.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-200">
                    <p className="font-bold mb-1">Developer Tip:</p>
                    <p>Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-xs">F12</kbd> then <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-xs">Ctrl+Shift+M</kbd> to toggle device toolbar.</p>
                </div>
            </div>
        </div>
    );
}
