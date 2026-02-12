<template>
  <div class="container">
    <CourseSearchBar :isSearchPage="true" :resetPage="resetPage" />
    <div class="grid-container">
      <DataTable
        ref="scrollTableRef"
        :value="rowData"
        :paginator="true"
        :filters="filters"
        :global-filter-fields="
          searchMode.filter_field || defaultGlobalFilterFields
        "
        :showGridlines="false"
        :show-headers="false"
        :scrollable="true"
        scrollHeight="calc(100vh - 22rem)"
        :rows="50"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        :loading="loading"
        contextMenu
        v-model:contextMenuSelection="selectedProduct"
        @rowContextmenu="onRowContextMenu"
        :style="{
          border: '1px solid var(--p-datatable-border-color)',
          borderRadius: '0.5rem',
        }"
        @page="scroll(-Infinity)"
      >
        <template #header>
          <div class="datatable-header">
            <span>課程資訊</span>
            <div class="datatable-header-end">
              <span>最後更新：{{ currentLastUpdate }}</span>
              <!-- <Button
                icon="pi pi-cog"
                label="顯示設定"
                variant="text"
                severity="secondary"
              ></Button> -->
            </div>
          </div>
        </template>

        <template #loading>
          <Skeleton
            width="100%"
            height="100%"
            :shape="'rectangle'"
            :border-radius="'0.5rem'"
          />
        </template>

        <template #empty>
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-2" />
            <span>沒有符合條件的課程</span>
          </div>
        </template>

        <!-- <template #header> </template> -->
        <Column :sortable="false">
          <template #body="{ data }">
            <CourseCell :course="data" />
          </template>
        </Column>

        <!-- Selecte button -->
        <Column
          :headerStyle="{
            width: 'clamp(5rem, 10vw, 10rem)',
            textAlign: 'center',
          }"
          :bodyStyle="{ textAlign: 'center' }"
          :sortable="false"
          :style="{
            width: 'clamp(5rem, 10vw, 10rem)',
            textAlign: 'center',
            paddingRight: '1rem',
          }"
          :header="''"
        >
          <template #body="{ data }">
            <div
              style="
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                justify-content: center;
              "
            >
              <Button
                :icon="
                  checkSelectCode(data.course_code)
                    ? 'pi pi-heart-fill'
                    : 'pi pi-heart'
                "
                :severity="
                  checkSelectCode(data.course_code) ? 'danger' : 'secondary'
                "
                variant="text"
                @click="selectCodeHandler(data.course_code, data.course_name)"
                rounded
              ></Button>
              <Button
                :label="checkSelectedCourse(data.serial_no) ? '取消' : '加入'"
                :severity="
                  checkSelectedCourse(data.serial_no) ? 'warn' : 'secondary'
                "
                @click="selectCourse(data)"
              ></Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <ContextMenu ref="cm" :model="menuModel" @hide="selectedProduct = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";

import { useCourses } from "~/composables/useCourses";
import { useSelectCourse } from "~/composables/useSelectCourse";

import { DataTable, Column, Skeleton, Button, ContextMenu } from "primevue";
import { CourseCell, CourseSearchBar } from "#components";

const router = useRouter();
const route = useRoute();

