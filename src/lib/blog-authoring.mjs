const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

function requiredText(value, name, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new TypeError(`${name} must be non-empty and at most ${maxLength} characters`);
  }
  return value.trim();
}

export function createPostSource(input) {
  if (!input || typeof input !== "object") throw new TypeError("post must be an object");
  const title = requiredText(input.title, "title", 120);
  const slug = requiredText(input.slug, "slug", 80).normalize("NFC");
  if (!SLUG_PATTERN.test(slug)) throw new TypeError("slug is invalid");
  const publishedAt = requiredText(input.publishedAt, "publishedAt", 10);
  const parsed = new Date(`${publishedAt}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== publishedAt) {
    throw new TypeError("publishedAt must be a real YYYY-MM-DD date");
  }
  const summary = requiredText(input.summary, "summary", 300);
  const body = requiredText(input.body, "body", 200_000);
  return {
    slug,
    source: `---\ntitle: ${JSON.stringify(title)}\npublishedAt: ${JSON.stringify(publishedAt)}\nsummary: ${JSON.stringify(summary)}\n---\n\n${body}\n`,
  };
}

function base64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return btoa(binary);
}

export async function publishPost(input, token, fetcher = fetch) {
  const { slug, source } = createPostSource(input);
  if (!token) throw new Error("BLOG_GITHUB_TOKEN is not configured");
  const path = `src/content/blog/${slug}.md`;
  const response = await fetcher(`https://api.github.com/repos/pysunn14/pysunn14.github.io/contents/${encodeURI(path)}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    // Omitting sha is intentional: an existing post must never be overwritten.
    body: JSON.stringify({ message: "Publish blog post", branch: "main", content: base64Utf8(source) }),
  });
  if (response.status === 422 || response.status === 409) {
    throw Object.assign(new Error("이 주소의 글이 이미 있거나 저장소가 변경됐습니다."), { status: 409 });
  }
  if (!response.ok) {
    throw Object.assign(new Error(`GitHub returned ${response.status}`), { status: 502 });
  }
  return { slug, path };
}
