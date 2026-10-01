import assert from "node:assert/strict";
import { test } from "node:test";
import { localDate, restoreDraft, refreshDraftDate } from "./blog-draft.mjs";

test("restores draft content with today's date instead of an old automatic date", () => {
  const stored = { title: "제목", publishedAt: "2026-09-30", summary: "요약", body: "본문" };
  const draft = restoreDraft(stored, "2026-10-02");
  assert.deepEqual(draft, { ...stored, publishedAt: "2026-10-02", dateMode: "today" });
});

test("keeps a date the author explicitly selected when restoring and changing days", () => {
  const stored = { title: "제목", publishedAt: "2026-09-28", summary: "요약", body: "본문", dateMode: "manual" };
  assert.deepEqual(restoreDraft(stored, "2026-10-02"), stored);
  assert.equal(refreshDraftDate(stored, "2026-10-03"), stored);
});

test("updates only an automatic date when the local calendar day changes", () => {
  const draft = restoreDraft({ body: "작성 중인 글" }, "2026-10-02");
  assert.deepEqual(refreshDraftDate(draft, "2026-10-03"), { ...draft, publishedAt: "2026-10-03" });
  assert.equal(refreshDraftDate(draft, "2026-10-02"), draft);
});

test("uses the browser's local day, including time zones on either side of UTC", () => {
  assert.equal(localDate({ getTime: () => Date.parse("2026-10-01T15:30:00Z"), getTimezoneOffset: () => -540 }), "2026-10-02");
  assert.equal(localDate({ getTime: () => Date.parse("2026-10-02T00:30:00Z"), getTimezoneOffset: () => 420 }), "2026-10-01");
});
