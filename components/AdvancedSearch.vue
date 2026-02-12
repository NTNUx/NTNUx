<template>
  <div class="advanced-search-box">
    <div class="advanced-search-box-item">
      <Accordion :activeIndex="0">
        <AccordionPanel>
          <AccordionHeader
            :style="{ padding: '0 var(--p-accordion-header-padding) 0 0' }"
          >
            <p>上課時間</p>
          </AccordionHeader>
          <AccordionContent>
            <div class="time-hard-switch-container">
              <label class="time-hard-switch-label" for="time-hard-switch">
                <p style="font-size: small; margin: 0">嚴格節次搜尋</p>
                <span style="font-size: small; color: var(--p-text-500)"
                  >課程需完全為於所選範圍才會顯示</span
                >
              </label>
              <ToggleSwitch
                v-model="isTimeHardFilter"
                inputId="time-hard-switch"
                @change="timeFilterHandler(timeSelectedCells)"
              />
            </div>
            <TimeSelectionTable :timeFilterHandler="timeFilterHandler" />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
    <div class="advanced-search-box-item">
      <div
        v-for="(filterValues, filterKey) in advancedSearchFilters"
        :key="filterKey"
      >
        <p>{{ filterKey }}</p>
        <div
          class="advanced-search-options"
          v-for="(filterValue, index) in filterValues"
          :key="index"
        >
          <Button
            v-if="
              filterValue.grouped_select_list === undefined ||
              filterValue.grouped_select_list.length === 0
            "
            v-for="(isSelected, option) in filterValue.value"
            :key="option"
            :severity="isSelected ? 'primary' : 'secondary'"
            :variant="isSelected ? 'contained' : 'outlined'"
            :label="String(option)"
            @click="
              () => {
                filterValue.value[option] = !isSelected;
                filterValue.onChange?.(filterValue.value);
              }
            "
          ></Button>
          <TreeSelect
            ref="treeSelectRef"
            v-if="filterValue.grouped_select_list"
            v-model="filterValue.value"
            :options="filterValue.grouped_select_list"
            selectionMode="checkbox"
            filter
            filterMode="strict"
            :showClear="true"
            :placeholder="filterValue.label"
            :style="{ width: 'clamp(250px, 90%, 350px)' }"
            @change="
              (value) => {
                filterValue.onChange?.(value);
              }
            "
          >
            <template #empty>
              <span class="p-multiselect-empty-label">{{
                filterValue.emptyLabel
              }}</span>
            </template>
          </TreeSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

import {
  Button,
  ToggleSwitch,
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
  TreeSelect,
} from "primevue";

import { TimeSelectionTable } from "#components";

const filters = useState("filters");
const treeSelectRef = useTemplateRef("treeSelectRef");

// const Advanced Search Display Value
const advancedSearchDisplayValue = useState(
  "advancedSearchDisplayValue",
  () => "點擊進行進階搜尋"
);
const timeSelectedCells = useState("timeSelectedCells", () => new Set());
const deptList = useState("deptList");

const advancedSearchFilters = useState("advancedSearchFilters", () => ({
  上課地點: [
    {
      value: { 和平: false, 公館: false, 其他: false },
      onChange: (value) => {
        locationFilterHandler(value);
      },
    },
  ],
  上課形式: [
    {
      value: { 英文授課: false, 數位課程: false, 密集課程: false },
      onChange: (value) => {
        courseTypeFilterHandler(value);
      },
    },
  ],
  通識領域: [
    {
      value: {
        人文藝術: false,
        社會科學: false,
        自然科學: false,
        邏輯運算: false,
      },
      onChange: (value) => {
        generalFilterHandler();
      },
    },
    {
      value: { 學院共同課程: false, 跨域專業探索課程: false, 大學入門: false },
      onChange: (value) => {
        generalFilterHandler();
      },
    },
  ],
  選課資訊: [
    {
      value: { 未額滿課程: false },
      onChange: (value) => {
        updateFilters({
          notFull: value.未額滿課程
            ? {
                operator: FilterOperator.OR,
                constraints: [
                  {
                    value: true,
                    matchMode: FilterMatchMode.EQUALS,
                  },
                ],
              }
            : {
                operator: FilterOperator.OR,
                constraints: [],
              },
        });
      },
    },
  ],
  學分數: [
    {
      value: { 1: false, 2: false, 3: false, 4: false, ">= 5": false },
      onChange: (value) => {
        creditFilterHandler(value);
      },
    },
  ],
  開課系所: [
    {
      value: {},
      grouped_select_list: deptList.value || [],
      label: "開課系所",
      emptyLabel: "系所們還在路上",
      onChange: (value) => {
        deptFilterHandler(value, deptList.value || []);
      },
    },
  ],
}));

function advancedSearchRebuild() {
  for (const filterKey in advancedSearchFilters.value) {
    const filter = advancedSearchFilters.value[filterKey][0];
    if (filter.onChange) {
      filter.onChange(filter.value);
    }
  }
  timeFilterHandler(timeSelectedCells.value);
}

