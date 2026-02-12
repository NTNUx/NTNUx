<template>
  <div class="tabs-container">
    <Tabs v-model:value="searchMode" scrollable>
      <TabList :class="isSearchPage ? '' : 'tab-disabled'">
        <Tab
          v-for="tab in Object.values(searchModeList)"
          as="a"
          :key="tab.value"
          :value="tab.value"
          :class="isSearchPage && tab.label ? '' : 'tab-disabled'"
          :href="tab.route || null"
          style="text-decoration: none"
          @click.prevent="
            () => {
              if (!isSearchPage || searchMode != tab.value) {
                searchMode = tab.value;
              }
              if (searchModeList[searchMode]) {
                searchModeList[searchMode].command?.();
              }
              if (resetPage) {
                resetPage();
              }
              if (isSearchPage) {
                routerPush({
                  m: searchMode,
                });
              } else {
                routerReplace({
                  path: '/',
                  m: searchMode,
                  s: filters['global'].value || undefined,
                });
              }
            }
          "
        >
          {{
            searchMode == tab.value ? tab.activeLabel || tab.label : tab.label
          }}
        </Tab>
      </TabList>
    </Tabs>
  </div>

  <div class="search-container search-bar">
    <FloatLabel
      variant="in"
      :class="[
        'search-input',
        subFilterValue.select_list || subFilterValue.grouped_select_list
          ? 'multi-search-input-main-filter'
          : 'single-search-input',
      ]"
      @click="isShowAdvancedSearch ? openAdvancedSearch() : null"
    >
      <IconField>
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText
          v-if="isSearchPage && searchMode != 'advanced'"
          id="globalFilter"
          v-model="filters['global'].value"
          :autocapitalize="false"
          size="large"
          :style="{ width: '100%' }"
          @blur="routerReplace({ s: filters['global'].value })"
          @keyup.enter="routerReplace({ s: filters['global'].value })"
        />
        <InputText
          v-else-if="isSearchPage"
          id="globalFilter"
          value=""
          readonly
          :autocapitalize="false"
          size="large"
          :style="{ width: '100%', cursor: 'pointer' }"
          @click="openAdvancedSearch"
        />
        <InputText
          v-else
          id="globalFilter"
          v-model="filters['global'].value"
          :autocapitalize="false"
          size="large"
          :style="{ width: '100%' }"
          @blur="quickSearch()"
          @keyup.enter="quickSearch()"
        />
      </IconField>
      <label
        class="global-filter-label"
        for="globalFilter"
        v-if="searchMode != 'advanced'"
        >課程名稱/教師/開課序號</label
      >
      <label
        class="global-filter-label advanced-search-label"
        for="globalFilter"
        v-else
        >{{ advancedSearchDisplayValue || "點擊進行進階搜尋" }}</label
      >
    </FloatLabel>
    <div
      v-if="isSearchPage && subFilterValue.select_list"
      class="search-input multi-search-input-sub-filter"
    >
      <MultiSelect
        ref="subFilterRef"
        id="sub-filter"
        v-model="subFilterValue.value"
        :options="subFilterValue.select_list"
        :optionLabel="'label'"
        :optionValue="'value'"
        :showClear="true"
        :showToggleAll="false"
        :filter="true"
        :placeholder="subFilterValue.label"
        display="chip"
        :style="{ width: '100%' }"
        @change="
          (e) => {
            filters[subFilterValue.filter_field].constraints = e.value || [
              { value: null, matchMode: FilterMatchMode.CONTAINS },
            ];
          }
        "
      />
    </div>
    <div
      v-if="isSearchPage && subFilterValue.grouped_select_list"
      class="search-input multi-search-input-sub-filter"
    >
      <TreeSelect
        ref="subFilterRef"
        id="sub-filter-grouped"
        v-model="subFilterValue.value"
        :options="subFilterValue.grouped_select_list"
        selectionMode="checkbox"
        filter
        filterMode="strict"
        :showClear="true"
        :placeholder="subFilterValue.label"
        :style="{ width: '100%' }"
        @change="selectDeptToFilter()"
      >
        <template #empty>
          <span class="p-multiselect-empty-label">系所們還在路上</span>
        </template>
      </TreeSelect>
    </div>
  </div>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

