import assert from "node:assert/strict";
import { generateKeyPair, SignJWT } from "jose";
import { test } from "node:test";
import { verifyOwner } from "./access-auth.mjs";

const config = {
  ACCESS_TEAM_DOMAIN: "https://sample.cloudflareaccess.com",
  ACCESS_AUD: "app-audience",
  BLOG_OWNER_EMAIL: "owner@example.com",
};

test("requires a signed Access application token for the owner", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const token = await new SignJWT({ email: "owner@example.com", type: "app" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(config.ACCESS_TEAM_DOMAIN)
    .setAudience(config.ACCESS_AUD)
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  const request = new Request("https://pysunn.me/write", { headers: { "Cf-Access-Jwt-Assertion": token } });
  assert.equal(await verifyOwner(request, config, async () => publicKey), true);
  assert.equal(await verifyOwner(new Request("https://pysunn.me/write"), config, async () => publicKey), false);
  assert.equal(await verifyOwner(request, { ...config, BLOG_OWNER_EMAIL: "other@example.com" }, async () => publicKey), false);
  assert.equal(await verifyOwner(request, { ...config, ACCESS_AUD: "other" }, async () => publicKey), false);
  assert.equal(await verifyOwner(request, {}, async () => publicKey), false);
});
