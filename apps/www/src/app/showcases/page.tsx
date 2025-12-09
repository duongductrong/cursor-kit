import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { ShowcaseGrid, ShowcaseHero } from "@/components/showcase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Showcases | Cursor Kit",
  description:
    "See what's possible with AI-powered development. Real examples of interfaces built using one-shot prompts.",
};

export default function ShowcasesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ShowcaseHero />
        <ShowcaseGrid />
      </main>
      <Footer />
    </div>
  );
}
