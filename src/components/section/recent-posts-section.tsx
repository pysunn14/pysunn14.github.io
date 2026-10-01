import BlurFade from "@/components/magicui/blur-fade";
import { ArrowRight } from "lucide-react";
import Markdown from "react-markdown";

const postDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Seoul",
});

const previewElements = [
  "p", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "br",
];

export interface RecentPost {
  id: string;
  title: string;
  excerpt: string;
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:ring-2 hover:ring-muted"
            >
              <a
                href={`/blog/${post.id}`}
                aria-label={`${post.title} 읽기`}
                className="flex h-full min-w-0 flex-col rounded-xl transition-colors active:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400"
              >
                <div className="flex-1 p-5">
                  <h3 className="line-clamp-2 text-base font-semibold wrap-anywhere transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    {post.title}
                  </h3>
                  <div className="mt-3 max-h-48 overflow-hidden text-sm leading-relaxed text-muted-foreground wrap-anywhere [&>*+*]:mt-3 [&_:is(h1,h2,h3,h4,h5,h6,strong)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6,strong)]:text-foreground [&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-4">
                    <Markdown allowedElements={previewElements} unwrapDisallowed skipHtml>
                      {post.excerpt}
                    </Markdown>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border bg-background/50 px-4 py-3">
                  <time dateTime={post.publishedAt} className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                    {postDate.format(new Date(post.publishedAt))}
                  </time>
                  <span className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-border px-2.5 text-xs font-medium transition-colors group-hover:bg-muted">
                    Read
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </BlurFade>
    </section>
  );
}
