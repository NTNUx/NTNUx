// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    baseURL: "/",
    head: {
      title: "NTNUx｜課程查詢系統",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-96x96.png",
          sizes: "96x96",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      meta: [
        {
          name: "description",
          content: "更適合師大人的課程查詢系統，更快、更強、行動裝置友好。",
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  router: {
    options: {
      strict: true,
    },
  },

  modules: ["@nuxt/ui"],

  css: ["@/assets/css/main.css"],
  ui: {
    fonts: false,
  },

  devtools: { enabled: true },

  compatibilityDate: "2025-11-09",
});
