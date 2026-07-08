'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, type BlogPost } from '@/lib/markdown';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ArrowLeft, Loader, Calendar, User, Clock, TrendingUp } from 'lucide-react';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blogs/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
          } else {
            throw new Error('Failed to fetch blog post');
          }
          return;
        }
        const blogPost = await response.json();
        setPost(blogPost);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-[#059669]" size={40} />
          <p className="text-[#6B7280]">Loading article...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#059669] transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          <div className="glass-card rounded-2xl p-12 text-center">
            <TrendingUp className="w-16 h-16 text-[#059669] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#111827] mb-2">404</h1>
            <p className="text-[#6B7280]">{error || 'Blog post not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#059669] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Article */}
        <article className="glass-card rounded-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399]" />

          <div className="p-8 md:p-12">
            {/* Tags */}
            {post.frontmatter.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(post.frontmatter.tags as string[]).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-[rgba(5,150,105,0.08)] text-[#059669] border border-[rgba(5,150,105,0.15)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111827] mb-6 leading-tight">
              {post.frontmatter.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-[#6B7280] pb-8 border-b border-[rgba(5,150,105,0.15)]">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#059669]" />
                {formatDate(post.frontmatter.date)}
              </span>
              {post.frontmatter.author && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#059669]" />
                  {post.frontmatter.author}
                </span>
              )}
              {post.frontmatter.readTime && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#059669]" />
                  {post.frontmatter.readTime}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mt-8
              prose-headings:text-[#111827] prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-[#059669]
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[#374151] prose-p:leading-relaxed
              prose-a:text-[#059669] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#111827]
              prose-code:text-[#059669] prose-code:bg-[rgba(5,150,105,0.08)] prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-[#F9FAFB] prose-pre:border prose-pre:border-[rgba(5,150,105,0.15)]
              prose-blockquote:border-l-[#059669] prose-blockquote:bg-[rgba(5,150,105,0.04)] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-ul:text-[#374151] prose-ol:text-[#374151]
              prose-li:marker:text-[#059669]
            ">
              <MarkdownRenderer content={post.content} slug={slug} />
            </div>
          </div>
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[rgba(5,150,105,0.15)] flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[rgba(5,150,105,0.08)] text-[#111827] hover:bg-[rgba(5,150,105,0.15)] hover:text-[#059669] transition-all border border-[rgba(5,150,105,0.15)]"
          >
            <ArrowLeft size={16} />
            Back to All Posts
          </Link>

          <div className="flex items-center gap-2 text-[#6B7280]">
            <TrendingUp className="w-4 h-4 text-[#059669]" />
            <span className="text-sm">Paisanomics</span>
          </div>
        </div>
      </div>
    </main>
  );
}
