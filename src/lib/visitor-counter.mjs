const COOKIE_NAME = "pysunn_visitor";
const BROWSER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CRAWLER = /bot\b|crawler|spider|headless|preview|lighthouse/i;
const COUNT_SQL = "SELECT COALESCE((SELECT total FROM visitor_days WHERE day = ?), 0) AS total";

export function koreanDay(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function countFrom(results) {
  const total = results?.results?.[0]?.total;
  if (!results?.success || !Number.isSafeInteger(total) || total < 0) {
    throw new Error("Invalid visitor count result");
  }
  return total;
}

export async function recordVisit(db, day, browserId) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day}:${browserId}`));
  const hash = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const results = await db.batch([
    db.prepare("INSERT OR IGNORE INTO visitor_marks (day, visitor_hash) VALUES (?, ?)").bind(day, hash),
    db.prepare(COUNT_SQL).bind(day),
  ]);
  if (!results[0]?.success) throw new Error("Visitor write failed");
  return countFrom(results[1]);
}

function browserId(request) {
  const cookie = request.headers.get("Cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const value = cookie?.slice(COOKIE_NAME.length + 1);
  return value && BROWSER_ID.test(value) ? value.toLowerCase() : null;
}

function json(status, data, cookie) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(JSON.stringify(data), { status, headers });
}

export async function visitResponse(request, db, now = new Date(), report = console.error) {
  if (!["GET", "POST"].includes(request.method)) {
    const response = json(405, { error: "method_not_allowed" });
    response.headers.set("Allow", "GET, POST");
    return response;
  }
  if (request.method === "POST" && request.headers.get("Origin") !== new URL(request.url).origin) {
    return json(403, { error: "invalid_origin" });
  }

  const crawler = CRAWLER.test(request.headers.get("User-Agent") ?? "");
  const id = browserId(request);
  // Establish the cookie with GET before recording a visit. If that response
  // is lost or cookies are blocked, a POST cannot create a second anonymous ID.
  if (request.method === "POST" && !id && !crawler) {
    return json(400, { error: "visitor_cookie_required" });
  }

  try {
    if (!db) throw new Error("VISITOR_DB is not configured");
    const date = koreanDay(now);
    if (request.method === "POST" && !crawler) {
      return json(200, { date, today: await recordVisit(db, date, id) });
    }

    const [result] = await db.batch([db.prepare(COUNT_SQL).bind(date)]);
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    const cookie = !id && !crawler
      ? `${COOKIE_NAME}=${crypto.randomUUID()}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`
      : undefined;
    return json(200, { date, today: countFrom(result) }, cookie);
  } catch (error) {
    report({ event: "visitor_counter.failed", reason: error instanceof Error ? error.message : "Unknown database failure" });
    return json(503, { error: "visitor_counter_unavailable" });
  }
}
