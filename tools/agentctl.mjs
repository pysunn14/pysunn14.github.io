// Development-only access to the same blog core used by the UI and writer.
// This CLI is not imported into browser or Worker bundles.
import { parseArgs } from "node:util";
import { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from "../src/lib/blog-categories.mjs";
import { getBlogPage } from "../src/lib/blog-list.ts";
import { createPostSource } from "../src/lib/blog-authoring.mjs";
import { restoreDraft } from "../src/lib/blog-draft.mjs";

const { positionals: [command], values } = parseArgs({
  allowPositionals: true,
  options: { search: { type: "string", default: "" }, today: { type: "string" } },
});

try {
  if (!["categories", "list", "source", "draft"].includes(command) || (command === "draft" && !values.today)) {
    throw new Error("Use categories, list --search, source, or draft --today; provide JSON on stdin.");
  }
  let result;
  if (command === "categories") {
    result = { categories: BLOG_CATEGORIES, default: DEFAULT_BLOG_CATEGORY };
  } else {
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    const data = JSON.parse(input);
    if (command === "list") result = getBlogPage(data, values.search);
    else if (command === "source") result = createPostSource(data);
    else if (command === "draft" && values.today) result = restoreDraft(data, values.today);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
  process.exitCode = 1;
}
