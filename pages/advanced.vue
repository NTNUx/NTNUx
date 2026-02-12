<template>
  <div class="container">
    <h1
      :style="{
        margin: '2rem 0',
        textAlign: 'center',
        fontWeight: 900,
        color: 'red',
      }"
    >
      此頁面為工程用進階功能，可能造成瀏覽器負擔，建議返回
      <router-link
        to="/"
        :style="{ textDecoration: 'underline', color: 'blue' }"
        >一般搜尋</router-link
      >
    </h1>
    <div class="button-group">
      <Button
        label="顯示標題列"
        severity="contrast"
        :outlined="!showHeaders"
        @click="showHeaders = !showHeaders"
      ></Button>
      <Button
        label="可排序"
        severity="contrast"
        :outlined="!sortable"
        @click="sortable = !sortable"
      ></Button>
      <Button
        label="顯示篩選選單"
        severity="contrast"
        :outlined="!showFilters"
        @click="showFilters = !showFilters"
      ></Button>
      <Button
        label="條紋列"
        severity="contrast"
        :outlined="!stripedRows"
        @click="stripedRows = !stripedRows"
      ></Button>

      <!-- 清除篩選 -->
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="清空篩選"
        outlined
        @click="clearFilter()"
      ></Button>
      <InputText
        v-model="filters['global'].value"
        type="text"
        placeholder="全域搜尋..."
        :style="{ maxWidth: '30rem' }"
      />
    </div>
    <div class="button-group">
      <!-- 欄位顯示 -->
      <MultiSelect
        :modelValue="selectedColumns"
        :options="columns"
        optionLabel="label"
        @update:modelValue="onToggle"
        display="chip"
        placeholder="顯示欄位"
        :invalid="selectedColumns.length === 0"
        style="max-width: 60vw"
      />
      <Button
        v-if="showedColumns.length !== columns.length"
        type="button"
        icon="pi pi-eye"
        label="顯示全部欄位"
        outlined
        @click="onToggle(columns)"
      ></Button>
      <Button
        label="基本資料欄位"
        type="button"
        icon="pi pi-filter"
        outlined
        @click="onToggle(columns.slice(0, 3))"
      ></Button>
    </div>
    <div class="advanced-grid-container">
      <DataTable
        ref="dt"
        v-model:filters="filters"
        :filterDisplay="showFilters ? 'menu' : 'overlay'"
        filterLocale="zh-TW"
        :globalFilterFields="globalFilterFields"
        :value="rowData"
        :stripedRows="stripedRows"
        resizableColumns
        reorderableColumns
        columnResizeMode="fit"
        :showGridlines="false"
        :showHeaders="showHeaders"
        :scrollable="true"
        scrollHeight="calc(100vh - 10rem)"
        :paginator="true"
        :rows="50"
        :rowsPerPageOptions="[10, 20, 50, 100, 10000]"
        paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        removableSort
        sortMode="multiple"
        stateStorage="session"
      >
        <Column
          v-if="showedColumns.includes('link')"
          header="連結"
          :style="{ width: '8rem' }"
        >
          <template #body="{ data: course }">
            <div>
              <Button
                :label="`前往 ${course.serial_no} 課程頁面`"
                severity="secondary"
                size="small"
                :icon="`pi pi-external-link`"
                :iconPos="`right`"
                :style="{ textTransform: 'none' }"
                :rounded="true"
                :asChild="true"
              >
                <router-link
                  :to="{
                    name: 'course',
                    query: {
                      year: course.acadm_year,
                      term: course.acadm_term,
                      id: course.serial_no,
                    },
                  }"
                  :style="{ color: 'inherit', fontWeight: 'bold' }"
                >
                  {{ course.serial_no }}
                </router-link>
              </Button>
            </div>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('course_code')"
          field="course_code"
          :showFilterMatchModes="false"
          header="科目代碼"
          :sortable="sortable"
          :style="{ width: '8rem' }"
        >
          <template #body="{ data }">
            <div>{{ data?.course_code }}</div>
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="搜尋科目代碼..."
            />
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('serial_no')"
          field="serial_no"
          :showFilterMatchModes="false"
          header="開課序號"
          :sortable="sortable"
          :style="{ width: '8rem' }"
        >
          <template #body="{ data }">
            <div>{{ data?.serial_no }}</div>
          </template>
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="搜尋開課序號..."
            />
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('chn_name')"
          field="chn_name"
          header="課程名稱"
          :sortable="sortable"
          :style="{ width: '20rem' }"
        >
          <!-- 移除 </br> 後的內容 -->
          <template #body="{ data }">
            <div>{{ data?.chn_name?.split("<\/br>")[0] }}</div>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('dept_chiabbr')"
          field="dept_chiabbr"
          :showFilterMatchModes="false"
          header="開課單位"
          :sortable="sortable"
          :style="{ width: '12rem' }"
        >
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="搜尋開課單位..."
            />
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('teacher')"
          field="teacher"
          header="授課教師"
          :sortable="sortable"
          :style="{ width: '12rem' }"
        >
        </Column>
        <Column
          v-if="showedColumns.includes('option_code')"
          filterField="option_code"
          :showFilterMatchModes="false"
          header="必選修"
          :sortable="sortable"
          :style="{ width: '6rem' }"
        >
          <template #body="{ data }">
            <div>
              {{ data?.option_code ? optionMap[data.option_code] : "" }}
            </div>
          </template>
          <template #filter="{ filterModel }">
            <MultiSelect
              v-model="selected_option_codes"
              :options="[
                { name: '必修', code: '必' },
                { name: '選修', code: '選' },
                { name: '通識', code: '通' },
              ]"
              optionLabel="name"
              placeholder="Any"
              @update:model-value="
                (val) => (filterModel.value = Array.from(val, (v) => v.code))
              "
            >
              <template #option="slotProps">
                <div>
                  {{ slotProps.option.name }}
                </div>
              </template>
            </MultiSelect>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('generalCore')"
          filterField="generalCore"
          :showFilterMatchModes="false"
          :showFilterOperators="false"
          :showAddButton="false"
          header="通識類別"
          :sortable="sortable"
          :style="{ width: '12rem' }"
        >
          <template #body="{ data }">
            <div>
              {{
                data?.generalCore
                  ? String(
                      data.generalCore
                        .split("/")
                        .map((code) => generalCoreMap[code])
                    ).replace(/,/g, "/")
                  : ""
              }}
            </div>
          </template>
          <template #filter>
            <MultiSelect
              v-model="selected_general_cores"
              :options="[
                { name: '人文藝術', code: 'A1UG' },
                { name: '社會科學', code: 'A2UG' },
                { name: '自然科學', code: 'A3UG' },
                { name: '邏輯運算', code: 'A4UG' },
                { name: '學院共同課程', code: 'B1UG' },
                { name: '跨域專業探索課程', code: 'B2UG' },
                { name: '大學入門', code: 'B3UG' },
              ]"
              optionLabel="name"
              placeholder="Any"
              @update:model-value="
                (val) => {
                  filters.generalCore.constraints = Array.from(val, (v) => ({
                    value: v.code,
                    matchMode: FilterMatchMode.CONTAINS,
                  }));
                }
              "
            >
            </MultiSelect>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('fullRate')"
          field="fullRate"
          :showFilterMatchModes="false"
          header="額滿率"
          :sortable="sortable"
          dataType="numeric"
          :style="{ width: '8rem' }"
        >
          <template #body="{ data }">
            <div>{{ data?.fullRate?.toFixed(0) || NaN }}%</div>
          </template>
          <template #filter="{ filterModel }">
            <Slider v-model="filterModel.value" range :max="200"></Slider>
            <div
              style="
                display: flex;
                justify-content: space-between;
                padding: 0 0.5rem;
              "
            >
              <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
              <span>{{ filterModel.value ? filterModel.value[1] : 200 }}</span>
            </div>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('counter')"
          field="counter_exceptAuth"
          header="選課人數"
          :sortable="sortable"
          :style="{ width: '8rem' }"
        >
          <template #body="{ data }">
            <div>
              {{ data?.counter_exceptAuth || 0 }} /
              {{ data?.limit_count_h || "無上限" }}
            </div>
          </template>
        </Column>
        <Column
          v-if="showedColumns.includes('comment')"
          field="comment"
          header="備註"
          :style="{ width: '15rem' }"
        >
        </Column>
        <Column
          v-if="showedColumns.includes('restrict')"
          field="restrict"
          header="限制修課條件"
          :style="{ width: '15rem' }"
        >
        </Column>
        <Column
          v-if="showedColumns.includes('data')"
          header="data"
          :style="{ width: '4rem' }"
        >
          <template #body="{ data }">
            <div>{{ data }}</div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

