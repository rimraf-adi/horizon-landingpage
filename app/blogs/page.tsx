'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, TrendingUp, Loader, ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/animations';

interface BlogFrontmatter {
    title: string;
    date: string;
    author?: string;
    tags?: string[];
    description?: string;
    thumbnail?: string;
}

interface BlogPost {
    slug: string;
    frontmatter: BlogFrontmatter;
    content: string;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getExcerpt(content: string, maxLength: number = 150): string {
    const plainText = content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\n/g, ' ')
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

export default function BlogsPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch('/api/blogs');
                const data = await response.json();
                // API returns array directly, not {posts: [...]}
                setPosts(Array.isArray(data) ? data : data.posts || []);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    return (
        <main className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#059669] transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <FadeIn>
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] mb-6">
                                <TrendingUp className="w-4 h-4 text-[#059669]" />
                                <span className="text-sm text-[#059669]">Our Blog</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="text-[#111827]">Latest</span>{' '}
                                <span className="text-gold-gradient">Articles</span>
                            </h1>
                            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
                                Explore our collection of financial insights, market analysis, and investment strategies.
                            </p>
                        </div>
                    </FadeIn>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-4">
                            <Loader className="animate-spin text-[#059669]" size={40} />
                            <p className="text-[#6B7280]">Loading articles...</p>
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <FadeIn>
                        <div className="text-center py-16">
                            <div className="glass-card p-12 rounded-2xl max-w-lg mx-auto">
                                <TrendingUp className="w-16 h-16 text-[#059669] mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-[#111827] mb-2">No Articles Yet</h2>
                                <p className="text-[#6B7280]">Fresh financial insights are coming soon. Stay tuned!</p>
                            </div>
                        </div>
                    </FadeIn>
                ) : (
                    /* Bento Grid - Uniform Heights */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => {
                            // Bento grid pattern: first card spans 2 columns
                            const isLarge = index === 0;
                            const cardClasses = isLarge
                                ? 'md:col-span-2 lg:col-span-2'
                                : '';

                            return (
                                <motion.div
                                    key={post.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                        ease: [0.25, 0.46, 0.45, 0.94]
                                    }}
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        <article
                                            className={`glass-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full hover:scale-[1.02] transition-transform ${cardClasses}`}
                                            style={{ minHeight: isLarge ? '420px' : '380px' }}
                                        >
                                            {/* Thumbnail with fixed aspect ratio */}
                                            {post.frontmatter.thumbnail ? (
                                                <div className="relative overflow-hidden h-48">
                                                    <img
                                                        src={post.frontmatter.thumbnail}
                                                        alt={post.frontmatter.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.5)] to-transparent" />
                                                </div>
                                            ) : (
                                                <div className="h-3 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399]" />
                                            )}

                                            {/* Content area - flex grow to fill remaining space */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                {/* Tags */}
                                                {post.frontmatter.tags && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {(post.frontmatter.tags as string[]).slice(0, 3).map((tag: string) => (
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
                                                <h2 className={`font-bold text-[#111827] group-hover:text-[#059669] transition-colors mb-2 line-clamp-2 ${isLarge ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                                                    {post.frontmatter.title}
                                                </h2>

                                                {/* Description - show on all cards for uniformity */}
                                                <p className="text-[#4B5563] text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                                                    {post.frontmatter.description || getExcerpt(post.content, 120)}
                                                </p>

                                                {/* Meta Info - pushed to bottom */}
                                                <div className="flex items-center justify-between pt-3 border-t border-[rgba(5,150,105,0.1)] mt-auto">
                                                    <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDate(post.frontmatter.date)}
                                                        </span>
                                                        {post.frontmatter.author && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3.5 h-3.5" />
                                                                {post.frontmatter.author}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-[#059669] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

