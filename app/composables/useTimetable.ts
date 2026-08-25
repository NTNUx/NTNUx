import type { Course } from "@/composables/useCourseTable";
import { fetchTermData } from "@/composables/useCourseTable";
import { colorList } from "@/composables/useConstants";
import { jsonLzDecode, jsonLzEncode } from "@/composables/useTools";

export interface CourseTimetableItem {
  id?: string;
  course_code?: string;
  course_group?: string;
  name?: string;
  teacher?: string;
  tl?: string[];
  tll?: { d: string; p: string; l: string }[];
  color?: string;
  priority?: number;
}

export interface Timetable {
  [key: string]: CourseTimetableItem;
}
export interface TimetableAllDict {
  [term: string]: Timetable;
}

export const allTimetable = ref<TimetableAllDict>({} as TimetableAllDict);

export function ignoreTimetableAlert() {
  const ignoreAlert = useState("timetableAlertIgnore", () => false);
  const key = "ntnux-user-timetable-alert-ignore";
  if (import.meta.client) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        ignoreAlert.value = JSON.parse(stored);
      } catch (e) {
        ignoreAlert.value = false;
        localStorage.removeItem(key);
      }
    }
  }
  return ignoreAlert.value;
}
export function setTimetableAlertIgnore(value: boolean) {
  const key = "ntnux-user-timetable-alert-ignore";
  if (import.meta.client) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const ignoreAlert = useState("timetableAlertIgnore", () => false);
  ignoreAlert.value = value;
}

// use local storage instead of cookie to store timetable data
export function getTimetable(term: string) {
  if (!import.meta.client) {
    allTimetable.value[term] = {} as Timetable;
    return;
  }
  const key = `ntnux-user-timetable-${term}`;
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      allTimetable.value[term] = jsonLzDecode(storedValue) as Timetable;
    } catch (e) {
      console.error("Failed to decode user timetable from localStorage:", {
        error: e,
        rawValue: storedValue,
      });
      allTimetable.value[term] = {} as Timetable;
    }
  } else {
    allTimetable.value[term] = {} as Timetable;
  }
}

export function setTimetable(term: string, timetable: Timetable) {
  const key = `ntnux-user-timetable-${term}`;
  try {
    localStorage.setItem(key, jsonLzEncode(timetable));
  } catch (e) {
    console.error("Failed to encode user timetable for localStorage:", {
      error: e,
      value: timetable,
    });
  }
}

function getCourseTimetableItem(
  course: Course,
  color?: string,
  priority?: number,
): CourseTimetableItem {
  return {
    id: course?.id,
    course_code: course?.course_code,
    course_group: course?.course_group,
    name: course?.name,
    teacher: course?.teacher,
    tl: course?.time,
    tll: course?.time_location_list,
    color: color
      ? color
      : course?.time_location_list?.length
        ? getCourseColor(
            course?.id || `${course.course_code}-${course.course_group}`,
          )
        : undefined,
    priority: priority,
  };
}

export function isCourseInTimetable(term: string, course: Course): boolean {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);
  const courseKey =
    course?.id || `${course.course_code}-${course.course_group}`;
  return !!timetable[courseKey];
}

export function addToTimetable(term: string, course: Course) {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);
  const newItem: CourseTimetableItem = getCourseTimetableItem(course);
  if (course?.id) {
    timetable[course.id] = newItem;
  } else {
    timetable[`${course.course_code}-${course.course_group}`] = newItem;
  }
  setTimetable(term, timetable);
  return timetable;
}

export function removeFromTimetable(term: string, course: Course) {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);

  if (course?.id && timetable[course.id]) {
    delete timetable[course.id];
  } else if (timetable[`${course.course_code}-${course.course_group}`]) {
    delete timetable[`${course.course_code}-${course.course_group}`];
  }
  setTimetable(term, timetable);
  return timetable;
}

export function removeFromTimetableById(term: string, courseId: string) {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);

  if (timetable[courseId]) {
    delete timetable[courseId];
  }
  setTimetable(term, timetable);
  return timetable;
}

// if course in timetable, remove it, otherwise add it
export function toggleCourseInTimetable(term: string, course: Course) {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);
  const courseKey =
    course?.id || `${course.course_code}-${course.course_group}`;

  if (timetable[courseKey]) {
    delete timetable[courseKey];
  } else {
    const newItem: CourseTimetableItem = getCourseTimetableItem(course);
    timetable[courseKey] = newItem;
  }
  setTimetable(term, timetable);
  return timetable;
}

export function clearTimetable(term: string) {
  allTimetable.value[term] = {} as Timetable;
  setTimetable(term, {} as Timetable);
  return {} as Timetable;
}

export function updateCoursesInTimetable(term: string, courses: Course[]) {
  const newTimetable: Timetable = {};
  for (const course of courses) {
    const newItem: CourseTimetableItem = {
      id: course?.id,
      course_code: course?.course_code,
      course_group: course?.course_group,
      name: course?.name,
      teacher: course?.teacher,
      tl: course?.time,
      tll: course?.time_location_list,
      color: getCourseColor(
        course?.id || `${course.course_code}-${course.course_group}`,
      ),
    };
    if (course?.id) {
      newTimetable[course.id] = newItem;
    } else {
      newTimetable[`${course.course_code}-${course.course_group}`] = newItem;
    }
  }
  setTimetable(term, newTimetable);
  return newTimetable;
}

export function getCourseColor(courseKey: string): string {
  const randomIndex = Math.floor(Math.random() * colorList.length);
  return colorList[randomIndex] || "#000000"; // Fallback color
}

