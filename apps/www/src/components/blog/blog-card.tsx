import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import type { Post } from "content-collections";

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

export function BlogCard({ post, featured }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-[var(--gradient-mid)]/50 hover:shadow-lg hover:shadow-[var(--gradient-mid)]/5",
          featured ? "md:col-span-2" : ""
        )}
      >
        {featured && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gradient-mid)]/10 px-3 py-1 text-xs font-medium text-[var(--gradient-mid)]">
              Featured
            </span>
          </div>
        )}

        {post.tags && (
            <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
                <span
                key={tag}
                className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground"
                >
                {tag}
                </span>
            ))}
            </div>
        )}

        <h2
          className={cn(
            "mb-3 font-semibold tracking-tight transition-colors group-hover:text-[var(--gradient-mid)]",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}
        >
          {post.title}
        </h2>

        {post.description && (
            <p className="mb-6 line-clamp-2 text-muted-foreground">
            {post.description}
            </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {post.readingTime && (
                <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {post.readingTime} min read
                </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-sm font-medium text-[var(--gradient-mid)] opacity-0 transition-opacity group-hover:opacity-100">
            Read more
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}
