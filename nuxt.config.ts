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
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "lz-string", // CJS
        "jsonc.min", // CJS
        "html-to-image",
        "@tanstack/vue-table",
        "@tanstack/vue-virtual",
      ],
    },
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    prerender: {
      autoSubfolderIndex: false,
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

  runtimeConfig: {
    public: {
      ntnuxDefaultTerm: "",
      ntnuxTerms: "",
      ntnuxScheduleLz: "",
      ntnuxDepartmentsLz: "",
      ntnuxGeneralsLz: "",
      ntnuxProgramsLz: "",
    },
  },
  colorMode: {
    preference: "light",
    fallback: "light",
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  compatibilityDate: "2025-11-09",
});
