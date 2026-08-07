import CallToAction from "@/components/templates/nova/sections/call-to-action-1";
import Content from "@/components/templates/nova/sections/content-1";
import FAQs from "@/components/templates/nova/sections/faqs-1";
import Features from "@/components/templates/nova/sections/features-1";
import Footer from "@/components/templates/nova/sections/footer-1";
import HeroSection from "@/components/templates/nova/sections/hero-section-1";
import Pricing from "@/components/templates/nova/sections/pricing-1";
export const metadata = {
  title: "LabourIn — Verified Local Workers, Ready Now",
  description:
    "Find CNIC-verified electricians, plumbers, and AC technicians in Lahore, Karachi, and Islamabad. Direct WhatsApp contact, zero commissions.",
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
