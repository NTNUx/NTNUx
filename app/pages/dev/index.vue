<template>
  <div class="page-container w-full">
    <UBanner
      color="error"
      title="這是一個開發測試頁面，可能有錯誤或效能問題，內容也可能會被更改或移除，點擊這裡回到首頁。"
      :to="{
        path: '/',
      }"
    />

    <!-- carousel of important announcements -->
    <CourseCarousel />

    <!-- dev -->
    <div class="w-full flex flex-row gap-4">
      <div class="flex flex-col gap-2">
        <UButton
          label="從環境變數載入並轉換為 JSON"
          color="primary"
          @click="scheduleInput = JSON.stringify(scheduleItems, null, 2)"
        />
        <UButton
          label="從 JSON 轉換並更新元件"
          color="success"
          @click="updateScheduleItems()"
        />
      </div>
      <UTextarea
        placeholder="NUXT_PUBLIC_NTNUX_SCHEDULE_LZ (json)"
        v-model="scheduleInput"
      />

      <div class="flex flex-col gap-2">
        <UButton
          label="轉換為 LZ-string"
          color="primary"
          @click="scheduleInputLz = jsonLzEncode(scheduleInput)"
        />

        <UButton
          label="轉換為 JSON 字串"
          color="primary"
          @click="
            scheduleInput = JSON.stringify(
              jsonLzDecode(scheduleInputLz),
              null,
              2,
            )
          "
        />
      </div>

      <UTextarea
        placeholder="NUXT_PUBLIC_NTNUX_SCHEDULE_LZ (lz-string)"
        v-model="scheduleInputLz"
      />

      <UButton
        label="更新 JSON 字串 及 scheduleItems"
        color="success"
        @click="
          scheduleInput = JSON.stringify(
            jsonLzDecode(scheduleInputLz),
            null,
            2,
          );
          updateScheduleItems();
        "
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CourseSearchBar, CourseCarousel } from "#components";
import { JSONC } from "jsonc.min";

// dev
const config = useRuntimeConfig();

const scheduleItems = useState(
  "schedule",
  () => jsonLzDecode(config.public.ntnuxScheduleLz as string) || [],
);
const scheduleInput = ref("");
const scheduleInputLz = ref(
  scheduleInput.value ? jsonLzEncode(scheduleInput.value) : "",
);
const updateScheduleItems = () => {
  scheduleItems.value = JSONC.parse(scheduleInput.value);
};
</script>
