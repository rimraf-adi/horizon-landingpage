import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface BlogFrontmatter {
    title: string;
    date: string;
    description?: string;
    author?: string;
    [key: string]: any;
}

interface BlogPost {
    slug: string;
    frontmatter: BlogFrontmatter;
    content: string;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const indexPath = path.join(process.cwd(), 'public', slug, 'index.md');

        if (!fs.existsSync(indexPath)) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(indexPath, 'utf-8');
        const { data, content } = matter(fileContent);

        const post: BlogPost = {
            slug,
            frontmatter: data as BlogFrontmatter,
            content,
        };

        return NextResponse.json(post);
    } catch (error) {
        console.error('Failed to fetch blog post:', error);
        return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }
}
