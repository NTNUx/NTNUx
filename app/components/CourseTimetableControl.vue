<template>
  <div
    class="mx-auto w-full max-w-2xl p-4 flex flex-row flex-wrap gap-x-2 gap-y-3"
  >
    <!-- term selector -->
    <UDropdownMenu
      :items="dropdownTermOptions"
      :content="{
        align: 'start',
        side: 'bottom',
      }"
    >
      <UButton
        :label="currentTerm || '學期'"
        :color="currentTerm ? 'primary' : 'neutral'"
        variant="outline"
        size="lg"
        icon="tabler:calendar"
        class="cursor-pointer"
      />
    </UDropdownMenu>
    <!-- settings modal -->
    <UModal title="課表設定" :ui="{ body: 'flex flex-col gap-4 !pt-2' }">
      <UButton
        slot="trigger"
        variant="outline"
        size="lg"
        icon="tabler:settings"
        label="設定"
        class="cursor-pointer"
        :ui="{ label: 'max-sm:hidden' }"
      />
      <template #body>
        <USwitch
          v-model="settings.showWeekend"
          label="顯示週六"
          description="在課表中顯示週六的欄位"
        />
        <USwitch
          v-model="settings.spanContinuous"
          label="合併連堂課（推薦開啟）"
          description="將連續課程合併顯示，有重疊課程時可能不如預期"
        />
        <USwitch
          v-model="settings.allowOverlap"
          label="允許課程重疊"
          description="忽略課表衝突警告"
        />
        <USwitch
          v-model="settings.hidePeriod"
          label="隱藏節次"
          description="不顯示課表左側的節次標籤"
        />
        <USwitch
          v-model="settings.hidePeriodTime"
          label="隱藏節次時間"
          description="不顯示課表左側節次標籤下的時間資訊"
        />
        <div>
          <label class="flex flex-col gap-0.2 mb-1">
            <span class="text-sm font-medium">隱藏特定節次</span>
            <span class="text-sm text-muted">
              選擇要在課表中隱藏的節次（例如：中午、早七等）
            </span>
          </label>
          <USelect
            v-model="settings.hidePeriods"
            :items="Array.from(periods as any as string[])"
            multiple
            class="w-full max-w-xs"
          />
        </div>
        <USwitch v-model="settings.showOthers" label="顯示其他課程" />
        <USwitch v-model="settings.showCourseTeacher" label="顯示授課教師" />
        <USwitch v-model="settings.showCourseLocation" label="顯示上課地點" />

        <UModal
          title="重置課表設定"
          description="確定要重置課表設定？不包括選擇的課程。"
          :ui="{
            header: 'py-2',
            description: 'whitespace-pre-line',
            footer: 'justify-end py-2',
            content: 'max-w-md',
          }"
          v-model:open="resetSettingsModalOpen"
        >
          <UButton
            label="重置設定"
            color="error"
            variant="outline"
            @click="resetSettingsModalOpen = true"
            class="mt-4 w-fit"
          />
          <template #footer>
            <div class="text-center">
              <div class="flex justify-center gap-4">
                <UButton
                  label="取消"
                  variant="outline"
                  @click="resetSettingsModalOpen = false"
                />
                <UButton
                  label="確定"
                  color="error"
                  @click="
                    resetTimetableSettings();
                    resetSettingsModalOpen = false;
                  "
                />
              </div>
            </div>
          </template>
        </UModal>
      </template>
    </UModal>

    <UModal
      title="清空課表"
      description="確定要清空課表？此操作幾乎沒辦法在宇宙毀滅前復原！"
      :ui="{ header: 'py-2', footer: 'justify-end py-2', content: 'max-w-md' }"
      v-model:open="clearTimetableModalOpen"
    >
      <UButton
        label="清空課表"
        color="error"
        variant="outline"
        icon="tabler:trash"
        class="ml-4 cursor-pointer"
        :ui="{ label: 'max-sm:hidden' }"
      />
      <template #footer>
        <div class="text-center">
          <div class="flex justify-center gap-4">
            <UButton
              label="取消"
              variant="outline"
              @click="clearTimetableModalOpen = false"
            />
            <UButton
              label="確定"
              color="error"
              @click="
                clearTimetableModalOpen = false;
                clearTimetable(currentTerm);
              "
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Import modal -->
    <UModal
      title="匯入課表"
      :description="'請注意：\n匯入的課表資料將會覆蓋現有課表資料，若有需要請先備份課表資料。'"
      :ui="{
        header: 'py-2',
        description: 'whitespace-pre-line',
        footer: 'justify-end py-2',
        content: 'max-w-md',
        body: 'p-4! max-h-[70vh] overflow-y-auto',
      }"
      v-model:open="importModalOpen"
      scrollable
    >
      <UButton
        label="匯入"
        color="neutral"
        variant="outline"
        icon="tabler:download"
        @click="importModalOpen = true"
        class="h-9 cursor-pointer ml-auto"
        :ui="{ label: 'max-sm:hidden' }"
      />

      <template #body>
        <UTextarea
          v-show="!tempTimetable || Object.keys(tempTimetable).length === 0"
          v-model="importTextarea"
          :placeholder="'請輸入匯出的課表資料\n以逗號或換行分隔課程\n或貼上 NTNUx 課表分享連結'"
          class="w-full"
          color="neutral"
          variant="soft"
          :rows="6"
          autoresize
        />
        <div
          v-show="tempTimetable && Object.keys(tempTimetable).length > 0"
          class="gap-y-0.5"
        >
          <div class="text-center mb-2">
            以下是匯入的課表預覽，請確認後點擊「確認匯入」
          </div>
          <UButton
            v-for="(course, key) in tempTimetable"
            :key="key"
            variant="soft"
            color="neutral"
            class="w-full mb-1 p-0"
          >
            <div
              class="w-full grid grid-cols-[30px_50px_auto] gap-4 items-start justify-items-start p-1.5 cursor-pointer"
            >
              <div>{{ course?.id }}</div>
              <div>{{ course?.course_code }}</div>
              <div
                class="w-full font-bold flex flex-row-reverse justify-end gap-2 items-center overflow-x-hidden"
              >
                <div
                  class="text-sm text-dimmed flex flex-row gap-1.5 items-center justify-start whitespace-nowrap w-fit"
                >
                  <div>{{ course?.teacher }}</div>
                  <div>{{ course?.tl?.join("/") }}</div>
                </div>
                <div class="whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ course?.name }}
                </div>
              </div>
            </div>
          </UButton>
        </div>
      </template>

      <template #footer>
        <UButton
          label="清除"
          variant="outline"
          color="neutral"
          class="mr-auto"
          icon="tabler:trash"
          @click="
            () => {
              importTextarea = '';
              tempTimetable = {} as Timetable;
            }
          "
        />
        <UButton
          v-if="!tempTimetable || Object.keys(tempTimetable).length === 0"
          label="解析"
          color="primary"
          class="item-center justify-center"
          @click="submitImport"
          :loading="importLoading"
          :disabled="!importTextarea || importTextarea.trim() === ''"
        />
        <UButton
          v-else
          label="確認匯入"
          color="primary"
          class="item-center justify-center"
          @click="
            () => {
              allTimetable[currentTerm] = tempTimetable;
              setTimetable(currentTerm, tempTimetable);
              importModalOpen = false;
              importTextarea = '';
              tempTimetable = {} as Timetable;
            }
          "
        />
      </template>
    </UModal>

    <!-- export modal -->
    <UModal
      title="匯出課表"
      :description="'以下是匯出的課表資料\n複製它們來分享、備份、快速選課或匯入到其它裝置'"
      :ui="{
        header: 'py-2',
        body: 'flex flex-col gap-4 !pt-2',
        description: 'whitespace-pre-line pr-8',
      }"
      v-model:open="exportModalOpen"
      scrollable
    >
      <UButton
        label="匯出課表"
        color="neutral"
        variant="outline"
        icon="tabler:upload"
        class="h-9 cursor-pointer"
        @click="
          exportTimetable();
          exportModalOpen = true;
        "
        :ui="{ label: 'max-sm:hidden' }"
      />

      <template #body>
        <div>
          <UButton
            label="下載課表影像"
            color="neutral"
            variant="outline"
            icon="tabler:download"
            class="h-9 cursor-pointer"
            :loading="downloading"
            :disabled="downloading"
            @click="downloadTimetableImage"
          />
        </div>
        <USwitch
          v-model="includeColorInExport"
          label="在匯出資料中包含課程背景顏色"
          @change="exportTimetable"
        />
        <USwitch
          v-model="includeSettingsInExport"
          label="在匯出資料中包含課表設定"
          @change="exportTimetable"
        />
        <UFormField label="加上你的暱稱">
          <UInput
            v-model="includeAuthorInExport"
            placeholder="選填，分享時會顯示在課表上，方便朋友認出來是你的課表"
            class="w-full"
            color="neutral"
            variant="outline"
            @update:model-value="exportTimetable"
          />
        </UFormField>
        <UInput
          v-model="exportUrl"
          label="分享連結（點擊複製）"
          readonly
          @click="copyToClipboard(exportUrl, '分享連結')"
          class="w-full"
          color="neutral"
          variant="outline"
          :ui="{ base: 'select-all! cursor-pointer' }"
        />
        <UTextarea
          v-model="exportData"
          label="匯出資料（點擊複製）"
          readonly
          @click="copyToClipboard(exportData, '匯出資料')"
          class="w-full"
          color="neutral"
          variant="outline"
          :rows="6"
          :ui="{ base: 'select-all! cursor-pointer' }"
          autoresize
        />
      </template>
    </UModal>
    <div class="flex flex-row gap-2 w-full h-9">
      <!-- search modal -->
      <UModal @update:open="onOpen" :ui="{ content: 'max-w-2xl' }">
        <UButton
          label="搜尋課程"
          color="neutral"
          variant="soft"
          icon="tabler:search"
          class="w-full max-w-sm cursor-pointer"
        />
        <template #content>
          <UCommandPalette
            v-model:search-term="searchInput"
            @update:search-term="updateGlobalFilterByInput(searchInput)"
            :groups="courseGroup"
            :loading="loading"
            :virtualize="{ estimateSize: 30 }"
            :fuse="{ resultLimit: 1000 }"
            placeholder="搜尋課程..."
            class="h-80"
            :ui="{ item: 'h-7.5 p-0' }"
          >
            <template #item="{ item }">
              <div
                class="w-full grid grid-cols-[30px_50px_auto_20px] gap-4 sm:gap-2 items-start justify-items-start p-1.5 cursor-pointer"
                @click="
                  () => {
                    if (item) {
                      toggleCourseInTimetable(currentTerm, item as Course);
                    }
                  }
                "
              >
                <div>{{ item?.id }}</div>
                <div>{{ item?.course_code }}</div>
                <div
                  class="w-full font-bold flex flex-row-reverse justify-end gap-2 items-center overflow-x-hidden"
                >
                  <div
                    class="text-sm text-dimmed flex flex-row gap-1.5 items-center justify-start whitespace-nowrap w-fit"
                  >
                    <div>{{ item?.teacher }}</div>
                    <div>{{ item?.time?.join("/") }}</div>
                  </div>
                  <div class="whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ item?.name }}
                  </div>
                </div>
                <div>
                  <!-- check icon if selected -->
                  <UIcon
                    v-if="isCourseInTimetable(currentTerm, item as Course)"
                    name="tabler:check"
                    color="green"
                  />
                </div>
              </div>
            </template>
          </UCommandPalette>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  clearTimetable,
  toggleCourseInTimetable,
  isCourseInTimetable,
  timetableSettings as settings,
  getTimetableSettings,
  setTimetableSettings,
  resetTimetableSettings,
  importCourses,
  exportTimetableSettings,
} from "@/composables/useTimetable";
import { periods } from "@/composables/useConstants";
import { copyToClipboard } from "@/composables/useTools";

