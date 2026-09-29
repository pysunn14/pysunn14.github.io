import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { beginLogin } from "@/lib/github-auth.mjs";

export const GET: APIRoute = async ({ request }) => {
  try {
    const { url, cookie } = await beginLogin(request, env);
    return new Response(null, {
      status: 302,
      headers: { Location: url, "Set-Cookie": cookie, "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Blog login configuration failed", error);
    return new Response("글쓰기 로그인이 아직 설정되지 않았습니다.", { status: 503 });
  }
};
