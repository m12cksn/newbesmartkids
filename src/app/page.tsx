import { DailyPracticeCard } from "@/components/home/DailyPracticeCard";
import { CallToAction } from "@/components/home/CallToAction";
import { ClassExplorer } from "@/components/home/ClassExplorer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export default function Home() {
  return (
    <main
      data-theme="besmartkids"
      className="min-h-screen bg-base-100 text-base-content"
    >
      <SiteHeader />
      <HeroSection />
      <HowItWorks />
      <ClassExplorer />
      <DailyPracticeCard />
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
