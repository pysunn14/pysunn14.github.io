import BlurFade from "@/components/magicui/blur-fade";
import { ChevronRight } from "lucide-react";
import { useSyncExternalStore, type MouseEvent } from "react";
import { BLOG_CATEGORIES } from "@/lib/blog-categories.mjs";
import { getBlogPage, blogPageHref, type BlogPost, type CategoryFilter } from "@/lib/blog-list";

const BLUR_FADE_DELAY = 0.04;

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

const currentSearch = () => window.location.search;
const serverSearch = () => "";
const filters: CategoryFilter[] = ["All", ...BLOG_CATEGORIES];

function navigate(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  if (event.currentTarget.href === window.location.href) return;
  window.history.pushState(null, "", event.currentTarget.href);
  // Native links still support sharing and modified clicks. Notify the island
  // after a local query change; Back/Forward already dispatch native popstate.
  window.dispatchEvent(new PopStateEvent("popstate"));
  document.getElementById("blog")?.scrollIntoView({ block: "start" });
}

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  const search = useSyncExternalStore(subscribeToLocation, currentSearch, serverSearch);
  const { category, notice, items, totalItems, pagination } = getBlogPage(posts, search);
  return (
    <section id="blog">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Blog{" "}
            <span className="ml-1 bg-card border border-border rounded-md px-2 py-1 text-muted-foreground text-sm">
              글 {totalItems}개
            </span>
          </h1>
          <a href="/write" className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400 active:bg-secondary">Write</a>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          연구와 개발 과정에서 정리한 글을 올릴 예정입니다.
        </p>
        <nav aria-label="글 카테고리" className="mb-8 flex items-center gap-6 border-b border-border">
          {filters.map((filter) => (
            <a
              key={filter}
              href={blogPageHref(filter)}
              onClick={navigate}
              aria-current={category === filter ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-0.5 text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400 ${category === filter ? "border-sky-700 text-sky-700 dark:border-sky-400 dark:text-sky-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {filter}
              <span className="text-xs tabular-nums text-muted-foreground">{filter === "All" ? posts.length : posts.filter((post) => post.category === filter).length}</span>
            </a>
          ))}
        </nav>
        {notice && <p role="status" className="mb-5 text-sm text-muted-foreground">{notice}</p>}
      </BlurFade>

      {items.length > 0 ? (
        <>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex flex-col gap-5">
              {items.map((post, id) => {
                const indexNumber = (pagination.page - 1) * pagination.pageSize + id + 1;
                return (
                  <BlurFade delay={BLUR_FADE_DELAY * 3 + id * 0.05} key={post.id}>
                    <a
                      className="flex items-start gap-x-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      href={`/blog/${post.id}`}
                    >
                      <span className="text-xs font-mono tabular-nums font-medium mt-[5px]">
                        {String(indexNumber).padStart(2, "0")}.
                      </span>
                      <div className="flex flex-col gap-y-2 flex-1">
                        <p className="tracking-tight text-lg font-medium">
                          <span className="group-hover:text-foreground transition-colors">
                            {post.title}
                            <ChevronRight
                              className="ml-1 inline-block size-4 stroke-3 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                              aria-hidden
                            />
                          </span>
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                          <span>{post.category}</span>
                        </p>
                      </div>
                    </a>
                  </BlurFade>
                );
              })}
            </div>
          </BlurFade>

          {pagination.totalPages > 1 && (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex gap-3 flex-row items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <a
                      href={blogPageHref(category, pagination.page - 1)}
                      onClick={navigate}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Previous
                    </a>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <a
                      href={blogPageHref(category, pagination.page + 1)}
                      onClick={navigate}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Next
                    </a>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </BlurFade>
          )}
        </>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-xl">
            <p className="text-muted-foreground text-center">
              {category === "All" ? "아직 게시한 글이 없습니다." : `아직 ${category} 글이 없습니다.`}
            </p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
