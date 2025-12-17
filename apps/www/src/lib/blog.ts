
import { allPosts } from "content-collections";

export interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  date: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  content: string; // Compiled MDX/HTML or source? With content-collections/mdx it provides `mdx` (React access) or `body`.
  mdx: string;
  readingTime: number;
}

// Re-export or map to match existing interface if possible, or update consumers.
// content-collections object:
// { title, date, ... mdx, slug }

export function getAllPosts() {
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  return allPosts.find((post) => post.slug === slug || post.slug === `content/blog/${slug}`) || null;
}

export function getAllSlugs() {
  return allPosts.map(post => post.slug);
}
