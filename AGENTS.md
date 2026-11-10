# AI Alt Text Generator

WordPress plugin that generates image alt text through the WordPress AI Client, with Polylang support.

- Target WordPress 7.0+ and PHP 8.1+. Use pnpm and Composer.
- Optional agent skills are listed in `skills-lock.json` and can be restored with `pnx skills experimental_install`.
- The entry point is `alt-text-generator-gpt-vision.php`. PHP classes are in `includes/`, React and TypeScript in `src/`, and prompts in `data/`.
- Use the `alt-text-generator-gpt-vision` text domain for user-facing strings.
- Keep changes focused. Do not reformat unrelated code or automatically format Markdown.
- Format changed files with `pnpm exec oxfmt <files>` or `composer format -- <files>`.
- Build frontend changes with `pnpm build`. `build/` is gitignored but included in WordPress.org releases.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` for frontend changes; `composer lint`, `composer analyse`, and `composer format:check` for PHP changes.
- No automated test suite is configured. Use `.wp-env.json` for local WordPress and configure an image-capable model under Settings > Connectors. Check affected editor and media-library flows, including Polylang when relevant.
- Start commit titles with a [gitmoji](https://gitmoji.dev/) and a short imperative summary. List emojis with `gitmoji -l` or `pnx gitmoji-cli -l`.
- Follow `SECURITY.md` for vulnerability reports. Never commit credentials.
- External publication requires explicit authorization. Publishing a release deploys to WordPress.org.