export function setCourseColor(term: string, courseKey: string, color: string) {
  getTimetable(term);
  const timetable = allTimetable.value[term] || ({} as Timetable);
  if (timetable[courseKey]) {
    timetable[courseKey].color = color;
    setTimetable(term, timetable);
  }
}

export function exportCourseDataParams(
  term: string,
  includeColor: boolean = false,
): string {
  // for [key]: course -> key+color, separate by comma, sorted by priority
  const timetable = allTimetable.value[term] || ({} as Timetable);
  const sortedCourses = Object.entries(timetable).sort((a, b) => {
    const priorityA = a[1].priority || 0;
    const priorityB = b[1].priority || 0;
    return priorityB - priorityA; // Sort by priority descending
  });
  const exportData = sortedCourses.map(([key, course]) => {
    if (includeColor) {
      return `${key}:${course.color || ""}`;
    }
    return key;
  });
  return encodeURIComponent(exportData.join(","));
}

export function exportCourseDataIds(
  term: string,
  includeColor: boolean = false,
): string {
  const timetable = allTimetable.value[term] || ({} as Timetable);
  const sortedCourses = Object.entries(timetable).sort((a, b) => {
    const priorityA = a[1].priority || 0;
    const priorityB = b[1].priority || 0;
    return priorityB - priorityA; // Sort by priority descending
  });
  const exportData = sortedCourses.map(([key, course]) => {
    const courseKey = course.id || key;
    if (includeColor) {
      return course?.color ? `${courseKey}:${course.color}` : courseKey;
    }
    return courseKey;
  });
  return exportData.join("\n");
}

export async function importCourses(
  input: string,
  term: string = "",
): Promise<{
  timetable: Timetable;
  errorEntries: string[];
}> {
  const defaultTerm = useState<string>(
    "defaultTerm",
    () => (useRuntimeConfig().public.ntnuxDefaultTerm as string) || "",
  );
  const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);
  const activeTerm = term || currentTerm.value;
  const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));

  const timetable: Timetable = {};
  const errorEntries: string[] = [];
  const entries = input.split(/[\n,、]+/);
  let priorityCounter = entries.length;
  for (const entry of entries) {
    const [key, color] = entry.split(":");
    if (key) {
      // fetch course data by key
      const course = dataAllTerms.value[activeTerm]?.find(
        (c) =>
          c.id === key ||
          `${c.course_code}-${c.course_group}` === key ||
          `${c.course_code}` === key,
      );
      if (!course) {
        await fetchTermData(activeTerm)
          .refreshAll()
          .then(() => {
            const refreshedCourse = dataAllTerms.value[activeTerm]?.find(
              (c) =>
                c.id === key ||
                `${c.course_code}-${c.course_group}` === key ||
                `${c.course_code}` === key,
            );
            if (refreshedCourse) {
              timetable[key] = getCourseTimetableItem(
                refreshedCourse,
                color || undefined,
                priorityCounter--,
              );
            } else {
              errorEntries.push(key);
            }
          });
      } else {
        timetable[key] = getCourseTimetableItem(
          course,
          color || undefined,
          priorityCounter--,
        );
      }
    }
  }

  return new Promise((resolve) => {
    // wait for 1 second to allow fetchTermData to refresh data
    setTimeout(() => {
      resolve({ timetable, errorEntries });
    }, 1000);
  });
}

// Timetable settings
export const defaultTimetableSettings: TimetableSettings = {
  showWeekend: false,
  spanContinuous: true,
  allowOverlap: false,
  hidePeriod: false,
  hidePeriodTime: false,
  hidePeriods: ["0", "5", "C", "D"],
  showOthers: true,
  showCourseTeacher: true,
  showCourseLocation: true,
} as const;
export const timetableSettings = ref<TimetableSettings>(
  defaultTimetableSettings,
);

export interface TimetableSettings {
  showWeekend: boolean;
  spanContinuous: boolean;
  allowOverlap: boolean;
  hidePeriod: boolean;
  hidePeriodTime: boolean;
  hidePeriods: string[];
  showOthers: boolean;
  showCourseTeacher: boolean;
  showCourseLocation: boolean;
}

export function getTimetableSettings() {
  if (!import.meta.client) {
    return;
  }
  const key = "ntnux-user-timetable-settings";
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      timetableSettings.value = {
        ...defaultTimetableSettings,
        ...(jsonLzDecode(storedValue) as Partial<TimetableSettings>),
      };
    } catch (e) {
      console.error(
        "Failed to decode user timetable settings from localStorage:",
        {
          error: e,
          rawValue: storedValue,
        },
      );
      timetableSettings.value = { ...defaultTimetableSettings };
    }
  } else {
    timetableSettings.value = { ...defaultTimetableSettings };
  }
}

export function setTimetableSettings(settings: TimetableSettings) {
  const key = "ntnux-user-timetable-settings";
  try {
    timetableSettings.value = settings;
    localStorage.setItem(key, jsonLzEncode(settings));
  } catch (e) {
    console.error(
      "Failed to encode user timetable settings for localStorage:",
      {
        error: e,
        value: settings,
      },
    );
  }
}

export function resetTimetableSettings() {
  timetableSettings.value = { ...defaultTimetableSettings };
  setTimetableSettings(timetableSettings.value);
}

export function exportTimetableSettings(settings: TimetableSettings): string {
  // only export settings that are different from default settings
  const exportData: Partial<TimetableSettings> = {};
  for (const key in settings) {
    if (
      settings[key as keyof TimetableSettings] !==
      defaultTimetableSettings[key as keyof TimetableSettings]
    ) {
      exportData[key as keyof TimetableSettings] = settings[
        key as keyof TimetableSettings
      ] as any;
    }
  }
  return encodeURIComponent(jsonLzEncode(exportData));
}
