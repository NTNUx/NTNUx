<template>
  <div class="select-none touch-manipulation">
    <table class="border-collapse">
      <thead>
        <tr>
          <th
            v-for="(col, col_index) in cols"
            :key="`header-${col_index}`"
            class="w-15 h-7.5 text-center border-0 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
            @click="handleColumnClick(col_index)"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
    </table>

    <div class="inline-block overflow-hidden rounded-lg border border-gray-300">
      <table class="border-collapse">
        <tbody
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @touchend="handleMouseUp"
          class="divide-y divide-gray-300"
        >
          <tr
            v-for="(row, row_index) in rows"
            :key="`row-${row_index}`"
            class="divide-x divide-gray-300"
          >
            <td
              v-for="(_, col_index) in cols"
              :key="`${col_index}-${row_index}`"
              :data-id="`${col_index}-${row_index}`"
              class="w-15 h-7.5 text-center cursor-cell transition-colors duration-200 text-dimmed"
              :class="
                selectedCells?.has(`${col_index}-${row_index}`)
                  ? 'bg-elevated'
                  : ''
              "
              @mousedown="handleMouseDown(`${col_index}-${row_index}`)"
              @mouseover="handleMouseOver(`${col_index}-${row_index}`)"
              @touchstart.prevent="
                handleTouchStart($event, `${col_index}-${row_index}`)
              "
              @touchmove.prevent="handleTouchMove"
            >
              {{ row }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { periods as rows, days as cols } from "@/composables/useConstants";

const emit = defineEmits<{
  change: [];
}>();

const selectedCells = useState<Set<string> | undefined>(
  "timeSelectedCells",
  () => new Set(),
);

const isSelecting = ref<boolean>(false);
const startCell = ref<string | null>(null);
const isDeselecting = ref<boolean>(false);

function parseCellId(id: string): { row: number; col: number } {
  const [col, row] = id.split("-").map(Number);
  return { row: row || 0, col: col || 0 };
}

function generateRange(from: string, to: string): string[] {
  const start = parseCellId(from);
  const end = parseCellId(to);

  const cells: string[] = [];
  for (
    let i = Math.min(start.row, end.row);
    i <= Math.max(start.row, end.row);
    i++
  ) {
    for (
      let j = Math.min(start.col, end.col);
      j <= Math.max(start.col, end.col);
      j++
    ) {
      cells.push(`${j}-${i}`);
    }
  }
  return cells;
}

function toggleCells(cells: string[]) {
  if (selectedCells.value === undefined) {
    selectedCells.value = new Set(cells);
  }
  for (const cell of cells) {
    if (isDeselecting.value) {
      selectedCells.value.delete(cell);
    } else {
      selectedCells.value.add(cell);
    }
  }
}

const previewSet = new Set<string>();

function previewSelection(cells: string[]) {
  previewSet.clear();
  for (const cell of cells) {
    previewSet.add(cell);
  }
  toggleCells(cells);
}

function handleMouseDown(id: string) {
  isSelecting.value = true;
  startCell.value = id;
  isDeselecting.value = selectedCells.value?.has(id) || false;
  toggleCells(generateRange(id, id));
}

function handleMouseOver(id: string) {
  if (isSelecting.value && startCell.value) {
    const cells = generateRange(startCell.value, id);
    previewSelection(cells);
  }
}

function handleMouseUp() {
  isSelecting.value = false;
  startCell.value = null;
  isDeselecting.value = false;
  previewSet.clear();

  emit("change");
}

const lastTouchedId = ref<string | undefined>("");

function handleTouchStart(event: TouchEvent, id: string) {
  handleMouseDown(id);
  lastTouchedId.value = id;
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  const element = document.elementFromPoint(
    touch?.clientX || 0,
    touch?.clientY || 0,
  ) as HTMLElement | null;

  if (!element) return;

  const id = element.dataset.id;
  if (id && id !== lastTouchedId.value) {
    handleMouseOver(id);
    lastTouchedId.value = id;
  }
}

function handleColumnClick(colIndex: number) {
  const cells = rows.map((_, rowIndex) => `${colIndex}-${rowIndex}`);
  isDeselecting.value =
    cells.every((cell) => selectedCells.value?.has(cell)) || false;
  toggleCells(cells);

  emit("change");
}
</script>