import type { Course } from "@/composables/useCourseTable";
import { toBlob } from "html-to-image";

const timetableRef = useState<HTMLTableElement>("timetableRef");
const config = useRuntimeConfig();
const termList = useState<string[]>("termList", () =>
  config.public.ntnuxTerms
    ? ((config.public.ntnuxTerms as String) || "")
        .split(",")
        .map((term: string) => term.trim())
    : [],
);
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (config.public.ntnuxDefaultTerm as string) || "",
);
const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);
const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
const currentTermData = computed<TermData>(() => {
  return dataAllTerms.value[currentTerm.value] || [];
});
const { table, refreshAll } = useCourseTable();
const searchInput = ref("");
const loading = ref(false);
const courseGroup = computed(() => [
  {
    id: "course",
    items: table.value
      .getRowModel()
      .rows.map((row: any) => row.original) as Course[],
    ignoreFilter: true,
  },
]);
function onOpen(isOpen: boolean) {
  if (isOpen) {
    // open search modal
    if (!currentTermData.value || currentTermData.value.length === 0) {
      loading.value = true;
      refreshAll().then(() => {
        console.log("Course data refreshed");
        loading.value = false;
      });
    }
  }
}

const dropdownTermOptions = computed(() =>
  termList.value.map((year) => {
    return {
      label: year,

      children: [
        {
          label: `${year}-1`,
          value: `${year}-1`,
          onSelect() {
            currentTerm.value = `${year}-1`;
          },
        },
        {
          label: `${year}-2`,
          value: `${year}-2`,
          onSelect() {
            currentTerm.value = `${year}-2`;
          },
        },
      ],
    };
  }),
);

