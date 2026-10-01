import { useEffect, useState, type SyntheticEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { localDate, restoreDraft, refreshDraftDate } from "@/lib/blog-draft.mjs";

type Draft = {
  title: string;
  publishedAt: string;
  summary: string;
  body: string;
  dateMode: "today" | "manual";
};

const STORAGE_KEY = "pysunn-blog-draft";
const EMPTY_DRAFT: Draft = { title: "", publishedAt: "", summary: "", body: "", dateMode: "today" };
const fieldClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/50";

function slugFromTitle(title: string) {
  return title.normalize("NFKC").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export default function BlogEditor({ remote = false }: { remote?: boolean }) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDraft(restoreDraft(JSON.parse(stored), localDate()) as Draft);
      } catch {
        setDraft({ ...EMPTY_DRAFT, publishedAt: localDate() });
      }
    } else {
      setDraft({ ...EMPTY_DRAFT, publishedAt: localDate() });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // Refresh at local midnight and after a suspended tab becomes active again.
    let timer: ReturnType<typeof setTimeout>;
    function refreshDate() {
      clearTimeout(timer);
      setDraft((current) => refreshDraftDate(current, localDate()));
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refreshDate, midnight.getTime() - now.getTime());
    }
    refreshDate();
    window.addEventListener("focus", refreshDate);
    window.addEventListener("pageshow", refreshDate);
    document.addEventListener("visibilitychange", refreshDate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refreshDate);
      window.removeEventListener("pageshow", refreshDate);
      document.removeEventListener("visibilitychange", refreshDate);
    };
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, ready]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setMessage("");
    setSavedSlug("");
    setDraft((current) => ({ ...current, [key]: value, ...(key === "publishedAt" ? { dateMode: "manual" as const } : {}) }));
  }

  async function save(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const slug = slugFromTitle(draft.title);
      if (!slug) throw new Error("제목에 글자나 숫자를 포함해 주세요.");
      const response = await fetch(remote ? "/api/blog/write" : "/__local/blog/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, slug }),
      });
      const result = await response.json() as { slug?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "저장하지 못했습니다.");
      localStorage.removeItem(STORAGE_KEY);
      setSavedSlug(result.slug || slug);
      setMessage(remote ? "저장소에 글을 등록했습니다. 배포 후 공개됩니다." : "파일을 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Blog</a>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Write</h1>
          <p className="mt-2 text-sm text-muted-foreground">{remote ? "GitHub 저장소에 새 글을 등록합니다." : "이 컴퓨터의 블로그 글 폴더에 저장됩니다."}</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{remote ? "작성자 전용" : "로컬 전용"}</span>
      </header>

      <form onSubmit={save} className="space-y-8">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">제목</span>
            <input className={`${fieldClass} text-lg font-medium`} value={draft.title} onChange={(event) => update("title", event.target.value)} maxLength={120} placeholder="글 제목" required />
          </label>
          <div className="sm:max-w-44">
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <label htmlFor="published-at">날짜</label>
              {draft.dateMode === "manual" && <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => {
                setMessage("");
                setSavedSlug("");
                setDraft((current) => ({ ...current, publishedAt: localDate(), dateMode: "today" }));
              }}>오늘</button>}
            </div>
            <input id="published-at" type="date" className={fieldClass} value={draft.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} required />
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">요약</span>
            <textarea className={`${fieldClass} min-h-20 resize-y`} value={draft.summary} onChange={(event) => update("summary", event.target.value)} maxLength={300} placeholder="글 목록과 검색 결과에 표시할 짧은 소개" required />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 flex items-center justify-between text-sm font-medium">본문 <span className="text-xs font-normal text-muted-foreground">Markdown</span></span>
            <textarea className={`${fieldClass} min-h-[32rem] resize-y leading-7`} value={draft.body} onChange={(event) => update("body", event.target.value)} placeholder="여기서 글을 작성하세요." required spellCheck />
          </label>
          <div className="min-w-0">
            <div className="mb-2 text-sm font-medium">미리보기</div>
            <div className="min-h-[32rem] rounded-lg border border-border bg-card px-5 py-5">
              <h2 className="break-words text-2xl font-semibold tracking-tight">{draft.title || "글 제목"}</h2>
              <p className="mt-2 text-xs text-muted-foreground">{draft.publishedAt}</p>
              {draft.summary && <p className="mt-5 border-l-2 border-border pl-3 text-sm text-muted-foreground">{draft.summary}</p>}
              <div className="prose prose-sm mt-6 max-w-none break-words text-foreground dark:prose-invert">
                {draft.body ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.body}</ReactMarkdown> : <p className="text-muted-foreground">본문 미리보기</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-xs text-muted-foreground">입력 중인 내용은 이 브라우저에 임시 저장됩니다.</p>
          <div className="flex items-center gap-3">
            <span role="status" className="text-sm text-muted-foreground">{message}</span>
            {savedSlug && !remote && <a className="text-sm underline underline-offset-4" href={`/blog/${encodeURIComponent(savedSlug)}`}>글 보기</a>}
            <button type="submit" disabled={saving} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50">
              {saving ? "저장 중…" : remote ? "글 등록" : "파일 저장"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
