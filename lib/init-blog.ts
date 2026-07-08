/**
 * Initialize the blog system with your GitHub repository details
 * Call this once when your app starts (e.g., in your root layout)
 *
 * Example:
 *
 * import { initBlog } from '@/lib/init-blog';
 *
 * initBlog({
 *   owner: 'your-github-username',
 *   repo: 'your-repo-name',
 *   branch: 'main',
 *   blogsPath: 'public'
 * });
 *
 * IMPORTANT: Your repository structure should be:
 * public/
 *   blog-post-1/
 *     index.md
 *     image.jpg
 *   blog-post-2/
 *     index.md
 *     image.jpg
 *
 * Each index.md should have YAML frontmatter:
 *
 * ---
 * title: "My Blog Post Title"
 * date: "2024-01-15"
 * description: "Brief description of the post"
 * author: "Your Name"
 * ---
 *
 * # Your markdown content starts here
 */

import { setGitHubConfig } from './github-blog-loader';

export interface BlogInitConfig {
  owner: string; // GitHub username or organization
  repo: string; // Repository name
  branch?: string; // Branch name (default: 'main')
  blogsPath?: string; // Path to blogs folder in repo (default: 'public')
  useLocalFS?: boolean; // Use local filesystem instead of GitHub (default: false)
}

export function initBlog(config: BlogInitConfig) {
  // Allow local filesystem mode even without owner/repo
  if (!config.useLocalFS && (!config.owner || !config.repo)) {
    console.warn(
      'Blog initialization failed: owner and repo are required when not using local filesystem. Check your config.'
    );
    return;
  }

  setGitHubConfig({
    owner: config.owner,
    repo: config.repo,
    branch: config.branch || 'main',
    blogsPath: config.blogsPath || 'public',
    useLocalFS: config.useLocalFS || false,
  });

  if (config.useLocalFS) {
    console.log(`Blog initialized: using local filesystem (path: ${config.blogsPath || 'public'})`);
  } else {
    console.log(
      `Blog initialized: ${config.owner}/${config.repo} (branch: ${config.branch || 'main'})`
    );
  }
}
