import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { savePost } from "./local-blog-writer.mjs";

const post = {
  title: "첫 번째 글",
  slug: "첫-번째-글",
  publishedAt: "2026-09-29",
  summary: '따옴표 "포함" 요약',
  body: "## 본문\n\n내용입니다.",
};

test("saves a Markdown post with valid frontmatter", async () => {
  const directory = await mkdtemp(join(tmpdir(), "blog-writer-"));
  try {
    const result = await savePost(directory, post);
    assert.equal(result.slug, post.slug);
    const source = await readFile(join(directory, "첫-번째-글.md"), "utf8");
    assert.match(source, /title: "첫 번째 글"/);
    assert.match(source, /summary: "따옴표 \\"포함\\" 요약"/);
    assert.match(source, /## 본문\n\n내용입니다\./);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("does not overwrite a post with the same slug", async () => {
  const directory = await mkdtemp(join(tmpdir(), "blog-writer-"));
  try {
    await savePost(directory, post);
    await assert.rejects(savePost(directory, post), { code: "EEXIST" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects paths and impossible dates", async () => {
  const directory = await mkdtemp(join(tmpdir(), "blog-writer-"));
  try {
    await assert.rejects(savePost(directory, { ...post, slug: "../other" }), /slug/);
    await assert.rejects(savePost(directory, { ...post, publishedAt: "2026-02-30" }), /publishedAt/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
