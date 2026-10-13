import { link, mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { createPostSource } from "../src/lib/blog-authoring.mjs";

const MAX_REQUEST_BYTES = 1_000_000;

export async function savePost(directory, input) {
  // Local files and GitHub commits share the same validation and frontmatter.
  const { slug, source } = createPostSource(input);
  await mkdir(directory, { recursive: true });

  const target = join(directory, `${slug}.md`);
  const temporary = join(directory, `.${slug}.${randomUUID()}.tmp`);
  await writeFile(temporary, source, { flag: "wx" });
  try {
    // Linking the complete temporary file makes creation atomic and refuses duplicate slugs.
    await link(temporary, target);
  } finally {
    await unlink(temporary);
  }

  return { slug, fileName: `${slug}.md` };
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

function isLoopbackRequest(request) {
  const address = request.socket.remoteAddress;
  const host = request.headers.host;
  const origin = request.headers.origin;
  if (!host || !origin || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address)) {
    return false;
  }
  const hostname = new URL(`http://${host}`).hostname;
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname) && origin === `http://${host}`;
}

export function localBlogWriter(directory) {
  return {
    name: "local-blog-writer",
    apply: /** @type {const} */ ("serve"),
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (new URL(request.url ?? "/", "http://localhost").pathname !== "/__local/blog/write") {
          return next();
        }
        if (request.method !== "POST") {
          return sendJson(response, 405, { error: "POST only" });
        }
        if (!isLoopbackRequest(request)) {
          return sendJson(response, 403, { error: "Local browser only" });
        }
        if (!request.headers["content-type"]?.startsWith("application/json")) {
          return sendJson(response, 415, { error: "JSON only" });
        }

        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
              return sendJson(response, 413, { error: "Post is too large" });
            }
            chunks.push(chunk);
          }
          const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const result = await savePost(directory, input);
          return sendJson(response, 201, result);
        } catch (error) {
          if (error?.code === "EEXIST") {
            return sendJson(response, 409, { error: "이 주소의 글이 이미 있습니다." });
          }
          if (error instanceof TypeError || error instanceof SyntaxError) {
            return sendJson(response, 400, { error: error.message });
          }
          server.config.logger.error(`Blog save failed: ${error instanceof Error ? error.stack : String(error)}`);
          return sendJson(response, 500, { error: "파일을 저장하지 못했습니다. 개발 서버 로그를 확인하세요." });
        }
      });
    },
  };
}
