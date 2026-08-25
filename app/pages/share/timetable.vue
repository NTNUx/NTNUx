<!-- 分享課表  -->
<!-- 
  /share/timetable
  query:
    - term: 課表所屬學期
    - cs: 課表資料，格式為 "courseKey:color,courseKey:color,..."
    - a: 分享者名稱（選填）
    - settings: jsonLz 格式的課表設定（選填）
-->

<template>
  <h1 class="text-2xl font-bold text-center my-6">
    {{ a ? `${a}的課表` : "分享的課表" }}
  </h1>
  <!-- timetable -->
  <ClientOnly>
    <CourseTimetable
      :timetable="timetable"
      :settings="settings"
      :shared="true"
      :term="term"
    />

    <template #fallback>
      <UProgress size="xl" color="neutral" class="max-w-md mx-auto" />
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type {} from "@/composables/useTimetable";
import { defaultTimetableSettings } from "@/composables/useTimetable";
import { jsonLzDecode } from "@/composables/useTools";

const route = useRoute();
const { term, cs, a } = route.query as {
  term?: string;
  cs?: string;
  a?: string;
  settings?: string;
};

const title = a ? `${a}的課表` : "分享的課表";
useHead({
  title: title,
});
useSeoMeta({
  title: title,
  appleMobileWebAppTitle: title,
  ogTitle: title,
  twitterTitle: title,
});

const timetable = ref({});
const settings = ref<any>(defaultTimetableSettings);
if (route.query.settings?.length) {
  try {
    const decodedSettings: any = jsonLzDecode(route.query.settings as string);
    settings.value = {
      ...defaultTimetableSettings,
      ...decodedSettings,
    };
  } catch (error) {
    console.warn("無法解析課表設定，使用預設設定:", error);
  }
}
const errorEntries = ref<string[]>([]);
onMounted(() => {
  // 預先載入課表資料
  importCourses(cs as string, term as string)
    .then(
      ({
        timetable: importedTimetable,
        errorEntries: importedErrorEntries,
      }) => {
        timetable.value = importedTimetable;
        errorEntries.value = importedErrorEntries;
      },
    )
    .catch((error) => {
      console.error("匯入課表失敗:", error);
    });
});
</script>
