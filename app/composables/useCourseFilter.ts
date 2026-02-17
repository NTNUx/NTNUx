import { type ColumnFiltersState } from "@tanstack/vue-table";

export function useCourseFilter() {
  const filters = useState<ColumnFiltersState>("courseTableFilters", () => []);
  const golbalFilter = useState<string>("courseTableGlobalFilter", () => "");
  return {
    filters,
    golbalFilter,
  };
}

export function updateGolbalFilterByParameter(parameter: string) {
  const { golbalFilter } = useCourseFilter();
  // split by '+', join by space, and set to golbalFilter
  golbalFilter.value = parameter.split("+").join(" ");
}

export function updateGolbalFilterByInput(input: string) {
  const { golbalFilter } = useCourseFilter();
  golbalFilter.value = input;
}

export function golbalFilterFunction(
  row: any,
  columnId: string,
  filterValue: string,
) {
  // split by space, if any of the words is included in "some" of the columns, return true
  // some: id, name, teacher, full_name_en, course_code
  const words = filterValue.toLowerCase().split(" ");
  return words.some((word) => {
    return (
      row.original.id.toLowerCase().includes(word) ||
      row.original.name.toLowerCase().includes(word) ||
      row.original.teacher.toLowerCase().includes(word) ||
      row.original.full_name_en.toLowerCase().includes(word) ||
      row.original.course_code.toLowerCase().includes(word)
    );
  });
}
