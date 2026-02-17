<template>
  <div id="app" class="flex flex-col min-h-screen w-full">
    <UApp>
      <NuxtPage />
    </UApp>
  </div>
</template>

<script setup>
import { useCourseTable } from "#imports";

const { getDefaultTerm } = useCourseTable();
getDefaultTerm();

useHead({
  title: "",
  titleTemplate: (titleChunk) => {
    return titleChunk && !titleChunk.includes("NTNUx")
      ? `${titleChunk.trim()}｜NTNUx`
      : "NTNUx｜課程查詢系統";
  },
});
useSeoMeta({
  title: "NTNUx｜課程查詢系統",
  description: "更適合師大人的課程查詢系統，更快、更強、行動裝置友好。",
  appleMobileWebAppTitle: "NTNUx｜課程查詢系統",
  appleMobileWebAppCapable: "yes",
  mobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "black-translucent",
  ogTitle: "NTNUx｜課程查詢系統",
  ogDescription: "NTNUx - 更適合師大人的課程查詢系統",
  ogType: "website",
  ogImage: "https://ntnux.org/favicon.png",
  ogImageAlt: "NTNUx - 更適合師大人的課程查詢系統",
  ogUrl: "https://ntnux.org",
  twitterCard: "summary_large_image",
  twitterTitle: "NTNUx｜課程查詢系統",
  twitterDescription: "NTNUx - 更適合師大人的課程查詢系統",
  twitterImage: "https://ntnux.org/favicon.png",
});

const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);

function updateWidth() {
  windowWidth.value = window?.innerWidth || 1200;
}

onMounted(() => {
  window.addEventListener("resize", updateWidth);
});

onBeforeMount(() => {
  window.removeEventListener("resize", updateWidth);
});
</script>

<style lang="scss">
*,
*:before,
*:after {
  box-sizing: border-box;
}
body {
  font-family: "LXGW WenKai Mono TC", monospace, "avutmv2";
}
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer and Edge */
}
</style>
