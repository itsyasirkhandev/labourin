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
    question: "How does provider CNIC verification work?",
    answer:
      "All service providers must submit their CNIC identity details during onboarding. Our team manually verifies every profile before approving them to appear in search results.",
  },
  {
    id: "item-2",
    question: "Which cities and areas are supported?",
    answer:
      "LabourIn currently serves Lahore, Karachi, and Islamabad with neighborhood-level matching (e.g. DHA, Gulberg, Johar Town, F-7, Clifton, etc.).",
  },
  {
    id: "item-3",
    question: "How do I pay the worker?",
    answer:
      "LabourIn charges zero commissions and zero booking fees. You discuss the budget directly with your provider and pay them cash offline upon job completion.",
  },
  {
    id: "item-4",
    question: "How fast can a worker arrive at my address?",
    answer:
      "By filtering providers marked 'Available Now', you connect with workers currently active in your area who can usually arrive within 1 to 2 hours.",
  },
  {
    id: "item-5",
    question: "How can tradespeople register as service providers?",
    answer:
      "Simple! Click 'Register as Provider', complete the quick profile setup with your skills, city, areas served, and upload your CNIC. Once approved, you can start receiving direct leads.",
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
            Everything you need to know about finding and offering services on LabourIn.
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
