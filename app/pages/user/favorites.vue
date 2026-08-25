<template>
  <div class="page-container w-full">
    <CourseFavoritesControl
      :favoriteCourses="favoriteCourses"
      :courseNameMap="courseNameMap"
    />

    <ClientOnly>
      <CourseFavoritesTable
        :favoriteCourses="favoriteCourses"
        :courseNameMap="courseNameMap"
      />

      <template #fallback>
        <UProgress size="xl" color="neutral" class="max-w-md mt-4 mx-auto" />
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { prefetchDefaultTermData } from "@/composables/useCourseTable";
import { loadFavoriteCourses } from "@/composables/useFavorites";
import { favoriteCourses, courseNameMap } from "@/composables/useFavorites";

const title = "我的收藏課程";
useHead({
  title: title,
});
useSeoMeta({
  title: title,
  appleMobileWebAppTitle: title,
  ogTitle: title,
  twitterTitle: title,
  ogUrl: "https://ntnux.org/user/favorites",
});

onMounted(() => {
  prefetchDefaultTermData(false);
  loadFavoriteCourses();
});
</script>
