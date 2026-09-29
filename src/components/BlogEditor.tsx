import { useEffect, useState, type SyntheticEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Draft = {
  title: string;
  slug: string;
  publishedAt: string;
  summary: string;
  body: string;
};

const STORAGE_KEY = "pysunn-blog-draft";
const EMPTY_DRAFT: Draft = { title: "", slug: "", publishedAt: "", summary: "", body: "" };
const fieldClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/50";

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function slugFromTitle(title: string) {
  return title.normalize("NFKC").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export default function BlogEditor() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedSlug, setSavedSlug] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const restored = JSON.parse(stored) as Partial<Draft>;
        setDraft({ ...EMPTY_DRAFT, ...restored, publishedAt: restored.publishedAt || localDate() });
        setManualSlug(Boolean(restored.slug && restored.slug !== slugFromTitle(restored.title || "")));
      } catch {
        setDraft({ ...EMPTY_DRAFT, publishedAt: localDate() });
      }
    } else {
      setDraft({ ...EMPTY_DRAFT, publishedAt: localDate() });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, ready]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setMessage("");
    setSavedSlug("");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(value: string) {
    setMessage("");
    setSavedSlug("");
    setDraft((current) => ({
      ...current,
      title: value,
      slug: manualSlug ? current.slug : slugFromTitle(value),
    }));
  }

  async function save(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/__local/blog/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json() as { slug?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "저장하지 못했습니다.");
      localStorage.removeItem(STORAGE_KEY);
      setSavedSlug(result.slug || draft.slug);
      setMessage("파일을 저장했습니다.");
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
          <p className="mt-2 text-sm text-muted-foreground">이 컴퓨터의 블로그 글 폴더에 저장됩니다.</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">로컬 전용</span>
      </header>

      <form onSubmit={save} className="space-y-8">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">제목</span>
            <input className={`${fieldClass} text-lg font-medium`} value={draft.title} onChange={(event) => updateTitle(event.target.value)} maxLength={120} placeholder="글 제목" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">주소</span>
              <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-foreground/50">
                <span className="pl-3 text-sm text-muted-foreground">/blog/</span>
                <input className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none" value={draft.slug} onChange={(event) => { setManualSlug(true); update("slug", event.target.value); }} placeholder="글-주소" maxLength={80} required />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">날짜</span>
              <input type="date" className={fieldClass} value={draft.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} required />
            </label>
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
            {savedSlug && <a className="text-sm underline underline-offset-4" href={`/blog/${encodeURIComponent(savedSlug)}`}>글 보기</a>}
            <button type="submit" disabled={saving} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50">
              {saving ? "저장 중…" : "파일 저장"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
