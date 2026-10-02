import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { visitResponse } from "@/lib/visitor-counter.mjs";

export const prerender = false;
export const ALL: APIRoute = ({ request }) => visitResponse(request, env.VISITOR_DB);
