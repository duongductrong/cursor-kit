import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Post } from "content-collections";

interface ArticleFooterProps {
  prevPost?: Post;
  nextPost?: Post;
}

export function ArticleFooter({ prevPost, nextPost }: ArticleFooterProps) {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 pb-24 pt-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between gap-8">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex items-center gap-3 text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider">Previous</span>
                <span className="mt-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                  {prevPost.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex items-center gap-3 text-right text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs uppercase tracking-wider">Next</span>
                <span className="mt-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                  {nextPost.title}
                </span>
              </div>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