const {
  terms,
  currentTerm,
  rowData,
  tempDatas,
  loading,
  programSet,
  currentLastUpdate,
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
const deptList = useState("deptList");
const isShowSchedule = useState("isShowSchedule", () => false);
const isShowAdvancedSearch = useState("isShowAdvancedSearch", () => false);
const subFilterRef = useState("subFilterRef", () => null);
const scrollTableRef = useState("scrollTableRef", () => null);
const lastUpdate = useState("lastUpdate", () => ({}));

const advancedSearchDisplayValue = useState(
  "advancedSearchDisplayValue",
  () => "點擊進行進階搜尋"
);
const currentlastUpdate = ref("unknown");

// 搜尋模式與子篩選器
const searchMode = ref("");

const selectedProduct = ref(null);
const cm = ref(null);
const menuModel = ref([
  {
    get label() {
      if (!selectedProduct.value) {
        return "有點錯誤";
      }
      return selectedProduct.value.course_name;
    },
    icon: "pi pi-info-circle",
    command: () => {
      if (selectedProduct.value) {
        router.push({
          name: "course",
          query: {
            year: selectedProduct.value.acadm_year,
            term: selectedProduct.value.acadm_term,
            id: selectedProduct.value.serial_no,
          },
        });
      }
      selectedProduct.value = null;
    },
  },
  {
    get label() {
      return checkSelectedCourse(selectedProduct.value?.serial_no)
        ? "取消選課"
        : "加入選課";
    },
    get icon() {
      return checkSelectedCourse(selectedProduct.value?.serial_no)
        ? "pi pi-minus"
        : "pi pi-plus";
    },
    command: () => {
      if (selectedProduct.value) {
        selectCourse(selectedProduct.value);
      }
      selectedProduct.value = null;
    },
  },
  {
    get label() {
      return checkSelectCode(selectedProduct.value?.course_code)
        ? "取消收藏"
        : "加入收藏";
    },
    get icon() {
      return checkSelectCode(selectedProduct.value?.course_code)
        ? "pi pi-heart"
        : "pi pi-heart-fill";
    },
    command: () => {
      if (selectedProduct.value) {
        selectCodeHandler(
          selectedProduct.value.course_code,
          selectedProduct.value.course_name
        );
      }
      selectedProduct.value = null;
    },
  },
  {
    // label: "選課總人數：",
    get label() {
      if (!selectedProduct.value) {
        return "有點錯誤";
      }
      return `選課總人數：${
        Number(selectedProduct.value.counter_exceptAuth) || "?"
      } / ${Number(selectedProduct.value.limit_count_h) || "?"}`;
    },
    icon: "pi pi-users",
  },
]);

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

function onRowContextMenu(event) {
  cm.value.show(event.originalEvent);
}

function scroll(deltaY) {
  if (
    isShowAdvancedSearch.value ||
    isShowSchedule.value ||
    (subFilterRef.value && subFilterRef.value.overlayVisible)
  ) {
    return 0;
  }

  const scrollable = scrollTableRef.value?.$el.querySelector(
    ".p-datatable-table-container"
  );
  if (scrollable) {
    scrollable.scrollTop = Math.max(
      0,
      Math.min(
        scrollable.scrollTop + deltaY,
        scrollable.scrollHeight - scrollable.clientHeight
      )
    );
    if (
      scrollable.scrollTop <
        scrollable.scrollHeight - scrollable.clientHeight &&
      scrollable.scrollTop > 0
    ) {
      return 1;
    }
  }
  return 0;
}

function resetPage() {
  if (scrollTableRef.value && scrollTableRef.value.d_first !== undefined) {
    scrollTableRef.value.d_first = 0;
  }
}

onMounted(async () => {
  const onWheel = (e) => {
    if (scroll(e.deltaY)) {
      e.preventDefault();
    }
  };

  const onKey = (e) => {
    if (e.key === "Home") {
      scroll(-Infinity);
    }
    if (e.key === "End") {
      scroll(Infinity);
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);

  onBeforeUnmount(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
  });

  await initTermData(route);
  updateMenubar.value();

  if (!selectedCourses.value[currentTerm.value]) {
    selectedCourses.value[currentTerm.value] = {};
  }
  selectedRows.value = selectedCourses.value[currentTerm.value];
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-container {
  margin-top: 0.5rem;
  width: 100vw;
  padding: 0;
  --p-datatable-body-cell-padding: 0.75rem 0;

  .p-datatable-table-container,
  .p-datatable-table {
    min-height: 50vh;
  }

  .p-datatable-mask {
    border-radius: 0.5rem;
  }
}

@media screen and (min-width: 768px) {
  .grid-container {
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: auto;
    margin-right: auto;
    margin-top: 2rem;
  }

  @media (min-width: 992px) {
    .grid-container {
      width: clamp(992px, 88%, 1632px);
    }
  }
}

.p-datatable-header {
  border-radius: 0.5rem 0.5rem 0 0;
}

.p-datatable-table-container {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
</style>

<style lang="scss" scoped>
.datatable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: var(--p-text-secondary-color);
}

@media screen and (max-width: 350px) {
  .datatable-header-end {
    display: grid;
    justify-items: end;
  }
}
</style>
