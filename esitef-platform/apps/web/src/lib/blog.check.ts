/**
 * Self-check: WP blog import landed in blog.json.
 * Run: npx tsx src/lib/blog.check.ts
 */
import {
  getBlogPostBySlug,
  getBlogPosts,
  getLatestBlogPosts,
} from "./blog";

const posts = getBlogPosts();
if (posts.length < 15) {
  throw new Error(`expected ≥15 published posts, got ${posts.length}`);
}

const sample = getBlogPostBySlug("en-que-etapa-de-la-fisioterapia-estas");
if (!sample?.contentHtml.includes("fisioterapeutas")) {
  throw new Error("missing WP body for en-que-etapa-de-la-fisioterapia-estas");
}

const latest = getLatestBlogPosts(3);
if (latest.length !== 3) throw new Error("getLatestBlogPosts(3) broken");
if (new Date(latest[0].publishedAt) < new Date(latest[2].publishedAt)) {
  throw new Error("latest posts not sorted desc");
}

// Placeholders from Fase 1 must be gone
for (const slug of [
  "ejercicio-terapeutico-rodilla",
  "fuerza-en-fisioterapia",
  "educacion-del-paciente",
]) {
  if (getBlogPostBySlug(slug)) {
    throw new Error(`placeholder still published: ${slug}`);
  }
}

console.log(`blog.check OK (${posts.length} posts)`);
