# Blog authoring deployment

The public site runs as an Astro Cloudflare Worker. Blog posts remain Markdown files in `src/content/blog`; a successful write commits a new file to the `main` branch. A Workers Git integration rebuilds the site from that commit. The local `/write` page still saves files directly during development.

## Required Cloudflare configuration

1. The `main` branch deploys through `.github/workflows/deploy-worker.yml`. Add repository secrets `CLOUDFLARE_API_TOKEN` (limited to this account with Workers Scripts: Edit and Account: Read) and `CLOUDFLARE_ACCOUNT_ID`. The workflow builds with `pnpm build` and deploys with Wrangler. Verify the Worker on its `workers.dev` address before attaching `pysunn.me`.
2. Add GitHub as a Cloudflare Access identity provider using a GitHub OAuth app. The OAuth app homepage is the Access team domain; its callback is `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`.
3. Create a self-hosted Access application for both `/write` and `/api/blog/write` on `pysunn.me`. Use an Allow policy with the exact owner email and enable only the GitHub login method. Do not use an Everyone or email-domain rule.
4. Set these Worker secrets: `ACCESS_TEAM_DOMAIN` (the full `https://<team>.cloudflareaccess.com` URL), `ACCESS_AUD` (the Access application's audience tag), `BLOG_OWNER_EMAIL` (the same exact email used by the Allow policy), and `BLOG_GITHUB_TOKEN` (a fine-grained GitHub token limited to this repository with Contents: Read and write). The Access login itself does not grant GitHub repository write permission.
5. Open `/write` through Access, save a draft post, and confirm that the GitHub commit causes a successful Worker rebuild before moving the custom domain. Then attach `pysunn.me` to the Worker and verify public pages, the protected editor, and a new blog post.

The Worker independently validates the Access JWT signature, issuer, audience, application-token type, and owner email for both `/write` and the write API. Without the configured secrets, it denies access. The API also requires a same-origin JSON request and refuses to overwrite an existing slug.

GitHub Discussions and the giscus GitHub app are required for comments. The blog uses the repository's Announcements category and maps one discussion to each post pathname. A discussion is created when its first comment is submitted.
