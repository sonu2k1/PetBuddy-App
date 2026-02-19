"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { SectionProvider, useSection } from "@/context/SectionContext";
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

export default function Home() {
  return (
    <SectionProvider>
      <MobileContainer>
        <SectionRenderer />
      </MobileContainer>
    </SectionProvider>
  );
}
