import { BLOG_CATEGORIES } from "./blog-categories.mjs";
import { paginate, normalizePage } from "./pagination.ts";

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type CategoryFilter = BlogCategory | "All";

export interface BlogPost {
  id: string;
  title: string;
  publishedAt: string;
  category: BlogCategory;
}

export function getBlogPage(posts: BlogPost[], search: string, pageSize = 5) {
  const params = new URLSearchParams(search);
  const requested = params.get("category");
  const category: CategoryFilter = BLOG_CATEGORIES.find((category) => category.toLowerCase() === requested?.toLowerCase()) ?? "All";
  const notice = requested && requested.toLowerCase() !== "all" && category === "All"
    ? "요청한 카테고리가 없어 전체 글을 표시합니다."
    : null;
  // Filter the full catalog before pagination. A prerendered page cannot use
  // request-time query parameters to choose which five posts to send the island.
  const matching = posts.filter((post) => category === "All" || post.category === category)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
  const page = normalizePage(params.get("page") ?? undefined, Math.max(1, Math.ceil(matching.length / pageSize)));
  return { category, notice, totalItems: matching.length, ...paginate(matching, { page, pageSize }) };
}

export function blogPageHref(category: CategoryFilter, page = 1) {
  const params = new URLSearchParams();
  if (category !== "All") params.set("category", category.toLowerCase());
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/blog${search ? `?${search}` : ""}`;
}
