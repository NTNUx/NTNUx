<template>
  <div class="course-table-container min-h-screen">
    <div class="rounded-lg w-11/12 m-auto overflow-clip">
      <div
        class="course-table-header"
        :class="[
          'sticky top-0 w-full z-10 h-12',
          'bg-secondary text-white',
          'flex justify-between items-center mx-auto',
        ]"
      >
        <div class="text-left p-2">
          <!-- left: # of courses/filter -->
          <UIcon name="tabler:info-circle" />
          {{
            rowVirtualizerOptions.count
              ? `第 ${clamp(firstVisibleIndex, 0, rowVirtualizerOptions.count)} / ${rowVirtualizerOptions.count} 筆課程`
              : "沒有課程"
          }}
        </div>
        <div class="text-right p-2">
          <!-- right: setting of table -->
          <UButton
            icon="tabler:settings"
            variant="link"
            class="text-white hover:text-shadow-white"
          />
        </div>
      </div>
      <div ref="parentRef" class="course-table-body block">
        <div
          class="relative course-table w-full divide-solid divide-y-2 divide-gray-200"
          :style="{
            height: totalSize + 'px',
          }"
        >
          <ul
            ref="virtualListRef"
            :style="{
              transform: `translateY(${
                virtualRows[0]?.start
                  ? virtualRows[0].start -
                    (rowVirtualizer.options.scrollMargin ?? 0)
                  : 0
              }px)`,
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
              <CourseRow :course="tableRows[virtualRow.index]?.original" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVueTable } from "@tanstack/vue-table";
import { useCourseTable } from "@/composables/useCourseTable";
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { CourseRow } from "#components";

const { tableOptions } = useCourseTable();
const table = useVueTable(tableOptions);
const tableRows = computed(() => table.getRowModel().rows);

const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);
const rowVirtualizerOptions = computed(() => {
  return {
    count: tableRows.value.length,
    estimateSize: () => 150,
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

const clamp = (num: number, min: number, max: number) =>
  num < min ? min : num > max ? max : num;

const virtualListRef = ref<HTMLElement | null>(null);
const firstVisibleIndex = ref(0);
const handleScroll = () => {
  for (const child of virtualListRef.value?.children || []) {
    if (child.getBoundingClientRect().bottom > 40) {
      firstVisibleIndex.value = Number(child.getAttribute("data-index")) + 1;
      break;
    }
  }
  if (tableRows.value.length > 0 && firstVisibleIndex.value <= 0) {
    firstVisibleIndex.value = 1;
  }
};

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
watch(
  () => tableRows.value.length,
  () => {
    handleScroll();
  },
);
</script>
