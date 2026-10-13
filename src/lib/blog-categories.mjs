export const BLOG_CATEGORIES = /** @type {const} */ (["Algorithm", "Daily"]);
export const DEFAULT_BLOG_CATEGORY = "Daily";

export function postCategory(value = DEFAULT_BLOG_CATEGORY) {
  const category = BLOG_CATEGORIES.find((category) => category === value);
  if (!category) throw new TypeError("category must be Algorithm or Daily");
  return category;
}
