import { computed, watch } from "vue";
import { useState } from "#app";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  filterFns,
  useVueTable,
} from "@tanstack/vue-table";
import type { TableOptionsWithReactiveData } from "@tanstack/vue-table";

import {
  useCourseFilter,
  globalFilterFunction,
  deptFilterFunction,
  arrayContainsStringFilterFunction,
  exboolFilterFunction,
  ttlFilterFunction,
  locationFilterFunction,
  creditsFilterFunction,
  fullFilterFunction,
} from "./useCourseFilter";

export interface Course {
  year: string; // 學年 (y)
  term: string; // 學期 (t)
  id: string; // 開課序號 (s)
  name: string; // 課程名稱 (n)
  full_name: string; // 原始中文名稱 (cn)
  full_name_en: string; // 英文課程名稱 (en)
  course_code: string; // 課程代碼 (cc)
  course_group: string; // 課程組別 (cg)
  teacher: string; // 授課教師 (te)
  credits: number; // 學分 (cr)
  class_kind: string; // 開課種類（1：甲/2：乙/3：丙/4：丁/7：大碩博/8：碩博/9：大碩）(cl)
  department: string; // 開課單位 (d)
  department_code: string; // 開課單位代號 (dc)
  department_group: string; // 開課單位組別 (dg)
  grade: string; // 開課年級 (fs)

  count_enrolled: number; // 選課人數 (co)
  count_used_authorized: number; // 已使用授權碼數量 (au)
  count_enrolled_without_authorized: number; // 非授權碼選課人數 (ce)
  limit_enrollment: number | undefined; // 選課人數上限 (lh)
  limit_authorized: number | undefined; // 授權碼數量 (a)
  limit_system: number | undefined; // 系統各校開放名額 (l)

  time: string[]; // 時間（列表）(tl)
  location: string; // 地點（"/" 分隔）(lc)
  time_location: string[]; // 時間地點 (列表，原始資訊) (ti)
  time_location_list: { d: string; p: string; l: string }[]; // 時間地點（結構化列表）(tll)
  time_location_slash: string; // 時間地點（"/" 分隔）(tls)

  intensive: boolean; // 密集課程（Y/None）(i)
  english_teaching: boolean; // 英文授課（是/None）(et)
  digital_course: boolean; // 數位課程（N/1）(rt)
  general_education: string; // 通識領域（"/" 分隔）(gc)
  credit_program: string; // 學分學程（"/" 分隔） (p)
  course_category: string; // 課程類別（通、選、必）(oc)
  restriction: string; // 限修說明 (r)
  gender_restriction: string; // 性別限修（F/M/None）(rg)
  comment: string; // 說明 (c)

  description?: string; // 課程描述，從跨域 API 獲取
}

export type TermData = Array<Course>;

export interface AllTermsData {
  [term: string]: TermData;
}

export interface Dense {
  date: string; // 日期，格式為 "YYYYMMDD(X)"
  time_location: string;
}
export interface TermDenseData {
  [course_key: string]: Dense[]; // course_key: `${course_code}-${course_group}`
}
export interface AllTermsDenseData {
  [term: string]: TermDenseData;
}

const table = ref<any>(null);
// change to a number to trigger watch when table data may have changed