import { useCourses } from "~/composables/useCourses";
import { useSelectCourse } from "~/composables/useSelectCourse";

import {
  InputText,
  MultiSelect,
  FloatLabel,
  IconField,
  InputIcon,
  Tabs,
  Tab,
  TabList,
  TreeSelect,
} from "primevue";

defineProps({
  isSearchPage: {
    type: Boolean,
    default: false,
  },
  resetPage: {
    type: Function,
    default: null,
  },
});

const router = useRouter();
const route = useRoute();

const {
  terms,
  currentTerm,
  rowData,
  tempDatas,
  loading,
  programSet,
  reloadCurrentTerm,
  defaultGlobalFilterFields,
  initTermData,
  courseFormatter,
} = useCourses();

const {
  selectedCourses,
  selectedRows,
  selectCode,
  toast,
  windowWidth,
  selectCourse,
  selectCourseWithTerm,
  checkSelectedCourse,
  selectCodeHandler,
  checkSelectCode,
} = useSelectCourse();

const updateMenubar = useState("updateMenubar");
const deptList = useState("deptList", () => []);
const isShowSchedule = useState("isShowSchedule", () => false);
const isShowAdvancedSearch = useState("isShowAdvancedSearch", () => false);
const subFilterRef = useState("subFilterRef", () => null);
const scrollTableRef = useState("scrollTableRef", () => null);

const filters = useState("filters", () => ({
  global: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  ...Object.fromEntries(
    [
      "option_code",
      "course_name",
      "chn_name",
      "dept_chiabbr",
      "eng_teach",
      "generalCore",
      "dept_code",
      "time_inf",
      "time_loc",
      "timeListStr",
      "comment",
      "credit",
      "programs",
    ].map((key) => [
      key,
      {
        operator: FilterOperator.OR,
        constraints: [],
      },
    ])
  ),
}));

const advancedSearchDisplayValue = useState(
  "advancedSearchDisplayValue",
  () => "點擊進行進階搜尋"
);

const advancedSearchRebuild = useState("advancedSearchRebuildFunction");