import { useCourses } from "~/composables/useCourses";

import {
  DataTable,
  Column,
  Button,
  InputText,
  MultiSelect,
  Slider,
} from "primevue";

const dt = ref(null);

const route = useRoute();

const { rowData, defaultGlobalFilterFields, initTermData } = useCourses();

const updateMenubar = useState("updateMenubar");

const showHeaders = ref(true);
const sortable = ref(true);
const showFilters = ref(true);
const stripedRows = ref(true);
const filters = ref();

const selected_option_codes = ref([]);
const selected_general_cores = ref([]);

const optionMap = {
  必: "必修",
  選: "選修",
  通: "通識",
};
const generalCoreMap = {
  A1UG: "人文藝術",
  A2UG: "社會科學",
  A3UG: "自然科學",
  A4UG: "邏輯運算",
  B1UG: "學院共同課程",
  B2UG: "跨域專業探索課程",
  B3UG: "大學入門",
  C1UG: "專題探究",
  C2UG: "MOOCs",
};

const globalFilterFields = [
  // ["course_name", "teacher", "serial_no"]
  ...defaultGlobalFilterFields,
  "course_code",
  "comment",
  "restrict",
];

const headers = [
  { label: "開課序號", value: "serial_no" },
  { label: "課程名稱", value: "chn_name" },
  { label: "開課單位", value: "dept_chiabbr" },
  { label: "授課教師", value: "teacher" },
  { label: "科目代碼", value: "course_code" },
  { label: "時間地點", value: "time_inf" },
  { label: "必選修", value: "option_code" },
  { label: "學分數", value: "credit" },
  { label: "通識類別", value: "generalCore" },
  { label: "額滿率", value: "fullRate" },
  { label: "選課人數", value: "counter" },
  { label: "備註", value: "comment" },
  { label: "限制修課條件", value: "restrict" },
];
const exHeaders = [
  ...headers,
  { label: "data", value: "data" },
  { label: "連結", value: "link" },
];
const columns = ref([...exHeaders]);
const selectedColumns = ref([...headers]);
const showedColumns = ref([...headers].map((col) => col.value));

function initializeFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    course_code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    chn_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fullRate: { value: [0, 200], matchMode: FilterMatchMode.BETWEEN },
    counter_exceptAuth: { value: null, matchMode: FilterMatchMode.BETWEEN },
    limit_count_h: { value: null, matchMode: FilterMatchMode.BETWEEN },
    serial_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    dept_chiabbr: { value: null, matchMode: FilterMatchMode.CONTAINS },
    teacher: { value: null, matchMode: FilterMatchMode.CONTAINS },
    option_code: { value: null, matchMode: FilterMatchMode.IN },
    generalCore: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
  };
}

function clearFilter() {
  initializeFilters();
}

initializeFilters();

const onToggle = (val) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
  showedColumns.value = selectedColumns.value.map((col) => col.value);
};

function advancedFilterColumns() {
  rowData.value.forEach((course) => {
    if (course.limit_count_h === "0") {
      course.fullRate = 0;
    } else {
      course.fullRate =
        (Number(course.counter_exceptAuth) / Number(course.limit_count_h)) *
        100;
    }
  });
}

onMounted(async () => {
  await initTermData(route);
  updateMenubar.value();
});

watch(rowData, () => {
  advancedFilterColumns();
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.advanced-grid-container {
  margin-top: 0.5rem;
  width: 100vw;
  padding: 0;

  .p-datatable-table-container,
  .p-datatable-table {
    min-height: 50vh;
  }

  .p-datatable-mask {
    border-radius: 0.5rem;
  }
}

@media screen and (min-width: 768px) {
  .advanced-grid-container {
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: auto;
    margin-right: auto;
    margin-top: 2rem;
  }

  @media (min-width: 992px) {
    .advanced-grid-container {
      width: clamp(992px, 88%, 1632px);
    }
  }
}

.p-datatable-header {
  border-radius: 0.5rem 0.5rem 0 0;
  flex-direction: row;
}

.p-datatable-table-container {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
</style>

<style lang="scss" scoped>
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
