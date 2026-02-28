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
import { OrderConfirmationSection } from "@/components/sections/OrderConfirmationSection";
import { TrackOrderSection } from "@/components/sections/TrackOrderSection";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { SplashScreen } from "@/components/ui/SplashScreen";

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
    case "order-confirmation":
      return <OrderConfirmationSection />;
    case "track-order":
      return <TrackOrderSection />;
    default:
      return <HomeSection />;
  }
}

function AppContent() {
  const { isAuthenticated, isLoading, justLoggedIn, clearJustLoggedIn } = useAuth();

  // Show splash on initial app load (auth hydration)
  if (isLoading) {
    return <SplashScreen duration={5000} />;
  }

  // Show splash for 5 seconds after OTP login
  if (isAuthenticated && justLoggedIn) {
    return <SplashScreen duration={5000} onFinish={clearJustLoggedIn} />;
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