export function useCourseTable() {
  const tableWatchVersion = useState<number>("tableWatchVersion", () => 0);
  const defaultTerm = useState<string>(
    "defaultTerm",
    () => (useRuntimeConfig().public.ntnuxDefaultTerm as string) || "",
  );
  const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);

  const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
  const denseDataAllTerms = useState<AllTermsDenseData>(
    "denseDataAllTerms",
    () => ({}),
  );
  const updateTimeAllTerms = useState<Record<string, string>>(
    "updateTimeAllTerms",
    () => ({}),
  );
  const currentTermData = computed<TermData>(() => {
    return dataAllTerms.value[currentTerm.value] || [];
  });
  const currentTermDenseData = computed<TermDenseData>(() => {
    return denseDataAllTerms.value[currentTerm.value] || {};
  });
  const currentTermUpdateTime = computed<string>(() => {
    return updateTimeAllTerms.value[currentTerm.value] || "unknown";
  });

  const { refreshAll } = fetchTermData(currentTerm.value);

  // watch
  watch(currentTerm, async () => {
    console.log(`Current term changed to ${currentTerm.value}`);
    tableWatchVersion.value += 1;
    if (currentTerm.value && !dataAllTerms.value[currentTerm.value]) {
      await fetchTermData(currentTerm.value)
        .refresh()
        .then(() => {
          console.log(
            `Data for term ${currentTerm.value} fetched on term change.`,
          );
          tableWatchVersion.value += 1;
        });
    }
  });

  // build table options
  const columnHelper = createColumnHelper<Course>();
  const columns = [
    columnHelper.display({
      id: "course",
    }),
    columnHelper.group({
      id: "info_for_filter",
      columns: [
        columnHelper.accessor("id", {}),
        columnHelper.accessor("name", {
          filterFn: filterFns.includesString,
        }),
        columnHelper.accessor("full_name_en", {}),
        columnHelper.accessor("course_code", {}),
        columnHelper.accessor("teacher", {}),
        // not in global filter but useful for advanced filter
        columnHelper.accessor("department", {}),
        columnHelper.accessor("department_code", {
          filterFn: deptFilterFunction,
        }),
        columnHelper.accessor("general_education", {
          filterFn: arrayContainsStringFilterFunction,
        }),
        columnHelper.accessor("credit_program", {
          filterFn: arrayContainsStringFilterFunction,
        }),
        // advanced filters
        columnHelper.accessor("location", {
          filterFn: locationFilterFunction,
        }),
        columnHelper.accessor("intensive", {
          filterFn: exboolFilterFunction,
        }),
        columnHelper.accessor("english_teaching", {
          filterFn: exboolFilterFunction,
        }),
        columnHelper.accessor("digital_course", {
          filterFn: exboolFilterFunction,
        }),
        columnHelper.accessor("credits", {
          filterFn: creditsFilterFunction,
        }),
        columnHelper.accessor("count_enrolled_without_authorized", {
          filterFn: fullFilterFunction,
        }),
        // experimental filters
        columnHelper.accessor("full_name", {
          // use for exclusive search
          // filterFn: exboolFilterFunction,
        }),
        columnHelper.accessor("time_location_list", {
          filterFn: ttlFilterFunction,
        }),
      ],
    }),
  ];
  const columnVisibliity = ref({
    info_for_filter: false,
  });
  const { columnFilters, globalFilter } = useCourseFilter();
  const tableOptions: TableOptionsWithReactiveData<Course> = {
    data: computed(() => currentTermData.value),
    columns,
    state: {
      get columnFilters() {
        return columnFilters.value;
      },
      get globalFilter() {
        return globalFilter.value;
      },
      get columnVisibility() {
        return columnVisibliity.value;
      },
    },
    onColumnFiltersChange: (updater: any) => {},
    onGlobalFilterChange: (updater: any) => {
      globalFilter.value =
        typeof updater === "function" ? updater(globalFilter.value) : updater;
    },
    onColumnVisibilityChange: (updater: any) => {
      columnVisibliity.value =
        typeof updater === "function"
          ? updater(columnVisibliity.value)
          : updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: globalFilterFunction,
    filterFns: {
      deptFilterFunction: deptFilterFunction,
      arrayContainsStringFilterFunction: arrayContainsStringFilterFunction,
      exboolFilterFunction: exboolFilterFunction,
      ttlFilterFunction: ttlFilterFunction,
      locationFilterFunction: locationFilterFunction,
      creditsFilterFunction: creditsFilterFunction,
      fullFilterFunction: fullFilterFunction,
    },
  };

  table.value = useVueTable(tableOptions);

  return {
    dataAllTerms,
    currentTerm,
    currentTermData,
    currentTermDenseData,
    currentTermUpdateTime,
    tableOptions,
    table,
    refreshAll,
  };
}

export function prefetchDefaultTermData(lazy: boolean = true) {
  const tableWatchVersion = useState<number>("tableWatchVersion", () => 0);
  const defaultTerm = useState<string>(
    "defaultTerm",
    () => (useRuntimeConfig().public.ntnuxDefaultTerm as string) || "",
  );
  if (!defaultTerm.value) {
    console.warn(
      "No default term specified in runtime config. Skipping prefetch.",
    );
    return;
  }
  const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
  if (!dataAllTerms.value[defaultTerm.value]) {
    fetchTermData(defaultTerm.value, lazy)
      .refresh()
      .then(() => {
        tableWatchVersion.value += 1;
      });
  }
}

export function getTable() {
  if (!table.value) {
    console.warn("Table is not initialized yet. Returning null.");
    return null;
  }
  return table.value;
}

