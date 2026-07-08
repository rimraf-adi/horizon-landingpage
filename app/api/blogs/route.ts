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

export async function GET() {
    try {
        const blogsDir = path.join(process.cwd(), 'public');
        const posts: BlogPost[] = [];

        const items = fs.readdirSync(blogsDir, { withFileTypes: true });
        const blogDirs = items.filter((item) => item.isDirectory());

        for (const dir of blogDirs) {
            const indexPath = path.join(blogsDir, dir.name, 'index.md');
            if (fs.existsSync(indexPath)) {
                try {
                    const fileContent = fs.readFileSync(indexPath, 'utf-8');
                    const { data, content } = matter(fileContent);

                    // Skip if missing required frontmatter
                    if (!data.title || !data.date) {
                        console.warn(`Skipping ${dir.name}: missing title or date in frontmatter`);
                        continue;
                    }

                    posts.push({
                        slug: dir.name,
                        frontmatter: data as BlogFrontmatter,
                        content,
                    });
                } catch (error) {
                    console.error(`Failed to load blog post: ${dir.name}`, error);
                }
            }
        }

        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }
}