// 搜尋模式與子篩選器
const searchMode = ref("");
const subFilterValue = ref({
  value: null,
  filter_field: null,
  select_list: null,
  grouped_select_list: null,
  label: null,
});
const searchModeList = ref({
  quick: {
    label: "快速搜尋",
    value: "quick",
    route: "/?m=quick",
    command: () => initSearchMode({}),
  },
  dept: {
    label: "系所",
    activeLabel: "開課系所",
    value: "dept",
    route: "/?m=dept",
    command: () =>
      initSearchMode(
        {
          dept_chiabbr: {
            operator: FilterOperator.OR,
            constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
          },
        },
        {
          label: "選擇開課單位",
          grouped_select_list: deptList.value || {},
          filter_field: "dept_code",
        }
      ),
  },
  advanced: {
    label: "進階搜尋",
    value: "advanced",
    route: "/?m=advanced",
    command: () => {
      isShowAdvancedSearch.value = true;
      initSearchMode({});
      filters.value["global"].value = null;
      if (advancedSearchRebuild && advancedSearchRebuild.value) {
        advancedSearchRebuild.value();
      }
    },
  },
  general: {
    label: "通識",
    value: "general",
    route: "/?m=general",
    command: () =>
      initSearchMode(
        {
          option_code: {
            operator: FilterOperator.OR,
            constraints: [{ value: "通", matchMode: FilterMatchMode.EQUALS }],
          },
        },
        {
          label: "選擇通識領域",
          select_list: Object.entries({
            人文藝術: "A1UG",
            社會科學: "A2UG",
            自然科學: "A3UG",
            邏輯運算: "A4UG",
            學院共同課程: "B1UG",
            跨域專業探索課程: "B2UG",
            大學入門: "B3UG",
            專題探究: "C1UG",
            MOOCs: "C2UG",
          }).map(([label, value]) => ({
            label,
            value: { value, matchMode: FilterMatchMode.CONTAINS },
          })),
          filter_field: "generalCore",
        }
      ),
  },
  physical: {
    label: "體育",
    activeLabel: "普通體育",
    value: "physical",
    route: "/?m=physical",
    command: () =>
      initSearchMode({
        dept_chiabbr: {
          operator: FilterOperator.OR,
          constraints: [{ value: "體育", matchMode: FilterMatchMode.CONTAINS }],
        },
      }),
  },
  defense: {
    label: "國防",
    activeLabel: "全民國防教育",
    value: "defense",
    route: "/?m=defense",
    command: () =>
      initSearchMode({
        chn_name: {
          operator: FilterOperator.OR,
          constraints: [
            { value: "全民國防", matchMode: FilterMatchMode.CONTAINS },
          ],
        },
      }),
  },
  interschool: {
    label: "校際",
    activeLabel: "臺大系統校際課程",
    value: "interschool",
    route: "/?m=interschool",
    command: () =>
      initSearchMode(
        {
          dept_chiabbr: {
            operator: FilterOperator.OR,
            constraints: [
              { value: "校際", matchMode: FilterMatchMode.CONTAINS },
            ],
          },
        },
        {
          label: "選擇開課學校",
          select_list: Object.entries({
            國立臺灣大學: "AA",
            國立臺灣科技大學: "AB",
          }).map(([label, value]) => ({
            label,
            value: { value, matchMode: FilterMatchMode.ENDS_WITH },
          })),
          filter_field: "dept_code",
        }
      ),
  },
  program: {
    label: "學分學程",
    value: "program",
    route: "/?m=program",
    command: () =>
      initSearchMode(
        {
          chn_name: {
            operator: FilterOperator.OR,
            constraints: [
              { value: "學分學程", matchMode: FilterMatchMode.CONTAINS },
            ],
          },
        },
        {
          label: "選擇學分學程",
          select_list: [...programSet.value].sort().map((program) => ({
            label: program,
            value: {
              value: program,
              matchMode: FilterMatchMode.CONTAINS,
            },
          })),
          filter_field: "programs",
        }
      ),
  },
  english: {
    label: "英文三",
    value: "english",
    route: "/?m=english",
    command: () =>
      initSearchMode({
        course_name: {
          operator: FilterOperator.OR,
          constraints: [
            { value: "英文（三）", matchMode: FilterMatchMode.CONTAINS },
          ],
        },
      }),
  },
  emi: {
    label: "英文授課",
    value: "emi",
    route: "/?m=emi",
    command: () =>
      initSearchMode({
        eng_teach: {
          operator: FilterOperator.OR,
          constraints: [{ value: "是", matchMode: FilterMatchMode.EQUALS }],
        },
      }),
  },
  "": {
    label: "",
    value: "quick",
    route: "/?m=quick",
    command: () => initSearchMode({}),
  },
});

function initSearchMode(updateValue, subFilter = null) {
  useSeoMeta({
    title:
      searchModeList.value[searchMode.value]?.activeLabel ||
      searchModeList.value[searchMode.value]?.label ||
      "",
    description: "更適合師大人的課程查詢系統，更快、更強、行動裝置友好。",
  });

  for (const key in filters.value) {
    if (key === "global") continue;
    if (key in updateValue) {
      filters.value[key] = updateValue[key];
    } else {
      filters.value[key].constraints &&= [];
    }
  }

  if (subFilter) {
    subFilterValue.value = {
      ...subFilterValue.value,
      value: null,
      filter_field: subFilter.filter_field,
      select_list: subFilter.select_list || null,
      grouped_select_list: subFilter.grouped_select_list || null,
      label: subFilter.label,
    };
  } else {
    subFilterValue.value.select_list = null;
    subFilterValue.value.grouped_select_list = null;
  }
}

function openAdvancedSearch() {
  isShowAdvancedSearch.value = true;
}

