// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{indigo.50}",
      100: "{indigo.100}",
      200: "{indigo.200}",
      300: "{indigo.300}",
      400: "{indigo.400}",
      500: "{indigo.500}",
      600: "{indigo.600}",
      700: "{indigo.700}",
      800: "{indigo.800}",
      900: "{indigo.900}",
      950: "{indigo.950}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "{zinc.50}",
          100: "{zinc.100}",
          200: "{zinc.200}",
          300: "{zinc.300}",
          400: "{zinc.400}",
          500: "{zinc.500}",
          600: "{zinc.600}",
          700: "{zinc.700}",
          800: "{zinc.800}",
          900: "{zinc.900}",
          950: "{zinc.950}",
        },
        primary: {
          color: "{zinc.950}",
          inverseColor: "#ffffff",
          hoverColor: "{zinc.900}",
          activeColor: "{zinc.800}",
        },
        highlight: {
          background: "{zinc.950}",
          focusBackground: "{zinc.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
        primary: {
          color: "{zinc.50}",
          inverseColor: "{zinc.950}",
          hoverColor: "{zinc.100}",
          activeColor: "{zinc.200}",
        },
        highlight: {
          background: "rgba(250, 250, 250, .16)",
          focusBackground: "rgba(250, 250, 250, .24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
});

export default defineNuxtConfig({
  app: {
    baseURL: "", // 使用自訂網域，保留為根路徑
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
  nitro: {
    preset: "static",
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  router: {
    options: {
      strict: true,
    },
  },

  modules: ["@primevue/nuxt-module"],

  css: ["primeicons/primeicons.css"],

  primevue: {
    options: {
      theme: {
        preset: MyPreset,
        options: {
          dark: false,
          darkModeSelector: ".dark-mode-toggle",
        },
      },
    },
    components: {
      prefix: "Prime",
      exclude: ["Editor", "Chart", "Form", "FormField"], // To fix import error from PrimeVue
    },
  },

  devtools: { enabled: true },

  ssr: false,

  runtimeConfig: {
    public: {
      isCloudflare: process.env.NUXT_RUNTIME_ENV === "cloudflare",
    },
  },

  compatibilityDate: "2024-07-05",
});
