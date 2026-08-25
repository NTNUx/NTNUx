<template>
  <div class="course-table-container max-w-7xl m-auto mb-8">
    <div
      class="relative rounded-lg w-11/12 max-lg:w-full m-auto overflow-clip shadow-xl"
    >
      <div
        class="course-table-header"
        :class="[
          'sticky top-(--ui-header-height) w-full z-10 h-12',
          'bg-primary text-white',
          'flex justify-between items-center mx-auto',
        ]"
      >
        <div class="text-left p-2 flex items-center gap-1">
          <!-- left: # of courses/filter -->
          <UIcon name="tabler:info-circle" />
          <ClientOnly>
            <div>
              {{
                tableOptions?.data
                  ? `第 ${firstVisibleIndex} / ${rowVirtualizerOptions?.count || 0} 筆課程`
                  : "課程們還在路上..."
              }}
            </div>
            <template #fallback>
              <div class="size-4"></div>
            </template>
          </ClientOnly>
        </div>
        <div class="text-right p-2 flex items-center gap-1">
          <!-- right: setting of table -->
          <ClientOnly class="max-sm:hidden">
            <div>
              {{ "最後更新：" + currentTermUpdateTime }}
            </div>
            <template #fallback>
              <div class="size-4"></div>
            </template>
          </ClientOnly>
          <UButton
            icon="tabler:settings"
            variant="link"
            class="text-white hover:text-shadow-white hover:text-gray-300"
            @click="settingsModalOpen = true"
          />
        </div>
      </div>
      <div ref="parentRef" class="course-table-body block">
        <div
          class="relative course-table w-full divide-solid divide-y-2 divide-gray-200"
          :style="{
            height: totalSize + 'px',
          }"
          :class="!virtualRows?.length ? 'min-h-60' : ''"
        >
          <ul
            ref="virtualListRef"
            :style="{
              transform: `translateY(${translateY}px)`,
            }"
            class="w-full mx-auto absolute top-0 left-0"
          >
            <li
              v-for="virtualRow in virtualRows"
              :key="(virtualRow.key as number) || virtualRow.index"
              :data-index="virtualRow.index"
              :ref="measureElement"
              :class="virtualRow.index % 2 ? 'even-row' : 'odd-row'"
            >
              <CourseRow
                :course="tableRows[virtualRow.index]?.original"
                :last="virtualRow.index === tableRows.length - 1"
                @vue:mounted="handleCourseRowMounted"
              />
            </li>
            <li
              v-if="!virtualRows?.length"
              class="pt-20 text-center text-gray-500"
            >
              {{
                tableOptions?.data ? "沒有符合條件的課程" : "課程們還在路上..."
              }}
            </li>
          </ul>
        </div>
      </div>
      <UButton
        label="回到頂部"
        color="primary"
        size="lg"
        @click="scrollToTop"
        class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-xl shadow-sm transition-all text-white"
        :class="firstVisibleIndex > 1 ? '' : 'translate-y-2 scale-75 opacity-0'"
      >
        <template #leading>
          <UIcon
            :name="
              firstVisibleIndex < 50
                ? 'tabler:arrow-big-up'
                : firstVisibleIndex < 100
                  ? 'tabler:arrow-big-up-line'
                  : firstVisibleIndex < 250
                    ? 'tabler:arrow-big-up-lines'
                    : 'tabler:rocket'
            "
            :class="firstVisibleIndex < 250 ? '' : '-rotate-45'"
          />
        </template>
      </UButton>
    </div>
    <UModal
      v-model:open="settingsModalOpen"
      title="課程表設定"
      description="此功能仍在開發中"
      :close="{ variant: 'link' }"
      :ui="{
        header: 'bg-primary',
        title: 'text-white',
        description: 'text-white/80',
        close: 'text-white hover:text-shadow-white hover:text-gray-300',
        body: 'max-h-[80vh] overflow-auto',
      }"
      @after:leave="settings = { ...settings, ...settingsTemp }"
    >
      <template #body>
        <CourseTableSettings />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useCourseTable } from "@/composables/useCourseTable";
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { CourseRow } from "#components";
import {
  type CourseTableSettings,
  defaultCourseTableSettings,
} from "@/composables/useCourseTable";

const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);
const { table, tableOptions, refreshAll, currentTermUpdateTime } =
  useCourseTable();
const tableRows = computed(() => table.value.getRowModel().rows);
const filters = useState<Record<string, any>>("courseTableFilters", () => ({}));
const settingsModalOpen = useState("courseTableSettingsModalOpen", () => false);
const settings = useState<CourseTableSettings>("courseTableSettings", () => ({
  ...defaultCourseTableSettings,
})); // TODO: local storage
const settingsTemp = useState<Record<string, any>>(
  "courseTableSettingsTemp",
  () => ({ ...settings.value }),
);

const isRendering = ref(false);
const isCourseRowMountPending = ref(false);
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);
const rowVirtualizerOptions = computed(() => {
  return {
    count: tableRows.value.length,
    estimateSize: () => (windowWidth.value < 640 ? 400 : 200),
    scrollMargin: parentOffsetRef.value,
  };
});
const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());
const measureElement = (el: any) => {
  if (!el) {
    return;
  }

  rowVirtualizer.value.measureElement(el);

  return undefined;
};
const translateY = computed(() => {
  return virtualRows.value.length > 0
    ? (virtualRows.value[0]?.start ?? 0) -
        (rowVirtualizerOptions.value.scrollMargin ?? 0)
    : 0;
});

const virtualListRef = ref<HTMLElement | null>(null);
const firstVisibleIndex = ref(0);
const handleCourseRowMounted = () => {
  if (!isCourseRowMountPending.value) {
    return;
  }

  isRendering.value = false;
  isCourseRowMountPending.value = false;
};
const handleScroll = () => {
  for (const child of virtualListRef.value?.children || []) {
    if (
      child.getBoundingClientRect().bottom >
      40 /* table header height */ + 64 /* page header height */
    ) {
      firstVisibleIndex.value = Number(child.getAttribute("data-index")) + 1;
      break;
    }
  }

  if (tableRows.value.length > 0) {
    if (firstVisibleIndex.value <= 0 && rowVirtualizerOptions.value.count > 0) {
      firstVisibleIndex.value = 1;
    } else if (firstVisibleIndex.value > rowVirtualizerOptions.value.count) {
      firstVisibleIndex.value = rowVirtualizerOptions.value.count;
    }
  } else {
    firstVisibleIndex.value = 0;
  }
};

const scrollToTop = () => {
  rowVirtualizer.value.scrollToIndex(0);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  handleScroll();
};

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
  isRendering.value = true;
  isCourseRowMountPending.value = true;
  window.addEventListener("scroll", handleScroll);

  if (!tableOptions?.data) {
    refreshAll();
  }
  loadFavoriteCourses();
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
watch(
  () => virtualRows.value.length,
  () => {
    handleScroll();

    if (tableRows.value.length <= 0) {
      isRendering.value = false;
      isCourseRowMountPending.value = false;

      return;
    }

    isRendering.value = true;
    isCourseRowMountPending.value = true;
  },
);
</script>
