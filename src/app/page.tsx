"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { SectionProvider, useSection } from "@/context/SectionContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HomeSection } from "@/components/sections/HomeSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ShopSection } from "@/components/sections/ShopSection";
import { CartSection } from "@/components/sections/CartSection";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { PetsSection } from "@/components/sections/PetsSection";
import { RescueSection } from "@/components/sections/RescueSection";
import { StoreSection } from "@/components/sections/StoreSection";
import { BookingSection } from "@/components/sections/BookingSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { NotificationsSection } from "@/components/sections/NotificationsSection";
import { LoginScreen } from "@/components/auth/LoginScreen";

function SectionRenderer() {
  const { activeSection } = useSection();

  switch (activeSection) {
    case "home":
      return <HomeSection />;
    case "services":
      return <ServicesSection />;
    case "shop":
      return <ShopSection />;
    case "cart":
      return <CartSection />;
    case "profile":
      return <ProfileSection />;
    case "community":
      return <CommunitySection />;
    case "pets":
      return <PetsSection />;
    case "rescue":
      return <RescueSection />;
    case "store":
      return <StoreSection />;
    case "booking":
      return <BookingSection />;
    case "product":
      return <ProductSection />;
    case "notifications":
      return <NotificationsSection />;
    default:
      return <HomeSection />;
  }
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MobileContainer hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#F05359] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <MobileContainer hideNav>
        <LoginScreen />
      </MobileContainer>
    );
  }

  return (
    <SectionProvider>
      <MobileContainer>
        <SectionRenderer />
      </MobileContainer>
    </SectionProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
