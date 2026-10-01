export function localDate(now = new Date()) {
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function restoreDraft(stored, today) {
  const manual = stored?.dateMode === "manual" && stored.publishedAt;
  return {
    title: stored?.title || "",
    publishedAt: manual ? stored.publishedAt : today,
    summary: stored?.summary || "",
    body: stored?.body || "",
    // An automatic date is refreshed on reopening; an explicitly chosen date survives.
    dateMode: manual ? "manual" : "today",
  };
}

export function refreshDraftDate(draft, today) {
  if (draft.dateMode === "manual" || draft.publishedAt === today) return draft;
  return { ...draft, publishedAt: today };
}
