# Blog authoring deployment

The public site runs as an Astro Cloudflare Worker. Blog posts are Markdown files in `src/content/blog`. Publishing creates a new file on `main`; `.github/workflows/deploy-worker.yml` then builds and deploys that commit. The local `/write` page saves files directly during development.

## Deployment

1. In the Cloudflare account, create an API token with **Individual Workers: Editor** scoped only to `pysunn-portfolio`. Store it as the repository secret `CLOUDFLARE_API_TOKEN`. Add the account ID as `CLOUDFLARE_ACCOUNT_ID`. The token expires after one year and must be renewed before then.
2. Register a GitHub OAuth app with homepage `https://pysunn.me/` and callback `https://pysunn.me/auth/github/callback`. The app needs no OAuth scopes: GitHub still returns the authenticated account's numeric ID. GitHub OAuth is used only for owner identity; it cannot write blog posts.
3. Set Worker secrets `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `BLOG_OWNER_GITHUB_ID`, and `BLOG_SESSION_SECRET`. The owner ID is the numeric GitHub account ID. Generate a random session secret of at least 32 bytes and do not commit any of these values.
4. Create a fine-grained GitHub personal access token limited to this repository with **Contents: Read and write**. Store it as the Worker secret `BLOG_GITHUB_TOKEN`. This token is used only by the write API to add posts to `main`.
5. Deploy and verify public pages on the `workers.dev` URL. GitHub OAuth login cannot be fully tested there because the OAuth app callback is registered for `pysunn.me`. Move the custom domain after the Worker and secrets are ready, then visit `/write`, sign in, save a post, and confirm the resulting GitHub Actions deployment and public article.

The login flow uses a short-lived signed state cookie and PKCE. The owner session is a signed, HTTP-only, secure cookie valid for 12 hours. The write API validates that cookie again, requires a same-origin JSON request, and refuses to overwrite an existing slug. Without the configured secrets, login and writing fail closed. The public blog has no writing control; the owner can open `/write` directly.

GitHub Discussions and the giscus GitHub app are required for comments. The blog uses the repository's Announcements category and maps one discussion to each post pathname. A discussion is created when its first comment is submitted.
