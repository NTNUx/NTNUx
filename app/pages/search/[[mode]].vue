<template>
  <div class="page-container w-full">
    <!-- search bar -->
    <CourseSearchBar />
    <!-- table -->
    <CourseTable />
  </div>
</template>

<script lang="ts" setup>
import { CourseTable, CourseSearchBar } from "#components";
import { modeList, modeMap } from "@/composables/useConstants";
import { getTimetable } from "@/composables/useTimetable";

const route = useRoute();
const params = ref(route.params);
const mode = computed(() => {
  return params.value.mode as string;
});
// assert mode
if (!modeList.includes(mode.value as any)) {
  navigateTo({
    path: "/search/quick",
    replace: true,
  });
}

const title = computed(() => modeMap[mode.value as string] || "課程搜尋");
useHead({
  title: title.value,
});
useSeoMeta({
  title: title.value,
  appleMobileWebAppTitle: title.value,
  ogTitle: title.value,
  twitterTitle: title.value,
  ogUrl: `https://ntnux.org/search/${mode.value}`,
});

const defaultTerm = useState<string>(
  "defaultTerm",
  () => (useRuntimeConfig().public.ntnuxDefaultTerm as string) || "",
);
const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);

onMounted(() => {
  // prefetch timetable data for current term
  getTimetable(currentTerm.value);
});
</script>
