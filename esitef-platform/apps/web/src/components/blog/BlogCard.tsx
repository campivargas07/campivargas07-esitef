import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

type Props = {
  post: BlogPost;
};

export function BlogCard({ post }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card">
      <div className="blog-card-quote" aria-hidden="true">
        "
      </div>
      <div className="blog-card-content">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
      <div className="blog-card-footer">
        <div className="blog-card-author">
          <span className="author-name">{post.author}</span>
          <span className="author-role">{post.authorRole}</span>
        </div>
        <div className="blog-card-image">
          <img src={post.image} alt={post.title} loading="lazy" />
        </div>
      </div>
    </Link>
  );
}
