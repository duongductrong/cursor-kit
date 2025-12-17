import Link from "next/link";
import type { Post } from "content-collections";

interface BlogItemProps {
  post: Post;
}

function BlogItem({ post }: BlogItemProps) {
  return (
    <Link 
      href={`/blog/${post.slug}`} 
      className="group flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-foreground"
    >
      <span className="text-base font-medium text-foreground/90 transition-colors group-hover:text-foreground md:text-lg">
        {post.title}
      </span>
      <span className="shrink-0 text-sm text-muted-foreground/60 tabular-nums">
        {new Date(post.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </Link>
  );
}

interface BlogListProps {
  posts: Post[];
}

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-muted-foreground/60">
            No posts yet. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  // Group posts by year
  const postsByYear = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <section className="pb-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="space-y-12">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground/50">
                {year}
              </h2>
              <div className="divide-y divide-border/50">
                {postsByYear[year].map((post) => (
                  <BlogItem key={post.slug} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
