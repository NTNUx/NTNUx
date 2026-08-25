<!-- 使用者課表，使用 LocalStorage 儲存課程資料  -->

<template>
  <!-- controls -->
  <CourseTimetableControl />

  <!-- timetable -->
  <ClientOnly>
    <CourseTimetable :timetable="currentTimetable" :settings="settings" />

    <template #fallback>
      <UProgress size="xl" color="neutral" class="max-w-md mx-auto" />
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { TimetableSettings, Timetable } from "@/composables/useTimetable";
import {
  allTimetable,
  timetableSettings,
  clearTimetable,
} from "@/composables/useTimetable";

const config = useRuntimeConfig();
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (config.public.ntnuxDefaultTerm as string) || "",
);
const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);

const currentTimetable = computed<Timetable>(() => {
  const term = currentTerm.value;
  if (!term) {
    return {} as Timetable;
  }
  if (!allTimetable.value[term]) {
    getTimetable(term);
  }
  return allTimetable.value[term] || ({} as Timetable);
});
const settings = computed<TimetableSettings>(() => {
  return timetableSettings.value || {};
});

const title = "我的課表";
useHead({
  title: title,
});
useSeoMeta({
  title: title,
  appleMobileWebAppTitle: title,
  ogTitle: title,
  twitterTitle: title,
  ogUrl: "https://ntnux.org/user/timetable",
});

onMounted(() => {
  // 預先載入課表資料
  const term = useRoute().query.y as string;
  if (term) {
    currentTerm.value = term;
    getTimetable(currentTerm.value);
  }
});
</script>
