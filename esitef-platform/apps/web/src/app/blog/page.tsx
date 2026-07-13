import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import "@/styles/blog.css";

export const metadata: Metadata = {
  title: "Blog — ESITEF",
  description:
    "Artículos y actualización científica para tu práctica diaria en fisioterapia y ejercicio terapéutico.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <section className="blog-archive-section" aria-label="Blog">
      <div className="blog-archive-inner">
        <h1 className="blog-archive-titulo">Blog</h1>
        {posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            No hay artículos en el blog.
          </p>
        )}
      </div>
    </section>
  );
}