export function fetchTermData(term: string, lazy: boolean = false) {
  if (!term) {
    return {
      refresh: async () => {},
      refreshDenseData: async () => {},
      refreshUpdateTime: async () => {},
      refreshAll: async () => {},
    };
  }
  const tableWatchVersion = useState<number>("tableWatchVersion", () => 0);
  const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
  const denseDataAllTerms = useState<AllTermsData>(
    "denseDataAllTerms",
    () => ({}),
  );
  const updateTimeAllTerms = useState<Record<string, string>>(
    "updateTimeAllTerms",
    () => ({}),
  );

  const { refresh } = useFetch<Course[]>(`/data/${term}/data.json`, {
    server: false, // only fetch on client side
    lazy: lazy, // lazy fetch if specified
    onResponse: ({ response }) => {
      const rawData = response._data;
      if (rawData) {
        const formattedData = rawData.map((item: any) =>
          formatCourseData(item),
        );
        dataAllTerms.value[term] = formattedData;
      }
      tableWatchVersion.value += 1;
    },
  });
  // fetch for dense data
  const { refresh: refreshDenseData } = useLazyFetch<Course[]>(
    `/data/${term}/dense.json`,
    {
      server: false, // only fetch on client side
      onResponse: ({ response }) => {
        const rawData = response._data;
        if (rawData) {
          const formattedData = rawData; // already formatted in backend
          denseDataAllTerms.value[term] = formattedData;
        }
      },
    },
  );
  // lazy fetch for update time
  const { refresh: refreshUpdateTime } = useLazyFetch<{ last_update: string }>(
    `/data/${term}/last_update.json`,
    {
      server: false, // only fetch on client side
      onResponse: ({ response }) => {
        const data = response._data;
        updateTimeAllTerms.value[term] = data?.last_update || "unknown";
      },
    },
  );

  return {
    refresh,
    refreshDenseData,
    refreshUpdateTime,
    refreshAll: async () => {
      await refresh();
      await refreshDenseData();
      await refreshUpdateTime();
      console.log(`Data for term ${term} refreshed.`);
      tableWatchVersion.value += 1;
    },
  };
}

function formatCourseData(rawData: any): Course {
  return {
    year: rawData.y || "", // required
    term: rawData.t || "", // required
    id: rawData.s || "",
    name: rawData.n || "",
    full_name: rawData.cn || "",
    full_name_en: rawData.en || "",
    course_code: rawData.cc || "", // required
    course_group: rawData.cg || "",
    teacher: rawData.te || "",
    credits: rawData.cr ? Number(rawData.cr) : 0,
    class_kind: rawData.cl || "",
    department: rawData.d || "",
    department_code: rawData.dc || "",
    department_group: rawData.dg || "",
    grade: rawData.fs || "",

    count_enrolled: rawData.co ? Number(rawData.co) : 0,
    count_used_authorized: rawData.au ? Number(rawData.au) : 0,
    count_enrolled_without_authorized: rawData.ce ? Number(rawData.ce) : 0,
    limit_enrollment: rawData.lh ? Number(rawData.lh) : undefined,
    limit_authorized: rawData.a ? Number(rawData.a) : undefined,
    limit_system: rawData.l ? Number(rawData.l) : undefined,

    time: Array.isArray(rawData.tl) ? rawData.tl : [],
    location: rawData.lc || "",
    time_location: Array.isArray(rawData.ti) ? rawData.ti : [],
    time_location_list: Array.isArray(rawData.tll) ? rawData.tll : [],
    time_location_slash: rawData.tls || "",

    intensive: rawData.i === "Y",
    english_teaching: rawData.et === "是",
    digital_course: rawData.rt === "1",
    general_education: rawData.gc || "",
    credit_program: rawData.p || "",
    course_category: rawData.oc || "",
    restriction: rawData.r || "",
    gender_restriction: rawData.rg || "",
    comment: rawData.c || "",
  };
}

// course table settings

export interface CourseTableSettings {
  show_code: boolean;
  show_code_id: boolean;
  show_code_course_code: boolean;

  show_info: boolean;
  show_info_department: boolean;
  show_info_teacher: boolean;
  show_info_time: boolean;
  // show_info_intensive: boolean; // unused
  show_info_location: boolean;

  show_info2: boolean;
  show_info2_credits: boolean;
  show_info2_course_category: boolean;
  show_info2_general_education: boolean;
  show_info2_limit_enrollment: boolean;
  show_info2_english_teaching: boolean;
  show_info2_credit_program: boolean;

