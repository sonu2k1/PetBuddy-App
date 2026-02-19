import { ChevronRight, Package, Dog, Wallet, MapPin, HelpCircle, Settings, LogOut } from "lucide-react";

export function ProfileMenu() {
    const MENU_ITEMS = [
        { icon: Package, label: "My Orders", color: "text-blue-500" },
        { icon: Dog, label: "My Pets", color: "text-pink-500" },
        { icon: Wallet, label: "Wallet", color: "text-green-500", badge: "$124.00" },
        { icon: MapPin, label: "Addresses", color: "text-orange-500" },
    ];

    const SUPPORT_ITEMS = [
        { icon: HelpCircle, label: "Help & Support" },
        { icon: Settings, label: "Settings" },
    ];

    return (
        <div className="px-4 pb-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                {MENU_ITEMS.map((item, index) => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">{item.badge}</span>}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                {SUPPORT_ITEMS.map((item, index) => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm text-gray-700">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 text-red-500 font-bold p-3 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
            </button>
        </div>
    );
}
