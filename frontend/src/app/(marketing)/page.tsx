import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TriageGuide } from "@/components/landing/TriageGuide";
import { FAQ } from "@/constants/landing";
import { PAGES, Pages } from "@/constants/pages";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { buildMetadata } from "@/utilities/seo";

export const metadata = buildMetadata(Pages.HOME);

// Structured data for search engines: the app itself + the FAQ
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: PAGES[Pages.HOME].description,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  },
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // static JSON from our own constants
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Hero />
      <HowItWorks />
      <Features />
      <TriageGuide />
      <DeveloperSection />
      <Faq />
      <FinalCta />
    </>
  );
}