  show_info3: boolean;
  show_info3_comment: boolean;
  show_info3_restriction: boolean;

  // experimental settings, default to false
  show_others: boolean;
  show_others_full_name_en: boolean;
  show_others_class_kind: boolean;
  show_others_enrolled: boolean;
  show_others_limit_authorized: boolean;
  show_others_count_used_authorized: boolean;
  show_others_limit_system: boolean;
  show_others_gender_restriction: boolean;
  show_others_dev: boolean;
}

export const defaultCourseTableSettingsOpen = {
  show_code: true,
  show_code_id: true,
  show_code_course_code: true,

  show_info: true,
  show_info_department: true,
  show_info_teacher: true,
  show_info_time: true,
  // show_info_intensive: true, // unused
  show_info_location: true,

  show_info2: true,
  show_info2_credits: true,
  show_info2_course_category: true,
  show_info2_general_education: true,
  show_info2_limit_enrollment: true,
  show_info2_english_teaching: true,
  show_info2_credit_program: true,

  show_info3: true,
  show_info3_comment: true,
  show_info3_restriction: true,
};

export const defaultCourseTableSettings: CourseTableSettings = {
  show_code: true,
  show_code_id: true,
  show_code_course_code: true,

  show_info: true,
  show_info_department: true,
  show_info_teacher: true,
  show_info_time: true,
  // show_info_intensive: true, // unused
  show_info_location: true,

  show_info2: true,
  show_info2_credits: true,
  show_info2_course_category: true,
  show_info2_general_education: true,
  show_info2_limit_enrollment: true,
  show_info2_english_teaching: true,
  show_info2_credit_program: true,

  show_info3: true,
  show_info3_comment: true,
  show_info3_restriction: true,

  // experimental settings, default to false
  show_others: false,
  show_others_full_name_en: false,
  show_others_class_kind: false,
  show_others_enrolled: false,
  show_others_limit_authorized: false,
  show_others_count_used_authorized: false,
  show_others_limit_system: false,
  show_others_gender_restriction: false,
  show_others_dev: false,
};

export const courseTableSettingInfo = {
  show_code: {
    label: "顯示課程代碼",
    children: {
      show_code_id: {
        label: "顯示開課序號",
      },
      show_code_course_code: {
        label: "顯示課程代碼（不含組別）",
      },
    },
  },

  show_info: {
    label: "顯示課程資訊",
    children: {
      show_info_department: {
        label: "顯示開課單位",
      },
      show_info_teacher: {
        label: "顯示授課教師",
      },
      show_info_time: {
        label: "顯示時間",
      },
      // show_info_intensive: {
      //   label: "顯示密集課程",
      // },
      show_info_location: {
        label: "顯示地點",
      },
    },
  },

  show_info2: {
    label: "顯示選課資訊",
    children: {
      show_info2_credits: {
        label: "顯示學分",
      },
      show_info2_course_category: {
        label: "顯示課程類別",
      },
      show_info2_general_education: {
        label: "顯示通識領域",
      },
      show_info2_limit_enrollment: {
        label: "顯示選課人數上限",
      },
      show_info2_english_teaching: {
        label: "顯示英文授課",
      },
      show_info2_credit_program: {
        label: "顯示學分學程",
      },
    },
  },

  show_info3: {
    label: "顯示其他資訊",
    children: {
      show_info3_comment: {
        label: "顯示說明",
      },
      show_info3_restriction: {
        label: "顯示限修說明",
      },
    },
  },

  // experimental settings
  show_others: {
    label: "顯示實驗性資訊（開發中）",
    children: {
      show_others_full_name_en: {
        label: "顯示英文課程名稱",
      },
      show_others_class_kind: {
        label: "顯示開課種類",
        description: "需要顯示選課資訊",
      },
      show_others_enrolled: {
        label: "顯示選課人數",
        description: "需要顯示選課資訊及選課人數上限",
      },
      show_others_limit_authorized: {
        label: "顯示授權碼數量",
        description: "需要顯示選課資訊",
      },
      show_others_count_used_authorized: {
        label: "顯示已使用授權碼數量",
        description: "需要顯示選課資訊及授權碼數量",
      },
      show_others_limit_system: {
        label: "顯示系統各校開放名額",
        description: "需要顯示選課資訊",
      },
      show_others_gender_restriction: {
        label: "顯示性別限修",
        description: "需要顯示課程資訊",
      },
      show_others_dev: {
        label: "顯示開發者工具",
      },
    },
  },
};
