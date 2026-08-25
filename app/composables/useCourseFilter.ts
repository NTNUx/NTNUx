import type { ColumnFiltersState, Row } from "@tanstack/vue-table";
import { days, periods } from "@/composables/useConstants";

export function useCourseFilter() {
  const filters = useState<Record<string, any>>(
    "courseTableFilters",
    () => ({}),
  );
  const columnFilters = computed<ColumnFiltersState>(() => {
    return Object.entries(filters.value).map(([id, value]) => ({
      id,
      value,
    }));
  });
  const globalFilter = useState<string>("courseTableGlobalFilter", () => "");
  return {
    filters,
    columnFilters,
    globalFilter,
  };
}

export function updateGlobalFilterByParameter(parameter: string) {
  const globalFilter = useState<string>("courseTableGlobalFilter", () => "");
  // split by '+', join by space, and set to globalFilter
  globalFilter.value = parameter.split("+").join(" ");
}

export function updateGlobalFilterByInput(input: string) {
  const globalFilter = useState<string>("courseTableGlobalFilter", () => "");
  globalFilter.value = input;
}

export function getGlobalFilterInput() {
  const globalFilter = useState<string>("courseTableGlobalFilter", () => "");
  return globalFilter.value;
}

export function globalFilterFunction(
  row: any,
  columnId: string,
  filterValue: string,
) {
  // split by space, if any of the words is included in "some" of the columns, return true
  // some: id, name, teacher, full_name_en, course_code
  const words = filterValue.toLowerCase().split(" ");
  return words.some((word) => {
    if (word.startsWith("$")) {
      const [col, s] = word.slice(1)?.split(":") || [];
      if (col && s) {
        return row.original[col]?.toLowerCase().includes(s);
      }
    }
    return (
      row.original.id.toLowerCase().includes(word) ||
      row.original.name.toLowerCase().includes(word) ||
      row.original.teacher.toLowerCase().includes(word) ||
      row.original.full_name_en.toLowerCase().includes(word) ||
      row.original.course_code.toLowerCase().includes(word)
    );
  });
}

const deptCodeToClassMap: Record<string, string[]> = {
  U: ["7", "9"],
  M: ["7", "8", "9"],
  D: ["7", "8"],
} as const;
export function deptFilterFunction(
  row: any,
  columnId: string,
  filterValue: string[],
) {
  const fuzzyClassKind = useState<boolean>(
    "courseTableFuzzyClassKind",
    () => true,
  );
  // if filterValue is empty, return true
  if (filterValue.length === 0) {
    return true;
  }
  // if row.original.dept is in filterValue.value, return true
  return filterValue.some((item) => {
    return (
      item === row.original.department_code ||
      (fuzzyClassKind.value &&
        item.length > 2 &&
        item[0] !== "Z" &&
        row.original.department_code.length > 2 &&
        item.slice(-2) === row.original.department_code.slice(-2) &&
        (deptCodeToClassMap[item.slice(-3, -2)] || []).includes(
          row.original.class_kind,
        ))
    );
  });
}

// filter: array of string, row value: string with "/" separator
// return true if any of the filter values is included in the row value
// if 'all' is included in the filter value, and the row value is not empty, return true
export function arrayContainsStringFilterFunction(
  row: Row<any>,
  columnId: string,
  filterValue: string[],
) {
  // if filterValue is empty, return true
  if (filterValue.length === 0) {
    return true;
  }

  const rowValue = row.getValue(columnId);

  if (typeof rowValue !== "string") {
    return false;
  }

  return filterValue.some((item) => {
    if (item === "all" && rowValue !== "") {
      return true;
    }
    return rowValue.split("/").includes(item);
  });
}

export const exboolFilterFunction = (
  row: Row<any>,
  columnId: string,
  filterValue: boolean,
) => {
  if (filterValue === undefined) {
    return true;
  }
  const rowValue = row.getValue(columnId);
  if (typeof rowValue !== "boolean") {
    return false;
  }
  return rowValue === filterValue;
};

export function ttlFilterFunction(
  row: Row<any>,
  columnId: string,
  filterValue: Set<string>,
) {
  // if filterValue is empty, return true
  if (!filterValue || filterValue.size === 0) {
    return true;
  }

  const timeLoose = useState<boolean>("courseTableTimeLoose", () => false);
  const tllList: { d: string; p: string; l: string }[] =
    row.original.time_location_list || [];

  if (tllList.length === 0) {
    return false;
  }

  if (timeLoose.value) {
    // if any of the time/location matches, return true
    return Array.from(tllList).some((tll) => {
      const tp = `${days.indexOf(tll.d as any)}-${periods.indexOf(tll.p as any)}`;
      return filterValue.has(tp);
    });
  } else {
    // if all of the time/location matches, return true
    return Array.from(tllList).every((tll) => {
      const tp = `${days.indexOf(tll.d as any)}-${periods.indexOf(tll.p as any)}`;
      return filterValue.has(tp);
    });
  }
}

export function locationFilterFunction(
  row: Row<any>,
  columnId: string,
  filterValue: Record<string, boolean | undefined> | undefined,
) {
  if (
    !filterValue ||
    Object.values(filterValue).every((v) => v === undefined)
  ) {
    return true;
  }
  const { g, h, o } = filterValue;
  if (g && h && o) {
    return true;
  }
  if (g === false && h == false && o === false) {
    return false;
  }
  const locationFlag = { g: false, h: false, o: false };
  const locationList = row.original.location?.split("/") || "";
  for (const location of locationList) {
    if (location.startsWith("公館 ")) {
      locationFlag.g = true;
    } else if (location.startsWith("和平 ")) {
      locationFlag.h = true;
    } else {
      locationFlag.o = true;
    }
  }

  if (
    (g === false && locationFlag.g) ||
    (h === false && locationFlag.h) ||
    (o === false && locationFlag.o) ||
    !(
      (g === true && locationFlag.g) ||
      (h === true && locationFlag.h) ||
      (o === true && locationFlag.o) ||
      (!g && !h && !o)
    )
  ) {
    return false;
  }
  return true;
}

export function creditsFilterFunction(
  row: Row<any>,
  columnId: string,
  filterValue: number[] | undefined,
) {
  if (!filterValue || filterValue.length === 0) {
    return true;
  }
  return filterValue.includes(row.getValue(columnId));
}

export function fullFilterFunction(
  row: Row<any>,
  columnId: string,
  filterValue: boolean | undefined,
) {
  if (filterValue === undefined) {
    return true;
  } else if (filterValue) {
    return (
      (row.original.count_enrolled_without_authorized || 0) <
      (row.original.limit_enrollment || 0)
    );
  } else {
    return (
      (row.original.count_enrolled_without_authorized || 0) >=
      (row.original.limit_enrollment || Infinity)
    );
  }
}

export function addColumnFilter(columnId: string, value: any) {
  const filters = useState<Record<string, any>>(
    "courseTableFilters",
    () => ({}),
  );
  filters.value[columnId] = value;
}

export function removeColumnFilter(columnId: string) {
  const filters = useState<Record<string, any>>(
    "courseTableFilters",
    () => ({}),
  );
  delete filters.value[columnId];
}

export function clearAndSetAllFilters(filters: Record<string, any>) {
  const allFilters = useState<Record<string, any>>(
    "courseTableFilters",
    () => ({}),
  );
  // allFilters.value = filters;
  for (const key in filters) {
    if (filters[key] === undefined || filters[key] === null) {
      delete allFilters.value[key];
    } else {
      allFilters.value[key] = filters[key];
    }
  }
}
