<template>
  <div ref="parentRef" class="course-table-container">
    <table
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
      class="course-table"
    >
      <tbody
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${
            (virtualRows[0]?.start ?? 0) - rowVirtualizer.options.scrollMargin
          }px)`,
        }"
      >
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          :class="row.index % 2 ? 'even-row' : 'odd-row'"
          :data-index="row.index"
          :ref="measureElement"
        >
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <CourseRow :course="cell.row.original" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useVueTable } from "@tanstack/vue-table";
import { useCourseTable } from "@/composables/useCourseTable";
import { CourseRow } from "#components";

const { tableOptions } = useCourseTable();

const table = useVueTable(tableOptions);

import { ref, computed, onMounted } from "vue";
import { useWindowVirtualizer } from "@tanstack/vue-virtual";

const parentRef = ref<HTMLElement | null>(null);

const parentOffsetRef = ref(0);

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
});

const rowVirtualizerOptions = computed(() => {
  return {
    count: table.getRowModel().rows.length,
    estimateSize: () => 45,
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
</script>

<style lang="scss">
.even-row {
  background-color: var(--p-color-surface);
}

.odd-row {
  background-color: var(--p-color-surface-variant);
}
</style>
