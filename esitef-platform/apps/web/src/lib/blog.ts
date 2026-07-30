import blogData from "@/data/blog.json";

/**
 * ponytail: Fase 1 — posts en blog.json (sin DB ni CMS).
 * Contenido actual: importado del dump WP (post_type=post publish).
 * Workflow editorial:
 *   1. Redactar → HTML del cuerpo
 *   2. Añadir entrada en src/data/blog.json (slug único, published: true)
 *   3. Imagen en assets CDN → URL en image
 *   4. Si el slug existía en apex WP, añadir redirect en apex-redirects.json → blog/{slug}
 *   5. Commit + deploy → /blog y home (top 3 por publishedAt)
 * Despublicar: published: false.
 * Fase 2: ETL post_type=post → tabla blog_posts; loaders → Drizzle.
 */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  author: string;
  authorRole: string;
  image: string;
  publishedAt: string;
  published: boolean;
};

const posts = Object.values(blogData as Record<string, BlogPost>);

function sortByDateDesc(a: BlogPost, b: BlogPost) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function getBlogPosts(): BlogPost[] {
  return posts.filter((p) => p.published).sort(sortByDateDesc);
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const post = posts.find((p) => p.slug === slug && p.published);
  return post ?? null;
}

export function getLatestBlogPosts(n = 3): BlogPost[] {
  return getBlogPosts().slice(0, n);
}

export function getAllBlogSlugs(): string[] {
  return getBlogPosts().map((p) => p.slug);
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
