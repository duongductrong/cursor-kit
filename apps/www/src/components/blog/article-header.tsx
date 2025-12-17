import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Post } from "content-collections";

interface ArticleHeaderProps {
  post: Post;
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="pb-12 pt-20 md:pb-16 md:pt-28">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </Link>

        <time className="block text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>

        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        {post.description && (
          <p className="mt-6 text-lg text-muted-foreground/80 md:text-xl">
            {post.description}
          </p>
        )}
      </div>
    </header>
  );
}
