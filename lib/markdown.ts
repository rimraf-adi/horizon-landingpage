import matter from 'gray-matter';

export interface BlogFrontmatter {
  title: string;
  date: string;
  description?: string;
  author?: string;
  [key: string]: any;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

/**
 * Parse markdown content with YAML frontmatter
 */
export function parseMarkdown(fileContent: string): { frontmatter: BlogFrontmatter; content: string } {
  const { data, content } = matter(fileContent);
  return {
    frontmatter: data as BlogFrontmatter,
    content,
  };
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get excerpt from markdown content (first 160 characters)
 */
export function getExcerpt(content: string, length: number = 160): string {
  return content
    .replace(/^#+\s+/gm, '') // Remove markdown headings
    .replace(/[*_]/g, '') // Remove italic/bold markers
    .trim()
    .substring(0, length)
    .concat('...');
}
