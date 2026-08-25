<template>
  <UButton
    :icon="isFavorite ? 'tabler:heart-filled' : 'tabler:heart'"
    size="lg"
    color="neutral"
    variant="link"
    @click="toggleFavorite"
    class="hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
  />
</template>

<script lang="ts" setup>
import {
  favoriteCourses,
  toggleFavoriteCourseByCode,
} from "@/composables/useFavorites";
import {
  addToFavoritesToast,
  removeFromFavoritesToast,
} from "@/composables/useTools";

const { courseName, courseCode } = defineProps<{
  courseName: string | undefined;
  courseCode: string | undefined;
}>();

const isFavorite = computed(() =>
  courseCode ? favoriteCourses.value.includes(courseCode) : false,
);

function toggleFavorite() {
  if (!courseCode) return;
  toggleFavoriteCourseByCode(courseCode, courseName);
  if (isFavorite.value) {
    addToFavoritesToast(courseName || "", courseCode || "");
  } else {
    removeFromFavoritesToast(courseName || "", courseCode || "");
  }
}
</script>
