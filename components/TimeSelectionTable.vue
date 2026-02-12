<template>
  <div class="excel-grid">
    <table>
      <thead>
        <tr>
          <th
            v-for="(col, col_index) in cols"
            :key="`header-${col_index}`"
            @click="handleColumnClick(col_index)"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
    </table>
    <div class="tbody-wrapper">
      <table>
        <tbody @mouseup="handleMouseUp" @mouseleave="handleMouseUp" @touchend="handleMouseUp">
          <tr v-for="(row, row_index) in rows" :key="`row-${row_index}`">
            <td
              v-for="(_, col_index) in cols"
              :key="`${row_index}-${col_index}`"
              :data-id="`${row_index}-${col_index}`"
              :class="{
                selected: selectedCells.has(`${row_index}-${col_index}`),
                'td-l': col_index === 0,
                'td-r': col_index === cols.length - 1,
                'td-t': row_index === 0,
                'td-b': row_index === rows.length - 1,
              }"
              @mousedown="handleMouseDown(`${row_index}-${col_index}`)"
              @mouseover="handleMouseOver(`${row_index}-${col_index}`)"
              @touchstart.prevent="
                handleTouchStart($event, `${row_index}-${col_index}`)
              "
              @touchmove.prevent="handleTouchMove($event)"
            >
              {{ row }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  timeFilterHandler: {
    type: Function,
    required: true,
  },
});

const rows = ref([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "A",
  "B",
  "C",
  "D",
]);
const cols = ref(["一", "二", "三", "四", "五", "六"]);

const selectedCells = useState("timeSelectedCells", () => new Set());
const isSelecting = ref(false);
const startCell = ref(null);
const isDeselecting = ref(false);

function parseCellId(id) {
  const [row, col] = id.split("-").map(Number);
  return { row, col };
}

function generateRange(from, to) {
  const start = parseCellId(from);
  const end = parseCellId(to);

  const cells = [];
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
      cells.push(`${i}-${j}`);
    }
  }
  return cells;
}

function handleMouseDown(id) {
  isSelecting.value = true;
  startCell.value = id;
  isDeselecting.value = selectedCells.value.has(id); // 若起點已選取 → 取消選取模式
  toggleCells(generateRange(id, id)); // 即使不拖曳也立即處理起點
}

function handleMouseOver(id) {
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

  props.timeFilterHandler(selectedCells.value);
}

// 追蹤觸控位置
let lastTouchedId = null;

function handleTouchStart(event, id) {
  handleMouseDown(id); // 重用邏輯
  lastTouchedId = id;
}

function handleTouchMove(event) {
  const touch = event.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!element) return;

  const id = element?.dataset?.id;
  if (id && id !== lastTouchedId) {
    handleMouseOver(id); // 重用邏輯
    lastTouchedId = id;
  }
}

function handleColumnClick(colIndex) {
  const cells = rows.value.map((row, rowIndex) => `${rowIndex}-${colIndex}`);
  isDeselecting.value = cells.every((cell) => selectedCells.value.has(cell));
  toggleCells(cells);

  props.timeFilterHandler(selectedCells.value);
}

// --- 處理選取預覽 ---
const previewSet = new Set();
function previewSelection(cells) {
  previewSet.clear();
  for (const cell of cells) {
    previewSet.add(cell);
  }

  // 當滑鼠移動時，立刻應用變更（非預覽）
  toggleCells(cells);
}

function toggleCells(cells) {
  for (const cell of cells) {
    if (isDeselecting.value) {
      selectedCells.value.delete(cell);
    } else {
      selectedCells.value.add(cell);
    }
  }
}
</script>

<style scoped>
.excel-grid {
  user-select: none;
}

table {
  border-collapse: collapse;
}

th {
  width: 60px;
  height: 30px;
  text-align: center;
  border: 0;
  color: var(--p-surface-500);
  cursor: pointer;
}
.tbody-wrapper {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #ccc;
  display: inline-block;
}

td {
  width: 60px;
  height: 30px;
  text-align: center;
  border: 1px solid var(--p-surface-300);
  cursor: cell;
  transition: background-color 0.2s;
  color: var(--p-surface-500);
}

.td-l {
  border-left: 0;
}

.td-r {
  border-right: 0;
}

.td-t {
  border-top: 0;
}

.td-b {
  border-bottom: 0;
}

td.selected {
  background-color: var(--p-surface-300);
}
</style>
