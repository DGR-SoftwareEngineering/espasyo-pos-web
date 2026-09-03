import React, { useEffect } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import {
  Navbar,
  HeroSection,
  WhatIsSection,
  FeaturesSection,
  PromosSection,
  ProductsSection,
  OrderingSection,
  LoyaltySection,
  StatsSection,
  TestimonialsSection,
  CTASection,
  Footer,
  ScrollProgress,
  FloatingElements
} from "../components/landing";


export default function Home() {

  useEffect(() => {
    const preloadImages = [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80",
    ];
    preloadImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);
  
  return (
    <Box style={{ overflowX: "hidden" }}>
      <ScrollProgress />
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <WhatIsSection />
      <FeaturesSection />
      <PromosSection />
      <ProductsSection />
      <OrderingSection />
      <LoyaltySection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </Box>
  );
}
