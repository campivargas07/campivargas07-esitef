import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatBlogDate,
  getAllBlogSlugs,
  getBlogPostBySlug,
} from "@/lib/blog";
import "@/styles/blog.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: `${post.title} — Blog ESITEF`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="blog-article-section">
      <div className="blog-article-inner">
        <nav className="blog-breadcrumb" aria-label="Ruta">
          <Link href="/blog">Blog</Link>
          <span className="blog-breadcrumb__sep" aria-hidden="true">
            /
          </span>
          <span className="blog-breadcrumb__current">{post.title}</span>
        </nav>

        <header className="blog-article-header">
          <h1 className="blog-article-title">{post.title}</h1>
          <div className="blog-article-meta">
            <span className="author-name">{post.author}</span>
            <span>{post.authorRole}</span>
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
          </div>
        </header>

        {post.image && (
          <div className="blog-article-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div
          className="blog-article-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <Link href="/blog" className="blog-article-back">
          ← Volver al blog
        </Link>
      </div>
    </article>
  );
}
