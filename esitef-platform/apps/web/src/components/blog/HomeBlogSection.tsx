import Link from "next/link";
import { getLatestBlogPosts } from "@/lib/blog";
import { BlogCard } from "./BlogCard";

export function HomeBlogSection() {
  const posts = getLatestBlogPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="blog-section" aria-label="Últimas entradas del blog">
      <div className="blog-inner">
        <h2 className="blog-titulo">Blog</h2>
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="blog-ver-todos">
          <Link href="/blog" className="blog-ver-todos-btn">
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </section>
  );
}
