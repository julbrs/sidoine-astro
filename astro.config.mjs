// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAlert],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
