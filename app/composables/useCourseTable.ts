import { computed, watch } from "vue";
import { useState } from "#app";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/vue-table";

import { useCourseFilter } from "./useCourseFilter";

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
  limit_enrollment: number; // 選課人數上限 (lh)
  limit_authorized: number; // 授權碼數量 (a)
  limit_system: number; // 系統各校開放名額 (l)

  time: string[]; // 時間（列表）(tl)
  location: string; // 地點（"/" 分隔）(lc)
  time_location: string[]; // 時間地點 (列表，原始資訊) (ti)
  time_location_list: string[]; // 時間地點（列表）(tll)
  time_location_slash: string; // 時間地點（"/" 分隔）(tls)

  intensive: boolean; // 密集課程（Y/None）(i)
  english_teaching: boolean; // 英文授課（是/None）(et)
  digital_course: boolean; // 數位課程（N/1）(rt)
  general_education: string; // 通識領域（"/" 分隔）(gc)
  credit_program: string[]; // 學分學程（"/" 分隔） (p)
  course_category: string; // 課程類別（通、選、必）(oc)
  restriction: string; // 限修說明 (r)
  gender_restriction: string; // 性別限修（F/M/None）(rg)
  comment: string; // 說明 (c)
}

type TermData = Course[];

interface AllTermsData {
  [term: string]: TermData;
}

export function useCourseTable() {
  const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
  const updateTimeAllTerms = useState<Record<string, string>>(
    "updateTimeAllTerms",
    () => ({}),
  );

  const termsList = useState<string[]>("termsList", () => []);
  const defaultTerm = useState<string>("defaultTerm", () => "");
  const currentTerm = useState<string>("currentTerm", () => "");
  const currentTermData = computed<TermData>(() => {
    return dataAllTerms.value[currentTerm.value] || [];
  });
  const currentTermUpdateTime = computed<string>(() => {
    return updateTimeAllTerms.value[currentTerm.value] || "unknown";
  });
  const fetchingTerms = new Set<string>();

  const columnHelper = createColumnHelper<Course>();
  // 顯示一欄，詳細數據由 couresecell 元件處理，所有欄位需要支援自定義篩選
  const columns = [
    columnHelper.display({
      id: "course",
    }),
    columnHelper.group({
      id: "info_for_filter",
      columns: [
        columnHelper.accessor("id", {}),
        columnHelper.accessor("name", {}),
        columnHelper.accessor("full_name_en", {}),
        columnHelper.accessor("course_code", {}),
        columnHelper.accessor("teacher", {}),
      ],
    }),
  ];
  const columnVisibliity = ref({
    info_for_filter: false,
  });
  const { filters, golbalFilter } = useCourseFilter();

  function getTermsList() {
    try {
      defaultTerm.value = import.meta.env.VITE_DEFAULT_TERM || "";
      termsList.value = import.meta.env.VITE_TERMS
        ? import.meta.env.VITE_TERMS.split(",")
        : [];
    } catch (err) {
      console.error("Failed to read terms from environment:", err);
      defaultTerm.value = "";
      termsList.value = [];
    }
  }

  function getDefaultTerm() {
    getTermsList();
  }

  async function fetchDataForTerm(term: string) {
    if (fetchingTerms.has(term)) {
      console.log(`Already fetching data for term ${term}, skipping...`);
      return;
    }
    fetchingTerms.add(term);
    console.log(`Fetching course data for term ${term}...`);
    const { data, error } = await useFetch<Course[]>(`/data/${term}.json`);
    if (data.value) {
      dataAllTerms.value[term] = data.value
        // .slice(0, 50)// debug, only format the first 50 courses
        .map((rawData: any) => formatCourseData(rawData));
    } else {
      console.error(
        `Failed to fetch course data for term ${term}:`,
        error.value,
      );
      dataAllTerms.value[term] = [];
    }

    const { data: updateData, error: updateError } = await useFetch<{
      last_update: string;
    }>(`/data/${term}/last_update.json`);
    if (updateData.value) {
      updateTimeAllTerms.value[term] = updateData.value.last_update;
    } else {
      console.error(
        `Failed to fetch last update for term ${term}:`,
        updateError.value,
      );
    }
    fetchingTerms.delete(term);
  }

  const tableOptions = {
    data: computed(() => Object.values(currentTermData.value)),
    columns,
    state: {
      get columnFilters() {
        return filters.value;
      },
      get globalFilter() {
        return golbalFilter.value;
      },
      get columnVisibility() {
        return columnVisibliity.value;
      },
    },
    onColumnFiltersChange: (updater: any) => {
      filters.value =
        typeof updater === "function" ? updater(filters.value) : updater;
    },
    onGlobalFilterChange: (updater: any) => {
      golbalFilter.value =
        typeof updater === "function" ? updater(golbalFilter.value) : updater;
    },
    onColumnVisibilityChange: (updater: any) => {
      columnVisibliity.value =
        typeof updater === "function"
          ? updater(columnVisibliity.value)
          : updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: golbalFilterFunction,
  };

  watch(currentTerm, (newTerm) => {
    if (import.meta.client && newTerm && !dataAllTerms.value[newTerm]) {
      fetchDataForTerm(newTerm);
    }
  });

  // default term is set, fetch data for default term
  watch(
    defaultTerm,
    (newDefaultTerm) => {
      if (import.meta.client && newDefaultTerm) {
        fetchDataForTerm(newDefaultTerm);
      }
      if (newDefaultTerm && !currentTerm.value) {
        currentTerm.value = newDefaultTerm;
      }
    },
    { immediate: true },
  );

  return {
    dataAllTerms,
    currentTerm,
    currentTermData,
    currentTermUpdateTime,
    tableOptions,
    getDefaultTerm,
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
    limit_enrollment: rawData.lh ? Number(rawData.lh) : 0,
    limit_authorized: rawData.a ? Number(rawData.a) : 0,
    limit_system: rawData.l ? Number(rawData.l) : 0,

    time: Array.isArray(rawData.tl) ? rawData.tl : [],
    location: rawData.lc || "",
    time_location: Array.isArray(rawData.ti) ? rawData.ti : [],
    time_location_list: Array.isArray(rawData.tll) ? rawData.tll : [],
    time_location_slash: rawData.tls || "",

    intensive: rawData.i === "Y",
    english_teaching: rawData.et === "是",
    digital_course: rawData.rt === "1",
    general_education: rawData.gc || "",
    credit_program: rawData.p ? rawData.p.split("/") : [],
    course_category: rawData.oc || "",
    restriction: rawData.r || "",
    gender_restriction: rawData.rg || "",
    comment: rawData.c || "",
  };
}
