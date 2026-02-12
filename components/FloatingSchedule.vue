<template>
  <div class="schedule-box">
    <DataTable
      :value="slots"
      :showGridlines="true"
      :scrollable="true"
      scrollHeight="flex"
    >
      <Column field="label" header="" :style="{ width: '40px' }" />

      <Column
        v-for="(day, index) in days"
        :key="index"
        :header="day"
        :style="{ width: '100px' }"
      >
        <template #body="slotProps">
          <div>
            <div
              v-for="(info, index) in CoursesByTime[day][slotProps.data.label]"
              :key="index"
              :style="{ background: getCourseColor(info.serial_no) }"
              class="course-cell"
            >
              {{ selectedRows[info.serial_no].course_name }}
              <br />
              {{ selectedRows[info.serial_no].teacher }}
              <br />
              {{ info.loc }}
            </div>
          </div>
        </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column
            footer="其他課程"
            :colspan="2"
            footerStyle="text-align:center"
          />
          <Column :colspan="5">
            <template #footer>
              <div v-for="(course, index) in otherCourses" :key="index">
                {{
                  `● ${course.course_name} ${course.teacher} 【${course.dept_chiabbr}】` +
                  (course.time_loc ? ` ${course.time_loc}` : "")
                }}
              </div>
            </template>
          </Column>
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
  <SpeedDial
    :model="settingItems"
    direction="up"
    :style="{ position: 'absolute', right: '-2.5rem', bottom: '1.5rem' }"
    :buttonProps="{ severity: 'secondary', rounded: true }"
    :tooltipOptions="{ position: 'left' }"
    :hideOnClickOutside="false"
  />

  <Popover
    ref="colorPickerPopover"
    :style="{ position: 'absolute', zIndex: 1000 }"
    :dismissable="false"
  >
    <DataTable
      :value="Object.entries(colorMap)"
      :scrollable="true"
      scrollHeight="flex"
      :style="{ width: '200px', height: '200px' }"
    >
      <Column header="課程代碼" :style="{ width: '100px' }">
        <template #body="slotProps">
          <div>
            {{ slotProps.data[0] }}
          </div>
        </template>
      </Column>
      <Column header="顏色" :style="{ width: '100px' }">
        <template #body="slotProps">
          <ColorPicker
            v-model="colorMap[slotProps.data[0]]"
            :style="{ width: '100%' }"
            format="rgb"
            @change="changeCourseColor(slotProps.data[0], $event.value)"
          />
        </template>
      </Column>
    </DataTable>
  </Popover>
</template>

<script setup>
import ColorPicker from "primevue/colorpicker";
import SpeedDial from "primevue/speeddial";
import Popover from "primevue/popover";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";

const selectedRows = useState("selectedRows", () => ({}));
const otherCourses = ref([]);

const colorPickerPopover = ref(null);

const days = ["一", "二", "三", "四", "五", "六"];
const slots = [
  { label: "0", time: "07:10 ~ 08:00" },
  { label: "1", time: "08:10 ~ 09:00" },
  { label: "2", time: "09:10 ~ 10:00" },
  { label: "3", time: "10:20 ~ 11:10" },
  { label: "4", time: "11:20 ~ 12:10" },
  { label: "5", time: "12:20 ~ 13:10" },
  { label: "6", time: "13:20 ~ 14:10" },
  { label: "7", time: "14:20 ~ 15:10" },
  { label: "8", time: "15:30 ~ 16:20" },
  { label: "9", time: "16:30 ~ 17:20" },
  { label: "10", time: "17:30 ~ 18:20" },
  { label: "A", time: "18:30 ~ 19:25" },
  { label: "B", time: "19:35 ~ 20:25" },
  { label: "C", time: "20:30 ~ 21:20" },
  { label: "D", time: "21:25 ~ 22:15" },
];

function parseTimeSlots(timeObj) {
  const result = [];
  if (typeof timeObj !== "object" || !timeObj) {
    return result;
  }

  for (const seg of Object.keys(timeObj)) {
    const match = seg.match(
      /([一二三四五六])\s*(\d+|A|B|C|D)(?:-(\d+|A|B|C|D))?/
    );
    if (match) {
      const [_, day, start, end] = match;
      const range = getRange(start, end || start);
      for (const period of range) {
        result.push({ day, period, loc: timeObj[seg] });
      }
    }
  }
  return result;
}

function getRange(start, end) {
  const periodOrder = [
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
  ];
  const s = periodOrder.indexOf(start);
  const e = periodOrder.indexOf(end);
  return periodOrder.slice(s, e + 1);
}

const CoursesByTime = ref({});
// {"0001": { (course1 info) }, "0002": { (course2 info) }, ...} ->
// { "一": { "0": [], "1": [] } }, "二": { "0": [], "1": [] } }, ... }
function initializeCoursesByTime() {
  const coursesByTime = {};
  for (const day of days) {
    coursesByTime[day] = {};
    for (const slot of slots) {
      coursesByTime[day][slot.label] = [];
    }
  }
  CoursesByTime.value = coursesByTime;
}

// selectedRows.value = {"0002":{ couse0002 info},"0003":{ course0003 info }}
function updateCoursesByTime() {
  for (const [serial_no, course] of Object.entries(selectedRows.value)) {
    if (!course) continue;
    const timeSlots = parseTimeSlots(course.time_loc);
    if (!timeSlots || timeSlots.length === 0) {
      otherCourses.value.push(course);
    }
    for (const { day, period, loc } of timeSlots) {
      if (day in CoursesByTime.value && period in CoursesByTime.value[day]) {
        CoursesByTime.value[day][period].push({ serial_no, loc });
      }
    }
  }
}

initializeCoursesByTime();
updateCoursesByTime();

const colorMap = ref({});
const palette = [
  // "#FFDD57",
  { r: 255, g: 221, b: 87 },
  // "#87CEEB",
  { r: 135, g: 206, b: 235 },
  // "#FF7F7F",
  { r: 255, g: 127, b: 127 },
  // "#90EE90",
  { r: 144, g: 238, b: 144 },
  // "#DDA0DD",
  { r: 221, g: 160, b: 221 },
  // "#FFA07A",
  { r: 255, g: 160, b: 122 },
  // "#00CED1",
  { r: 0, g: 206, b: 209 },
  // "#F4A460",
  { r: 244, g: 164, b: 96 },
  // "#B0E0E6",
  { r: 176, g: 224, b: 230 },
  // "#FFB6C1",
  { r: 255, g: 182, b: 193 },
];
function autoColor(serial_no) {
  const hash = Array.from(serial_no).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return palette[hash % palette.length];
}

function getCourseColor(serial_no) {
  if (!(serial_no in colorMap.value)) {
    colorMap.value[serial_no] = autoColor(serial_no);
  }
  return `rgba(${colorMap.value[serial_no].r}, ${colorMap.value[serial_no].g}, ${colorMap.value[serial_no].b}, 0.5)`;
}

function changeCourseColor(serial_no, color) {
  colorMap.value[serial_no] = color;
}

const settingItems = ref([
  {
    label: "顏色",
    icon: "pi pi-palette",
    command: (event) => {
      colorPickerPopover.value.toggle(event.originalEvent);
    },
  },
]);
</script>

<style lang="scss">
.schedule-box {
  background: white;
  overflow-y: auto;
  --p-datatable-body-cell-padding: 0.125rem 0.25rem;

  .p-datatable-tbody > tr > td {
    text-align: center;
  }

  .p-datatable-column-header-content {
    justify-content: center;
  }
  .course-cell {
    font-size: 0.8rem;
    text-align: start;
    padding: 0.25rem;
  }
}
</style>