function selectDeptToFilter() {
  const dept = subFilterValue.value.value;
  if (!dept || Object.keys(dept).length === 0) {
    filters.value[subFilterValue.value.filter_field].constraints = [
      { value: null, matchMode: FilterMatchMode.CONTAINS },
    ];
    return;
  }
  const deptList = subFilterValue.value.grouped_select_list;
  filters.value[subFilterValue.value.filter_field].constraints = Object.entries(
    dept
  ).map(([key, value]) => {
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
}

function quickSearch() {
  if (filters.value.global.value) {
    const routerLoading = useState("routerLoading", () => false);
    routerLoading.value = true;
    router.push(`/?s=${filters.value.global.value}`);
    setTimeout(() => {
      routerLoading.value = false;
    }, 1000);
  }
}

function routerPush({ path = null, m = null, s = null }) {
  if (!path) {
    path = route.path;
  }
  if (!m) {
    m = searchMode.value || undefined;
  }
  if (!s) {
    s = filters.value?.global?.value || undefined;
  }
  router.push({
    path,
    query: {
      ...route.query,
      m,
      s,
    },
  });
}

function routerReplace({ path = null, m = null, s = null }) {
  if (!path) {
    path = route.path;
  }
  if (!m) {
    m = searchMode.value || undefined;
  }
  if (!s) {
    s = filters.value?.global?.value || undefined;
  }
  router.replace({
    path,
    query: {
      ...route.query,
      m,
      s,
    },
  });
}

onMounted(() => {
  searchMode.value = route.query.m || "quick";
  if (searchModeList.value[searchMode.value]) {
    searchModeList.value[searchMode.value]?.command();
  } else {
    searchMode.value = "quick";
  }

  if (route.query.s) {
    filters.value.global.value = route.query.s;
  } else {
    filters.value.global.value = null;
  }
});

// watch for route changes to update search mode and filters
watch(
  () => [route.query, deptList.value],
  ([newQuery, newDeptList]) => {
    if (newQuery.m) {
      // check if the search mode exists in the list
      if (searchModeList.value[newQuery.m]) {
        searchMode.value = newQuery.m;
        searchModeList.value[newQuery.m]?.command();
      } else {
        searchMode.value = "quick";
      }
    }
    if (newQuery.s) {
      filters.value.global.value = newQuery.s;
    } else {
      filters.value.global.value = null;
    }

    if (searchMode.value === "dept" && newDeptList) {
      subFilterValue.value.grouped_select_list = newDeptList;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.tabs-container {
  margin: 0.5rem auto 1rem;
  width: clamp(0px, 100%, 760px);

  @media screen and (min-width: 760px) {
    .p-tablist-tab-list {
      justify-content: center;
    }
  }

  .tab-disabled {
    border-color: var(--p-tabs-tab-border-color);
    color: var(--p-tabs-tab-color);

    .p-tablist-active-bar {
      display: none;
    }
  }
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 1rem;
}

.search-bar {
  .p-component {
    height: 48px;
  }
  .p-multiselect-chip {
    height: auto;
  }
  .p-multiselect-label-container,
  .p-treeselect-label-container {
    align-content: center;
  }
  .p-treeselect-label {
    display: block;
  }

  width: 100%;
  max-width: 48rem;

  --p-floatlabel-focus-color: var(--p-floatlabel-color);
}

.search-input {
  width: 100%;
  --p-inputtext-border-radius: 25px;
  --p-multiselect-border-radius: 25px;
}

.multi-search-input-main-filter {
  .p-component {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.multi-search-input-sub-filter {
  .p-multiselect,
  .p-treeselect {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .p-treeselect,
  .p-treeselect-dropdown {
    border-end-end-radius: 25px;
    border-start-end-radius: 25px;
  }
}

@media screen and (min-width: 768px) {
  .multi-search-input-main-filter,
  .multi-search-input-sub-filter {
    width: 50%;
  }
  .single-search-input {
    width: 100%;
  }
}

@media screen and (max-width: 670px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  .multi-search-input-main-filter {
    .p-component {
      border-radius: 1rem 1rem 0 0;
    }
  }
  .multi-search-input-sub-filter {
    .p-multiselect,
    .p-treeselect {
      border-left: 1px solid var(--p-multiselect-border-color);
      border-radius: 0 0 1rem 1rem;
    }
  }
}

.advanced-search-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;

  --p-floatlabel-in-active-top: 50% !important;
  --p-floatlabel-over-active-top: 0 !important;
  font-size: inherit !important;
  transform: translateY(-50%) !important;
}
</style>