watch(
  settings,
  (newSettings) => {
    setTimetableSettings(newSettings);
  },
  { deep: true },
);

const clearTimetableModalOpen = ref(false);
const resetSettingsModalOpen = ref(false);

const importModalOpen = ref(false);
const importLoading = ref(false);
const importTextarea = ref("");
const tempTimetable = ref<Timetable>({} as Timetable);
function submitImport() {
  importLoading.value = true;
  if (!importTextarea.value || importTextarea.value.trim() === "") {
    alert("請輸入課表資料");
    return;
  }
  const input =
    importTextarea.value.search("cs=") !== -1
      ? decodeURIComponent(
          importTextarea.value.split("cs=")[1]?.trim().split("&")[0] || "",
        )
      : importTextarea.value.trim();
  importCourses(input).then(({ timetable, errorEntries }) => {
    importLoading.value = false;
    if (
      errorEntries.length > 0 ||
      !timetable ||
      Object.keys(timetable).length === 0
    ) {
      alert(
        `以下課程代碼匯入失敗，請確認課程代碼正確且存在於目前學期的課程資料中：\n${errorEntries.join(
          "\n",
        )}`,
      );
    } else {
      alert("課表匯入成功！");
    }
    if (timetable) {
      tempTimetable.value = timetable;
    }
  });
}

