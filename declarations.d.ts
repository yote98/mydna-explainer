// Raw markdown imports (`import md from './file.md?raw'`).
// Native in Vite (vinext/Cloudflare Workers); in Next.js/webpack handled by
// the asset/source rule in next.config.ts.
declare module '*.md?raw' {
  const content: string;
  export default content;
}
