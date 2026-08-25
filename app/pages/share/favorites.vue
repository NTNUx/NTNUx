<template>
  <div class="page-container w-full">
    <h1 class="text-2xl font-bold text-center my-6 grid">
      {{ title || "分享的收藏課程" }}
      <span v-if="depict" class="text-sm text-dimmed mx-auto">{{
        depict
      }}</span>
      <span v-if="a" class="text-sm text-dimmed mx-auto">作者：{{ a }}</span>
      <div>
        <UBadge
          v-for="tag in tags
            ? tags.split(',').map((t: string) => t.trim())
            : []"
          :key="tag"
          :label="tag"
          size="sm"
          color="neutral"
          variant="soft"
          class="rounded-full justify-center font-bold mx-1 mt-2"
        />
      </div>
    </h1>
    <ULink
      v-if="link && linktitle"
      :href="link"
      class="text-center text-dimmed hover:underline mb-4 block"
      target="_blank"
    >
      {{ linktitle }}
    </ULink>
    <CourseFavoritesControl
      :favoriteCourses="sharedFavoriteCourses"
      :courseNameMap="courseNameMap"
      :shared="true"
    />

    <ClientOnly>
      <CourseFavoritesTable
        :favoriteCourses="sharedFavoriteCourses"
        :courseNameMap="courseNameMap"
        :shared="true"
      />

      <template #fallback>
        <UProgress size="xl" color="neutral" class="max-w-md mx-auto mt-20!" />
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { prefetchDefaultTermData } from "@/composables/useCourseTable";
import { loadFavoriteCourses } from "@/composables/useFavorites";
import type {
  FavoriteCourses,
  CourseNameMap,
} from "@/composables/useFavorites";

const { cs, title, depict, a, linktitle, link, tags }: any = useRoute().query;

// cs: courseCode:courseName,courseCode:courseName,...
const sharedFavorite = computed(() => {
  if (!cs || typeof cs !== "string") return [];
  return cs.split(",").map((item) => {
    const [code, name] = item.split(":").map((part) => part.trim());
    return { code, name };
  });
});
const sharedFavoriteCourses = computed<FavoriteCourses>(() => {
  return sharedFavorite.value.map((item) => item.code || "");
});
const courseNameMap = computed<CourseNameMap>(() => {
  const map: CourseNameMap = {};
  sharedFavorite.value.forEach((item) => {
    if (item.code && item.name) map[item.code] = item.name;
  });
  return map;
});

const pageTitle = title ? `收藏課程（${title}）` : "分享的收藏課程";
useHead({
  title: pageTitle,
});
useSeoMeta({
  title: pageTitle,
  appleMobileWebAppTitle: pageTitle,
  ogTitle: pageTitle,
  twitterTitle: pageTitle,
});

onMounted(() => {
  prefetchDefaultTermData(false);
  loadFavoriteCourses();
});
</script>