const exportModalOpen = ref(false);
const exportData = ref("");
const exportUrl = ref("");
const includeColorInExport = ref(false);
const includeSettingsInExport = ref(false);
const includeAuthorInExport = ref("");
function exportTimetable() {
  const timetable = allTimetable.value[currentTerm.value];
  if (!timetable || Object.keys(timetable).length === 0) {
    alert("目前課表沒有資料可供匯出");
    exportModalOpen.value = false;
    return;
  }
  exportData.value = exportCourseDataIds(
    currentTerm.value,
    includeColorInExport.value,
  );
  exportUrl.value =
    window.location.origin +
    "/share/timetable?cs=" +
    `${exportCourseDataParams(currentTerm.value, includeColorInExport.value)}` +
    `&term=${encodeURIComponent(currentTerm.value)}` +
    (includeAuthorInExport.value.trim() !== ""
      ? `&a=${encodeURIComponent(includeAuthorInExport.value.trim())}`
      : "") +
    (includeSettingsInExport.value
      ? `&settings=${exportTimetableSettings(settings.value)}`
      : "");
}
const downloading = useState("downloadingTimetableImage", () => false);
async function downloadTimetableImage() {
  if (!timetableRef.value) {
    alert("無法取得課表元素");
    return;
  }
  downloading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 100));

  toBlob(timetableRef.value, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "var(--ui-bg)",
  })
    .then((blob) => {
      if (!blob) {
        throw new Error("無法生成圖片");
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `timetable-${currentTerm.value}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("匯出課表影像失敗:", error);
      alert("匯出課表影像失敗，請稍後再試");
    })
    .finally(() => {
      downloading.value = false;
    });
}

onMounted(() => {
  if (!currentTermData.value || currentTermData.value.length === 0) {
    loading.value = true;
    refreshAll().then(() => {
      console.log("Course data refreshed");
      loading.value = false;
    });
  }
  getTimetableSettings();
});
</script>
