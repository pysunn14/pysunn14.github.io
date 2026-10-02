import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import {
  koreanDay,
  recordVisit,
  visitResponse,
} from "./visitor-counter.mjs";

const firstBrowser = "02c6da61-24a7-428d-9729-31bd8a596ac2";
const secondBrowser = "c0b39093-a9d1-440c-a3c5-48ccb4a2da0a";
const cookieName = "pysunn_visitor";
const now = new Date("2026-10-03T03:00:00Z");

// Execute the application's SQL against SQLite, rather than returning canned
// D1 results. The same migration is applied to the production D1 database.
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../../migrations/0001_visitors.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    prepare(sql) {
      return { bind: (...values) => ({ sql, values }) };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map(({ sql, values }) => ({
          success: true,
          results: sqlite.prepare(sql).all(...values),
        }));
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

function request(id, { origin = "https://pysunn.me", method = "POST", agent = "Mozilla/5.0" } = {}) {
  return new Request("https://pysunn.me/api/visits", {
    method,
    headers: {
      Origin: origin,
      "User-Agent": agent,
      ...(id ? { Cookie: `${cookieName}=${id}` } : {}),
    },
  });
}

test("a Korean day changes at midnight, independently of the server timezone", () => {
  assert.equal(koreanDay(new Date("2026-10-03T14:59:59Z")), "2026-10-03");
  assert.equal(koreanDay(new Date("2026-10-03T15:00:00Z")), "2026-10-04");
});

test("refreshes and concurrent requests from one browser count once", async () => {
  const db = database();
  const results = await Promise.all(Array.from({ length: 12 }, () => recordVisit(db, "2026-10-03", firstBrowser)));
  assert.deepEqual(results, Array(12).fill(1));
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM visitor_marks").get().count, 1);
});

test("different browsers count separately, and the same browser counts on the next day", async () => {
  const db = database();
  assert.equal(await recordVisit(db, "2026-10-03", firstBrowser), 1);
  assert.equal(await recordVisit(db, "2026-10-03", secondBrowser), 2);
  assert.equal(await recordVisit(db, "2026-10-04", firstBrowser), 1);
  assert.equal(await recordVisit(db, "2026-10-04", firstBrowser), 1);
  assert.equal(db.sqlite.prepare("SELECT total FROM visitor_days WHERE day = '2026-10-03'").get().total, 2);
  assert.ok(!JSON.stringify(db.sqlite.prepare("SELECT * FROM visitor_marks").all()).includes(firstBrowser));
});

test("a first visit issues a persistent cookie, then reuses it across public pages", async () => {
  const db = database();
  const first = await visitResponse(request(null, { method: "GET" }), db, now);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { date: "2026-10-03", today: 0 });
  const cookie = first.headers.get("Set-Cookie");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=31536000/);
  const id = cookie.match(/pysunn_visitor=([^;]+)/)[1];
  const counted = await visitResponse(request(id), db, now);
  assert.equal(counted.headers.get("Set-Cookie"), null);
  assert.equal((await counted.json()).today, 1);
  assert.equal((await (await visitResponse(request(id), db, now)).json()).today, 1);
  assert.equal(first.headers.get("Cache-Control"), "no-store");
});

test("reading the count and known crawler visits do not increment it", async () => {
  const db = database();
  assert.equal((await (await visitResponse(request(null, { method: "GET" }), db, now)).json()).today, 0);
  await visitResponse(request(firstBrowser), db, now);
  const bot = await visitResponse(request(null, { agent: "Googlebot/2.1" }), db, now);
  assert.equal((await bot.json()).today, 1);
  assert.equal(bot.headers.get("Set-Cookie"), null);
});

test("cross-origin writes and unsupported methods are rejected before touching the DB", async () => {
  assert.equal((await visitResponse(request(firstBrowser, { origin: "https://other.example" }), null, now)).status, 403);
  assert.equal((await visitResponse(request(firstBrowser, { method: "DELETE" }), null, now)).status, 405);
});

test("a failed identity handshake or disabled cookies cannot inflate the count", async () => {
  const db = database();
  await visitResponse(request(null, { method: "GET" }), db, now);
  assert.equal((await visitResponse(request(), db, now)).status, 400);
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS count FROM visitor_marks").get().count, 0);
});

test("DB failures produce an explicit unavailable response instead of a false zero", async () => {
  const messages = [];
  const broken = { prepare() { throw new Error("DB unavailable"); } };
  const response = await visitResponse(request(firstBrowser), broken, now, (event) => messages.push(event));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "visitor_counter_unavailable" });
  assert.equal(messages.length, 1);
  const missing = await visitResponse(request(firstBrowser), undefined, now, (event) => messages.push(event));
  assert.equal(missing.status, 503);
});
