import { CallToAction } from "@/components/home/CallToAction";
import { ClassExplorer } from "@/components/home/ClassExplorer";
import { DailyPracticeCard } from "@/components/home/DailyPracticeCard";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LatestMaterials } from "@/components/home/LatestMaterials";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { materials } from "@/data/materials";

export default function Home() {
  const counts = materials.reduce<Record<number, number>>((acc, m) => ({ ...acc, [m.classId]: (acc[m.classId] ?? 0) + 1 }), {});
  return (
    <main data-theme="besmartkids" className="min-h-screen bg-base-100 text-base-content">
      <SiteHeader />
      <HeroSection />
      <HowItWorks />
      <LatestMaterials />
      <ClassExplorer counts={counts} />
      <DailyPracticeCard />
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
