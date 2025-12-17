import { notFound } from "next/navigation";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { ArticleHeader, ArticleFooter, mdxComponents } from "@/components/blog";
import { getPostBySlug, getAllSlugs, getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import { useMDXComponent } from "@content-collections/mdx/react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found - Cursor Kit",
    };
  }

  return {
    title: `${post.title} - Cursor Kit Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
  
  // Use MDX component from content-collections
  const MDXContent = useMDXComponent(post.mdx);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ArticleHeader post={post} />
        <article className="prose-custom mx-auto max-w-3xl px-6 pb-16">
          <MDXContent components={mdxComponents} />
        </article>
        <ArticleFooter prevPost={prevPost} nextPost={nextPost} />
      </main>
      <Footer />
    </div>
  );
}
