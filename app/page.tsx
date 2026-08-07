import CallToAction from "@/components/templates/nova/sections/call-to-action-1";
import Content from "@/components/templates/nova/sections/content-1";
import FAQs from "@/components/templates/nova/sections/faqs-1";
import Features from "@/components/templates/nova/sections/features-1";
import Footer from "@/components/templates/nova/sections/footer-1";
import HeroSection from "@/components/templates/nova/sections/hero-section-1";
import Pricing from "@/components/templates/nova/sections/pricing-1";
export const metadata = {
  title: "LabourIn — Verified Service Providers",
  description:
    "LabourIn connects customers with verified, available service providers.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Features />
      <Content />
      <Pricing />
      <FAQs />
      <CallToAction />
      <Footer />
    </>
  );
}
