import { SignJWT, jwtVerify } from "jose";

const FLOW_COOKIE = "__Host-blog-oauth";
const SESSION_COOKIE = "__Host-blog-session";
const FLOW_SECONDS = 600;
const SESSION_SECONDS = 12 * 60 * 60;

function signingKey(config) {
  const secret = config.BLOG_SESSION_SECRET;
  if (typeof secret !== "string" || new TextEncoder().encode(secret).length < 32) {
    throw new Error("BLOG_SESSION_SECRET must contain at least 32 bytes");
  }
  return new TextEncoder().encode(secret);
}

function setting(config, name) {
  if (typeof config[name] !== "string" || !config[name]) throw new Error(`${name} is not configured`);
  return config[name];
}

function cookieValue(request, name) {
  const entry = request.headers.get("Cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry?.slice(name.length + 1);
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function randomString() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64url(bytes);
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function challenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export async function beginLogin(request, config) {
  const clientId = setting(config, "GITHUB_OAUTH_CLIENT_ID");
  setting(config, "GITHUB_OAUTH_CLIENT_SECRET");
  setting(config, "BLOG_OWNER_GITHUB_ID");
  const key = signingKey(config);
  const origin = new URL(request.url).origin;
  const state = randomString();
  const verifier = randomString();
  const flow = await new SignJWT({ state, verifier })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(origin)
    .setAudience("blog-oauth")
    .setIssuedAt()
    .setExpirationTime(`${FLOW_SECONDS}s`)
    .sign(key);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/auth/github/callback`);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", await challenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  // An empty scope is sufficient to read the authenticated user's numeric ID.
  return { url: url.toString(), cookie: cookie(FLOW_COOKIE, flow, FLOW_SECONDS) };
}

export async function finishLogin(request, config, fetcher = fetch) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const flow = cookieValue(request, FLOW_COOKIE);
  if (!code || !state || !flow) throw new Error("OAuth state is missing");

  const key = signingKey(config);
  let payload;
  try {
    ({ payload } = await jwtVerify(flow, key, {
      issuer: url.origin,
      audience: "blog-oauth",
      algorithms: ["HS256"],
    }));
  } catch {
    throw new Error("OAuth state is invalid or expired");
  }
  if (payload.state !== state || typeof payload.verifier !== "string") throw new Error("OAuth state does not match");

  const response = await fetcher("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: setting(config, "GITHUB_OAUTH_CLIENT_ID"),
      client_secret: setting(config, "GITHUB_OAUTH_CLIENT_SECRET"),
      code,
      redirect_uri: `${url.origin}/auth/github/callback`,
      code_verifier: payload.verifier,
    }).toString(),
  });
  if (!response.ok) throw new Error(`GitHub OAuth returned ${response.status}`);
  const token = await response.json();
  if (typeof token.access_token !== "string" || !token.access_token) throw new Error("GitHub OAuth did not return a token");

  const userResponse = await fetcher("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.access_token}`,
      "User-Agent": "pysunn-blog-writer",
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });
  if (!userResponse.ok) throw new Error(`GitHub user lookup returned ${userResponse.status}`);
  const user = await userResponse.json();
  if (String(user.id) !== setting(config, "BLOG_OWNER_GITHUB_ID")) throw new Error("GitHub user is not the blog owner");

  const session = await new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(url.origin)
    .setAudience("blog-session")
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(key);
  return cookie(SESSION_COOKIE, session, SESSION_SECONDS);
}

export async function verifyOwner(request, config) {
  const session = cookieValue(request, SESSION_COOKIE);
  if (!session || !config.BLOG_OWNER_GITHUB_ID || !config.BLOG_SESSION_SECRET) return false;
  try {
    const { payload } = await jwtVerify(session, signingKey(config), {
      issuer: new URL(request.url).origin,
      audience: "blog-session",
      algorithms: ["HS256"],
    });
    return payload.role === "owner" && payload.sub === config.BLOG_OWNER_GITHUB_ID;
  } catch {
    return false;
  }
}

export const clearFlowCookie = () => cookie(FLOW_COOKIE, "", 0);
