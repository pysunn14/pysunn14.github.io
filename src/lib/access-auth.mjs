import { createRemoteJWKSet, jwtVerify } from "jose";

const keySets = new Map();

export async function verifyOwner(request, config, keyResolver) {
  const { ACCESS_TEAM_DOMAIN: teamDomain, ACCESS_AUD: audience, BLOG_OWNER_EMAIL: ownerEmail } = config;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!teamDomain || !audience || !ownerEmail || !token) return false;

  let origin;
  try {
    const url = new URL(teamDomain);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".cloudflareaccess.com") || url.pathname !== "/") return false;
    origin = url.origin;
  } catch {
    return false;
  }

  try {
    let resolver = keyResolver;
    if (!resolver) {
      resolver = keySets.get(origin);
      if (!resolver) {
        resolver = createRemoteJWKSet(new URL(`${origin}/cdn-cgi/access/certs`));
        keySets.set(origin, resolver);
      }
    }
    const { payload } = await jwtVerify(token, resolver, {
      issuer: origin,
      audience,
      algorithms: ["RS256"],
    });
    return payload.type === "app" && typeof payload.sub === "string" && Boolean(payload.sub)
      && typeof payload.email === "string" && payload.email.toLowerCase() === ownerEmail.toLowerCase();
  } catch {
    return false;
  }
}
