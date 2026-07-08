import React from 'react';

interface MarkdownRendererProps {
  content: string;
  slug?: string; // Blog slug for resolving relative image paths
}

/**
 * Simple markdown to HTML renderer
 * Handles: headings, paragraphs, links, bold, italic, code blocks, lists, blockquotes, images
 */
export function MarkdownRenderer({ content, slug }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  // Helper function to resolve image paths
  const resolveImagePath = (src: string): string => {
    // If already absolute or external URL, return as-is
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return src;
    }
    // For relative paths like ./image.png or image.png, resolve using slug
    if (slug) {
      const cleanSrc = src.replace(/^\.\//, ''); // Remove leading ./
      return `/${slug}/${cleanSrc}`;
    }
    return src;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // Image: ![alt](src)
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const alt = imageMatch[1];
      const src = resolveImagePath(imageMatch[2]);
      elements.push(
        <figure key={i} className="my-6">
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-w-full h-auto mx-auto border border-[rgba(212,175,55,0.2)]"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center text-sm text-[#94A3B8] mt-2">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground">
          {trimmed.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground">
          {trimmed.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-foreground">
          {trimmed.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;

      elements.push(
        <pre
          key={i}
          className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-border"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {trimmed.slice(2)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }

      elements.push(
        <ul key={i} className="list-disc list-inside my-4 space-y-1 ml-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      let counter = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }

      elements.push(
        <ol key={i} className="list-decimal list-inside my-4 space-y-1 ml-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-foreground leading-relaxed my-4">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="prose prose-sm max-w-none">{elements}</div>;
}

/**
 * Render inline markdown formatting
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Match bold, italic, code, and links
  const regex = /\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|_(.+?)_|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1] || match[2]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-bold">
          {match[1] || match[2]}
        </strong>
      );
    } else if (match[3] || match[4]) {
      // Italic
      parts.push(
        <em key={match.index} className="italic">
          {match[3] || match[4]}
        </em>
      );
    } else if (match[5]) {
      // Code
      parts.push(
        <code key={match.index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {match[5]}
        </code>
      );
    } else if (match[6] && match[7]) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[6]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
