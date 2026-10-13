import assert from "node:assert/strict";
import { test } from "node:test";
import { getBlogPage, blogPageHref } from "./blog-list.ts";

const posts = [
  ...Array.from({ length: 7 }, (_, index) => ({ id: `daily-${index}`, title: `Daily ${index}`, category: "Daily", publishedAt: `2026-10-${20 - index}` })),
  ...Array.from({ length: 6 }, (_, index) => ({ id: `algorithm-${index}`, title: `Algorithm ${index}`, category: "Algorithm", publishedAt: `2026-09-${20 - index}` })),
];

test("filters the entire catalog before taking a page, including older posts", () => {
  const page = getBlogPage(posts, "?category=algorithm");
  assert.equal(page.category, "Algorithm");
  assert.equal(page.totalItems, 6);
  assert.equal(page.pagination.totalPages, 2);
  assert.deepEqual(page.items.map((post) => post.id), ["algorithm-0", "algorithm-1", "algorithm-2", "algorithm-3", "algorithm-4"]);
  assert.equal(posts.length, 13);
});

test("a category page contains only matching posts and its final page is clamped", () => {
  const page = getBlogPage(posts, "?category=algorithm&page=99");
  assert.equal(page.pagination.page, 2);
  assert.deepEqual(page.items.map((post) => post.id), ["algorithm-5"]);
  assert.equal(page.pagination.hasNextPage, false);
  assert.equal(page.pagination.hasPreviousPage, true);
  assert.equal(getBlogPage(posts, "?category=daily&page=2").items.length, 2);
  assert.equal(getBlogPage(posts, "").totalItems, 13);
});

test("category links reset the page, while page links retain the category", () => {
  assert.equal(blogPageHref("Algorithm"), "/blog?category=algorithm");
  assert.equal(blogPageHref("Algorithm", 2), "/blog?category=algorithm&page=2");
  assert.equal(blogPageHref("All"), "/blog");
  assert.equal(blogPageHref("All", 2), "/blog?page=2");
});

test("empty categories stay on page one, and invalid categories are visible", () => {
  const page = getBlogPage(posts.filter((post) => post.category === "Daily"), "?category=algorithm&page=2");
  assert.equal(page.totalItems, 0);
  assert.equal(page.pagination.page, 1);
  assert.equal(page.items.length, 0);
  assert.equal(page.pagination.hasPreviousPage, false);
  const invalid = getBlogPage(posts, "?category=unknown");
  assert.ok(invalid.notice);
  assert.equal(invalid.category, "All");
  assert.equal(getBlogPage(posts, "?page=-1").pagination.page, 1);
});
