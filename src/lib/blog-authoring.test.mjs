import assert from "node:assert/strict";
import { test } from "node:test";
import { createPostSource, publishPost } from "./blog-authoring.mjs";

const post = {
  title: "첫 글",
  slug: "first-post",
  publishedAt: "2026-09-29",
  summary: "요약",
  body: "본문",
};

test("formats and validates a new post", () => {
  const { slug, source } = createPostSource(post);
  assert.equal(slug, "first-post");
  assert.match(source, /title: "첫 글"/);
  assert.match(source, /\n본문\n$/);
  assert.throws(() => createPostSource({ ...post, slug: "../escape" }), /slug/);
  assert.throws(() => createPostSource({ ...post, publishedAt: "2026-02-30" }), /publishedAt/);
});

test("publishes only a new file to the configured repository", async () => {
  let request;
  const fetcher = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ content: { path: "src/content/blog/first-post.md" } }), { status: 201 });
  };
  await publishPost(post, "token", fetcher);
  assert.equal(request.url, "https://api.github.com/repos/pysunn14/pysunn14.github.io/contents/src/content/blog/first-post.md");
  assert.equal(request.options.method, "PUT");
  assert.equal(request.options.headers.Authorization, "Bearer token");
  const payload = JSON.parse(request.options.body);
  assert.equal(payload.branch, "main");
  assert.equal(payload.sha, undefined);
});

test("reports a duplicate slug without replacing the existing file", async () => {
  const fetcher = async () => new Response(JSON.stringify({ message: "already exists" }), { status: 422 });
  await assert.rejects(publishPost(post, "token", fetcher), { status: 409 });
});
