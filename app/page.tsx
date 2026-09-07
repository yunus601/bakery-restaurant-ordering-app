import { AboutSection } from "@/components/AboutSection";
import { ExploreGallery } from "@/components/ExploreGallery";
import { FeaturedTreats } from "@/components/FeaturedTreats";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PromotionBanner } from "@/components/PromotionBanner";
import { TopProducts } from "@/components/TopProducts";

export default function HomePage() {
  return (
    <main className="relative">
      <SiteHeader />
      <Hero />
      <TopProducts />
      <PromotionBanner />
      <ExploreGallery />
      <AboutSection />
      <FeaturedTreats />
      <Footer />
    </main>
  );
}
