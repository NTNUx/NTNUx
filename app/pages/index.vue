<template>
  <div class="page-container w-full">
    <!-- search bar -->
    <CourseSearchBar />

    <!-- carousel of important announcements -->
    <CourseCarousel />
  </div>
</template>

<script lang="ts" setup>
import { CourseSearchBar, CourseCarousel } from "#components";

const title = "NTNUx - 臺師大課程選課工具";
useHead({
  title: title,
});
useSeoMeta({
  title: title,
  appleMobileWebAppTitle: title,
  ogTitle: title,
  twitterTitle: title,
  ogUrl: "https://ntnux.org/",
});
</script>
