import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { clearFlowCookie, finishLogin } from "@/lib/github-auth.mjs";

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await finishLogin(request, env);
    const headers = new Headers({ Location: "/write", "Cache-Control": "no-store" });
    headers.append("Set-Cookie", session);
    headers.append("Set-Cookie", clearFlowCookie());
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.warn("Blog login denied", error instanceof Error ? error.message : error);
    return new Response("GitHub 로그인에 실패했습니다.", {
      status: 403,
      headers: { "Set-Cookie": clearFlowCookie(), "Cache-Control": "no-store" },
    });
  }
};
