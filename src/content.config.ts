import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from "./lib/blog-categories.mjs";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
    summary: z.string(),
    category: z.enum(BLOG_CATEGORIES).default(DEFAULT_BLOG_CATEGORY),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
