import assert from "node:assert/strict";
import { test } from "node:test";
import { beginLogin, finishLogin, verifyOwner } from "./github-auth.mjs";

const config = {
  GITHUB_OAUTH_CLIENT_ID: "client-id",
  GITHUB_OAUTH_CLIENT_SECRET: "client-secret",
  BLOG_SESSION_SECRET: "test-secret-with-at-least-thirty-two-bytes",
  BLOG_OWNER_GITHUB_ID: "161586699",
};

test("GitHub login is tied to the initiating browser and callback URL", async () => {
  const request = new Request("https://pysunn.me/auth/github");
  const { url, cookie } = await beginLogin(request, config);
  const authorize = new URL(url);
  assert.equal(authorize.origin, "https://github.com");
  assert.equal(authorize.searchParams.get("scope"), null);
  assert.equal(authorize.searchParams.get("redirect_uri"), "https://pysunn.me/auth/github/callback");
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);

  const state = authorize.searchParams.get("state");
  const callback = new Request(`https://pysunn.me/auth/github/callback?code=code&state=${state}`, {
    headers: { Cookie: cookie.split(";")[0] },
  });
  const calls = [];
  const fetcher = async (input, options) => {
    calls.push({ input, options });
    return input.startsWith("https://github.com/")
      ? Response.json({ access_token: "github-token", token_type: "bearer" })
      : Response.json({ id: 161586699, login: "pysunn14" });
  };
  const session = await finishLogin(callback, config, fetcher);
  assert.equal(calls.length, 2);
  assert.match(calls[0].options.body, /code_verifier=/);
  assert.match(session, /HttpOnly; Secure; SameSite=Lax/);
  const ownerRequest = new Request("https://pysunn.me/api/blog/write", { headers: { Cookie: session.split(";")[0] } });
  assert.equal(await verifyOwner(ownerRequest, config), true);
  assert.equal(await verifyOwner(ownerRequest, { ...config, BLOG_OWNER_GITHUB_ID: "123" }), false);
  assert.equal(await verifyOwner(new Request("https://elsewhere.example/write", { headers: { Cookie: session.split(";")[0] } }), config), false);
  const tampered = session.split(";")[0].replace(/.$/, "x");
  assert.equal(await verifyOwner(new Request("https://pysunn.me/write", { headers: { Cookie: tampered } }), config), false);
  assert.equal(await verifyOwner(new Request("https://pysunn.me/write"), config), false);
});

test("rejects mismatched state and a different GitHub account", async () => {
  const { cookie } = await beginLogin(new Request("https://pysunn.me/auth/github"), config);
  const headers = { Cookie: cookie.split(";")[0] };
  await assert.rejects(
    finishLogin(new Request("https://pysunn.me/auth/github/callback?code=code&state=wrong", { headers }), config),
    /state/,
  );
  const { url, cookie: secondCookie } = await beginLogin(new Request("https://pysunn.me/auth/github"), config);
  const state = new URL(url).searchParams.get("state");
  const fetcher = async (input) => input.startsWith("https://github.com/")
    ? Response.json({ access_token: "other-token", token_type: "bearer" })
    : Response.json({ id: 42, login: "other" });
  await assert.rejects(
    finishLogin(new Request(`https://pysunn.me/auth/github/callback?code=code&state=${state}`, { headers: { Cookie: secondCookie.split(";")[0] } }), config, fetcher),
    /owner/,
  );
});