useState("advancedSearchRebuildFunction", () => {
  return advancedSearchRebuild;
});

const isTimeHardFilter = useState("isTimeHardFilter", () => true);

const timeFilterFormatList = useState("timeFilterFormatList", () => []);
function updateFilters(updatefilter) {
  const updatedFilters = { ...filters.value, ...updatefilter };
  filters.value = updatedFilters;

  setTimeout(() => {
    const filterDescriptions = [];
    for (const [key, filter] of Object.entries(advancedSearchFilters.value)) {
      if (filter[0].grouped_select_list) {
        continue;
      }
      const selectedOptions = Object.entries(filter[0].value)
        .filter(([_, isSelected]) => isSelected)
        .map(([option]) => option);
      if (selectedOptions.length > 0) {
        filterDescriptions.push(`${key}：${selectedOptions.join("、")}`);
      }
    }
    if (timeFilterFormatList.value.length > 0) {
      filterDescriptions.push(
        `上課時間：${timeFilterFormatList.value.join("、")}` +
          (isTimeHardFilter.value ? "" : "（軟篩選）")
      );
    }
    if (
      advancedSearchFilters.value["開課系所"][0].value &&
      Object.keys(advancedSearchFilters.value["開課系所"][0].value).length !== 0
    ) {
      console.log(advancedSearchFilters.value["開課系所"][0].value);
      const treeSelectValue = treeSelectRef.value[0]?.label || "";
      console.log(treeSelectValue);
      if (treeSelectValue !== "開課系所") {
        // filterDescriptions.push(`開課系所：${treeSelectValue}`);
        filterDescriptions.push(`開課系所：...`);
      }
    }

    if (filterDescriptions.length > 0) {
      advancedSearchDisplayValue.value = filterDescriptions
        .join("｜")
        .replace(/,\s*/g, "、");
    } else {
      advancedSearchDisplayValue.value = "點擊進行進階搜尋";
    }
  }, 0);
}

watch(
  () => deptList.value,
  (newDeptList) => {
    if (newDeptList) {
      advancedSearchFilters.value["開課系所"][0].grouped_select_list =
        newDeptList;
    }
  },
  { immediate: true }
);

function locationFilterHandler(location) {
  const hope = location.和平;
  const guan = location.公館;
  const other = location.其他;

  const locationFilter = {
    operator: "",
    constraints: [],
  };
  if (other) {
    locationFilter.operator = FilterOperator.AND;
    if (!hope) {
      locationFilter.constraints.push({
        value: "和平 ",
        matchMode: FilterMatchMode.NOT_CONTAINS,
      });
    }
    if (!guan) {
      locationFilter.constraints.push({
        value: "公館 ",
        matchMode: FilterMatchMode.NOT_CONTAINS,
      });
    }
  } else {
    locationFilter.operator = FilterOperator.OR;
    if (hope) {
      locationFilter.constraints.push({
        value: "和平 ",
        matchMode: FilterMatchMode.CONTAINS,
      });
    }
    if (guan) {
      locationFilter.constraints.push({
        value: "公館 ",
        matchMode: FilterMatchMode.CONTAINS,
      });
    }
  }

  updateFilters({
    time_inf: locationFilter,
  });
}

function courseTypeFilterHandler(courseType) {
  const english = courseType.英文授課;
  const digital = courseType.數位課程;
  const intensive = courseType.密集課程;

  if (english) {
    updateFilters({
      eng_teach: {
        operator: FilterOperator.OR,
        constraints: [{ value: "是", matchMode: FilterMatchMode.EQUALS }],
      },
    });
  } else {
    updateFilters({
      eng_teach: {
        operator: FilterOperator.OR,
        constraints: [],
      },
    });
  }

  if (digital) {
    updateFilters({
      comment: {
        operator: FilterOperator.OR,
        constraints: [
          { value: "◎數位課程", matchMode: FilterMatchMode.CONTAINS },
        ],
      },
    });
  } else {
    updateFilters({
      comment: {
        operator: FilterOperator.OR,
        constraints: [],
      },
    });
  }

  if (intensive) {
    updateFilters({
      time_loc: {
        operator: FilterOperator.OR,
        constraints: [
          { value: "◎密集課程", matchMode: FilterMatchMode.CONTAINS },
        ],
      },
    });
  } else {
    updateFilters({
      time_loc: {
        operator: FilterOperator.OR,
        constraints: [],
      },
    });
  }
}

function generalFilterHandler() {
  const generalFilter = {
    operator: FilterOperator.OR,
    constraints: [],
  };
  const generalMapping = {
    人文藝術: "A1UG",
    社會科學: "A2UG",
    自然科學: "A3UG",
    邏輯運算: "A4UG",
    學院共同課程: "B1UG",
    跨域專業探索課程: "B2UG",
    大學入門: "B3UG",
  };
  for (const [key, value] of Object.entries(generalMapping)) {
    if (
      advancedSearchFilters.value.通識領域[0].value[key] ||
      advancedSearchFilters.value.通識領域[1].value[key]
    ) {
      generalFilter.constraints.push({
        value: generalMapping[key],
        matchMode: FilterMatchMode.CONTAINS,
      });
    }
  }

  updateFilters({
    generalCore: generalFilter,
  });
}

