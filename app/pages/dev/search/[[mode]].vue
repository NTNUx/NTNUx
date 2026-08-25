<template>
  <div class="page-container w-full">
    <UBanner
      color="error"
      title="這是一個開發測試頁面，可能有錯誤或效能問題，內容也可能會被更改或移除，點擊這裡回到快速搜尋頁面。"
      :to="{
        path: '/search/quick',
      }"
    />

    <!-- search bar -->
    <CourseSearchBar />

    <!-- dev -->
    <UTabs :items="tabs">
      <template #dept>
        <div class="w-full flex flex-row gap-4">
          <div class="flex flex-col gap-2">
            <UButton
              label="從環境變數載入並轉換為 JSON"
              color="primary"
              @click="deptInput = JSON.stringify(deptItems, null, 2)"
            />
            <UButton
              label="從 JSON 轉換並更新元件"
              color="success"
              @click="updateDeptItems()"
            />
          </div>
          <UTextarea
            placeholder="NUXT_PUBLIC_NTNUX_DEPARTMENTS_LZ (json)"
            v-model="deptInput"
          />

          <div class="flex flex-col gap-2">
            <UButton
              label="轉換為 LZ-string"
              color="primary"
              @click="deptInputLz = jsonLzEncode(deptInput)"
            />

            <UButton
              label="轉換為 JSON 字串"
              color="primary"
              @click="
                deptInput = JSON.stringify(jsonLzDecode(deptInputLz), null, 2)
              "
            />
          </div>

          <UTextarea
            placeholder="NUXT_PUBLIC_NTNUX_DEPARTMENTS_LZ (lz-string)"
            v-model="deptInputLz"
          />

          <UButton
            label="更新 JSON 字串 及 deptItems"
            color="success"
            @click="
              deptInput = JSON.stringify(jsonLzDecode(deptInputLz), null, 2);
              updateDeptItems();
            "
          />
        </div>
      </template>
    </UTabs>

    <!-- table -->
    <CourseTable />
  </div>
</template>

<script lang="ts" setup>
import { CourseTable, CourseSearchBar } from "#components";
import { jsonLzEncode, jsonLzDecode } from "@/composables/useTools";
import { JSONC } from "jsonc.min";

const route = useRoute();
const router = useRouter();

// dev page
const config = useRuntimeConfig();
const tabs = [
  {
    label: "NUXT_PUBLIC_NTNUX_DEPARTMENTS_LZ",
    slot: "dept",
  },
];
const deptItems = useState(
  "deptDropdownItems",
  () => jsonLzDecode(config.public.ntnuxDepartmentsLz as string) || [],
);
const deptInput = ref("");
const deptInputLz = ref(deptInput.value ? jsonLzEncode(deptInput.value) : "");
const updateDeptItems = () => {
  deptItems.value = JSONC.parse(deptInput.value);
};
</script>
