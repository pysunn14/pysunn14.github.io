import BlurFade from "@/components/magicui/blur-fade";
import { ArrowRight } from "lucide-react";

export interface RecentPost {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

export default function RecentPostsSection({ posts }: { posts: RecentPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="recent-posts" aria-labelledby="recent-posts-heading">
      <BlurFade delay={0.04 * 17}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-posts-heading" className="text-xl font-bold">Recent Posts</h2>
          <a
            href="/blog"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400"
          >
            전체 글 보기
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex flex-col gap-2 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400"
            >
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="min-w-0 text-base font-semibold wrap-anywhere transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {post.title}
                </h3>
                <time dateTime={post.publishedAt} className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {post.publishedAt}
                </time>
              </div>
              {post.summary.trim() && (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground wrap-anywhere">
                  {post.summary}
                </p>
              )}
            </a>
          ))}
        </div>
      </BlurFade>
    </section>
  );
}