function creditFilterHandler(credits) {
  const creditFilter = {
    operator: FilterOperator.OR,
    constraints: [],
  };
  if (credits["1"]) {
    creditFilter.constraints.push({
      value: "1",
      matchMode: FilterMatchMode.EQUALS,
    });
  }
  if (credits["2"]) {
    creditFilter.constraints.push({
      value: "2",
      matchMode: FilterMatchMode.EQUALS,
    });
  }
  if (credits["3"]) {
    creditFilter.constraints.push({
      value: "3",
      matchMode: FilterMatchMode.EQUALS,
    });
  }
  if (credits["4"]) {
    creditFilter.constraints.push({
      value: "4",
      matchMode: FilterMatchMode.EQUALS,
    });
  }
  if (credits[">= 5"]) {
    creditFilter.constraints.push({
      value: "5",
      matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    });
  }

  updateFilters({
    credit: creditFilter,
  });
}

const days = ["一", "二", "三", "四", "五", "六"];
const slots = [
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
  "X",
  "A",
  "B",
  "C",
  "D",
];
const daySlots = Object.fromEntries(
  days.map((day) => [day, new Set(slots.map((slot) => `${day}${slot}`))])
);
function timeFilterHandler(time) {
  const timeListStrFilter = {
    operator: isTimeHardFilter.value ? FilterOperator.AND : FilterOperator.OR,
    constraints: [],
  };
  timeFilterFormatList.value = [];

  if (time.size === 0) {
    updateFilters({ timeListStr: timeListStrFilter });
    return;
  }

  // "row-col" 格式的時間選擇格子轉換為 "day-slot" 格式
  // 例如 "0-1" 轉換為 "二0"
  const timeFormat = new Set(
    Array.from(time).map((cellId) => {
      const [slotIndex, dayIndex] = cellId.split("-").map(Number);
      return `${days[dayIndex]}${slots[slotIndex]}`;
    })
  );

  if (isTimeHardFilter.value) {
    for (const day of days) {
      const theDaySlots = daySlots[day];
      // if all slots for a day are selected, skip
      if (theDaySlots.intersection(timeFormat).size === slots.length) {
        timeFilterFormatList.value.push(day);
        continue;
      }
      for (const slot of slots) {
        if (!timeFormat.has(`${day}${slot}`)) {
          timeListStrFilter.constraints.push({
            value: `${day}${slot}`,
            matchMode: FilterMatchMode.NOT_CONTAINS,
          });
        } else {
          timeFilterFormatList.value.push(`${day}${slot.replace("X", "10")}`);
        }
      }
    }
    timeListStrFilter.constraints.push({
      value: "◎",
      matchMode: FilterMatchMode.NOT_EQUALS,
    });
  } else {
    for (const day of days) {
      const theDaySlots = daySlots[day];
      if (theDaySlots.intersection(timeFormat).size === slots.length) {
        timeFilterFormatList.value.push(day);
        // remove all slots for this day from timeFormat
        for (const slot of theDaySlots) {
          timeFormat.delete(slot);
        }
      }
    }
    for (const cell of timeFormat) {
      timeListStrFilter.constraints.push({
        value: cell,
        matchMode: FilterMatchMode.CONTAINS,
      });
      timeFilterFormatList.value.push(`${cell.replace("X", "10")}`);
    }
  }

  updateFilters({ timeListStr: timeListStrFilter });
}

function deptFilterHandler(value, deptList) {
  if (!value || Object.keys(value).length === 0) {
    updateFilters({
      dept_code: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    });
    return;
  }
  const deptFilter = Object.entries(value).map(([key, value]) => {
    if (!value.checked) {
      return { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    const keyParts = key.split("-");
    if (keyParts.length === 1) {
      return deptList[key].data;
    }
    if (keyParts.length === 2) {
      return deptList[keyParts[0]].children[keyParts[1]].data;
    }
    {
      return deptList[keyParts[0]].children[keyParts[1]].children[keyParts[2]]
        .data;
    }
  });
  updateFilters({
    dept_code: {
      operator: FilterOperator.OR,
      constraints: deptFilter,
    },
  });
}
</script>

<style scoped lang="scss">
.advanced-search-box {
  padding: 0 1rem 1rem 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
}

.advanced-search-box-item {
  flex: 1 0 50%;
  width: 50%;
}

@media screen and (max-width: 770px) {
  .advanced-search-box {
    flex-direction: column;
    padding: 0;
  }

  .advanced-search-box-item {
    width: unset;
  }
}

.advanced-search-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-hard-switch-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.time-hard-switch-label {
  cursor: pointer;
}

p {
  margin: 0.5rem 0;
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--p-dialog-color) !important;
}
</style>

<style lang="scss">
.p-accordionpanel {
  border-bottom: 0;
}

.p-treeselect-label {
  display: block;
}
</style>
