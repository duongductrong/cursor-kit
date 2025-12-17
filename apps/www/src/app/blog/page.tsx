import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { BlogHero, BlogList } from "@/components/blog";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Cursor Kit",
  description:
    "Tips, tutorials, and insights on AI-powered development. Learn how to write better prompts and boost your coding productivity.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <BlogHero />
        <BlogList posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
