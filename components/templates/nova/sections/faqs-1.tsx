import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const faqItems = [
  {
    id: "item-1",
    question: "How are service providers verified?",
    answer:
      "Every provider submits their CNIC (national ID) during registration. Our team reviews each submission before the provider can appear in search results. Unverified profiles are never shown to customers.",
  },
  {
    id: "item-2",
    question: "Which cities does LabourIn cover?",
    answer:
      "We currently serve Lahore, Karachi, and Islamabad with neighborhood-level matching — areas like DHA, Gulberg, Johar Town, F-7, Clifton, and many more.",
  },
  {
    id: "item-3",
    question: "How do payments work?",
    answer:
      "LabourIn does not process payments. You discuss the budget directly with your provider and pay them cash after the job is complete. We charge zero commissions and zero booking fees.",
  },
  {
    id: "item-4",
    question: "How quickly can a worker arrive?",
    answer:
      "Workers marked 'Available Now' are currently active in your area and can typically arrive within 1 to 2 hours. You can filter specifically for available workers when searching.",
  },
  {
    id: "item-5",
    question: "I'm a tradesperson. How do I sign up as a provider?",
    answer:
      "Tap 'Register as a Provider', complete your profile with your skills and service areas, upload your CNIC, and wait for verification. Once approved, you start receiving direct leads from customers nearby.",
  },
  {
    id: "item-6",
    question: "Is LabourIn really free?",
    answer:
      "Yes — free for customers and free for service providers. No subscription fees, no per-lead charges, no commissions. We plan to sustain the platform through optional premium features in the future.",
  },
];

export default function FAQs() {
  return (
    <section id="faqs" className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            Quick answers about how LabourIn works for customers and service providers.
          </p>
        </div>
        <Card
          // variant="outline"
          className="mt-12 p-2"
        >
          <Accordion type="single" collapsible>
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b-0 px-4"
              >
                <AccordionTrigger className="cursor-pointer py-4 text-sm font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground pb-2 text-sm">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Still have questions?{" "}
          <Link href="#" className="text-primary font-medium hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </section>
  );
}
