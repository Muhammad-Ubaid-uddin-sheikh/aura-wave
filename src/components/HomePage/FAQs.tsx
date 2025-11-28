"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong className="text-primary" key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

const faqs = [
  {
    question: "Is the watch waterproof?",
    answer:
      "The Oulm 1349 is rated **3 BAR water resistant**. It can handle everyday splashes or light rain, but it is **not suitable for swimming, diving, or showering**.",
  },
  {
    question: "Does it have a working compass and thermometer?",
    answer:
      "No, the compass and thermometer are **decorative only**. They are meant to enhance the rugged aesthetic of the watch, but do not function as real instruments.",
  },
  {
    question: "What type of movement does it use?",
    answer:
      "It runs on a reliable **Quartz movement**, powered by a standard battery. This ensures accurate timekeeping with minimal maintenance.",
  },
  {
    question: "How big is the watch dial?",
    answer:
      "The Oulm 1349 features a **super large dial**, approximately **5 × 5.8 cm**, giving it a bold and unique appearance on the wrist.",
  },
  {
    question: "What material is the strap made of?",
    answer:
      "The band is crafted from **leather**, with a length of about **26 cm**. It’s designed for durability and comfortable daily wear.",
  },
  {
    question: "What is the case made of?",
    answer:
      "The case is made from a sturdy **alloy metal**, with a thickness of around **13 mm**. This gives the watch a premium, heavy feel.",
  },
  {
    question: "How heavy is the watch?",
    answer:
      "The watch weighs about **114.5 grams**, giving it a solid and substantial presence on the wrist.",
  },
  {
    question: "Is there any warranty?",
    answer:
      "Warranty availability depends on the **seller or retailer** you purchase from. On most marketplaces like AliExpress or Alibaba, sellers may offer limited coverage.",
  },
];


const FAQs = () => {
  return (
    <section id="faqs" aria-label="Frequently Asked Questions" className="max-w-3xl mx-auto px-4 py-16">
      {/* Heading */}
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-poppinsBold text-primary tracking-wider relative inline-block">
          FAQs
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-accent-foreground rounded-full" />
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Find answers to common questions about the product, its features, and support.
        </p>
      </div>

      {/* Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 py-2 shadow-sm">
            <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-primary hover:underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
                <div className="pb-4 pt-2 text-primary/80 text-sm sm:text-base">{renderBold(faq.answer)}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQs;