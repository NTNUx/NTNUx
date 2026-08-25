import type { Course } from "@/composables/useCourseTable";
import { jsonLzDecode, jsonLzEncode } from "@/composables/useTools";

export type FavoriteCourses = string[];
export type CourseNameMap = Record<string, string>;

export const favoriteCourses = ref<FavoriteCourses>([]);
export const courseNameMap = ref<CourseNameMap>({});

export function loadFavoriteCourses() {
  if (!import.meta.client) return;
  const stored = localStorage.getItem("ntnux-user-favorite");
  const storedNameMap = localStorage.getItem("ntnux-user-favorite-name-map");
  if (stored) {
    try {
      const decoded = jsonLzDecode(stored);
      if (typeof decoded === "object" && decoded !== null) {
        // asset decoded is array of strings
        if (Array.isArray(decoded)) {
          favoriteCourses.value = decoded;
        } else {
          console.warn(
            "Decoded favorite courses is not an array, resetting to empty",
          );
          favoriteCourses.value = [];
        }
      }
      if (storedNameMap) {
        const decodedNameMap = jsonLzDecode(storedNameMap);
        if (typeof decodedNameMap === "object" && decodedNameMap !== null) {
          courseNameMap.value = decodedNameMap as CourseNameMap;
        } else {
          console.warn(
            "Decoded course name map is not an object, resetting to empty",
          );
          courseNameMap.value = {} as CourseNameMap;
        }
      }
    } catch (e) {
      console.error("Failed to load favorite courses:", e);
      localStorage.removeItem("ntnux-user-favorite");
      localStorage.removeItem("ntnux-user-favorite-name-map");
    }
  }
}

export function saveFavoriteCourses() {
  if (!import.meta.client) return;
  try {
    const encoded = jsonLzEncode(favoriteCourses.value);
    localStorage.setItem("ntnux-user-favorite", encoded);
    const encodedNameMap = jsonLzEncode(courseNameMap.value);
    localStorage.setItem("ntnux-user-favorite-name-map", encodedNameMap);
  } catch (e) {
    console.error("Failed to save favorite courses:", e);
  }
}

export function addFavoriteCourse(course: Course) {
  favoriteCourses.value.push(course.course_code);
  courseNameMap.value[course.course_code] = course.name;
  saveFavoriteCourses();
}

export function removeFavoriteCourse(course: Course) {
  favoriteCourses.value = favoriteCourses.value.filter(
    (code) => code !== course.course_code,
  );
  saveFavoriteCourses();
}

export function toggleFavoriteCourse(course: Course) {
  toggleFavoriteCourseByCode(course.course_code, course.name);
}

export function toggleFavoriteCourseByCode(
  course_code: string,
  course_name?: string,
) {
  const index = favoriteCourses.value.findIndex((code) => code === course_code);
  if (index !== -1) {
    favoriteCourses.value.splice(index, 1);
  } else {
    favoriteCourses.value.push(course_code);
    if (course_name) {
      courseNameMap.value[course_code] = course_name;
    }
  }
  saveFavoriteCourses();
}
