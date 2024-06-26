/// Mount assets intergration
import type { AstroIntegration } from 'astro';
import fs from 'fs';

// Export intergration
export default () =>
  ({
    name: 'mount-assets',
    hooks: {
      'astro:build:done': ({ logger }): void => {
        // Skip local build
        if (process.env.GITHUB_ACTIONS !== 'true') {
          logger.info('Skip mounting on local build');
          return;
        }

        // Create assets folders
        fs.mkdirSync('dist/assets/posts', { recursive: true });
        fs.mkdirSync('dist/assets/puzzles', { recursive: true });
        logger.info('Assets folders created');

        // Mount global assets
        fs.renameSync('posts-repo/assets', 'dist/assets/_');
        fs.rmSync('dist/assets/_/README.md');
        logger.info('Global assets mounted');

        // Get meta data
        const meta: Record<string, Record<string, string>> = JSON.parse(
          fs.readFileSync('meta.json', 'utf-8')
        );
        logger.info('Meta data got');

        // Find posts assets
        fs.readdirSync('src/content/posts', { withFileTypes: true }).forEach(
          (dir: fs.Dirent): void => {
            // If not directory
            if (!dir.isDirectory()) {
              return;
            }

            // Check assets
            const assetsPath: string = `src/content/posts/${dir.name}/assets`;
            try {
              if (!fs.statSync(assetsPath).isDirectory()) {
                return;
              }
            } catch {
              return;
            }

            // Mount assets
            const slug: string = meta.post[dir.name.slice(1) + '.md'];
            fs.renameSync(assetsPath, `dist/assets/posts/${slug}`);
            logger.info(`Mount: ${assetsPath} -> dist/assets/posts/${slug}`);
          }
        );

        // Find puzzles assets
        fs.readdirSync('src/content/puzzles', { withFileTypes: true }).forEach(
          (dir: fs.Dirent): void => {
            // If not directory
            if (!dir.isDirectory()) {
              return;
            }

            // Check assets
            const assetsPath: string = `src/content/puzzles/${dir.name}/assets`;
            try {
              if (!fs.statSync(assetsPath).isDirectory()) {
                return;
              }
            } catch {
              return;
            }

            // Mount assets
            const slug: string = meta.puzzle[dir.name.slice(1) + '.md'];
            fs.renameSync(assetsPath, `dist/assets/puzzles/${slug}`);
            logger.info(`Mount: ${assetsPath} -> dist/assets/puzzles/${slug}`);
          }
        );
      }
    }
  } satisfies AstroIntegration);
