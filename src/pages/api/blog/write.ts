import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { verifyOwner } from "@/lib/github-auth.mjs";
import { publishPost } from "@/lib/blog-authoring.mjs";

const MAX_REQUEST_BYTES = 1_000_000;

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new TypeError("본문이 비어 있습니다.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw Object.assign(new Error("글이 너무 깁니다."), { status: 413 });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, string | undefined>;
  if (!(await verifyOwner(request, bindings))) return json(403, { error: "작성자 인증이 필요합니다." });
  if (request.headers.get("Origin") !== new URL(request.url).origin) return json(403, { error: "요청 출처가 올바르지 않습니다." });
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) return json(415, { error: "JSON 요청만 받습니다." });
  if (!bindings.BLOG_GITHUB_TOKEN) return json(503, { error: "GitHub 저장 설정이 완료되지 않았습니다." });

  try {
    const input = await readJson(request);
    const result = await publishPost(input, bindings.BLOG_GITHUB_TOKEN);
    return json(201, result);
  } catch (error) {
    if (error instanceof TypeError || error instanceof SyntaxError) return json(400, { error: error.message });
    if (error && typeof error === "object" && "status" in error) {
      const status = Number(error.status);
      if (status === 409 || status === 413) return json(status, { error: error instanceof Error ? error.message : "저장하지 못했습니다." });
    }
    console.error("Blog publish failed", error);
    return json(502, { error: "글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." });
  }
};
