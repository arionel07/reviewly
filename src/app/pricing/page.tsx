import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — Reviewly",
  description: "Simple plans for collecting feedback and getting client approval.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
