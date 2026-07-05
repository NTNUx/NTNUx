<template>
  <div class="page-container w-full">
    <div class="px-8 w-full max-w-5xl m-auto mt-4 justify-between flex">
      <UButton
        label="返回搜尋"
        variant="link"
        color="neutral"
        icon="tabler:chevron-left"
        class="px-0 cursor-pointer"
        @click="
          () => {
            // if history is /search/*, go back to previous page, else go to /search/quick
            if (previousRoute?.includes('/search')) {
              router.back();
            } else {
              router.push({
                path: '/search/quick',
                query: {
                  y: `${course?.year}-${course?.term}`,
                },
              });
            }
          }
        "
      />
      <UButton
        label="前往課表"
        variant="link"
        color="neutral"
        trailing-icon="tabler:chevron-right"
        class="px-0 cursor-pointer"
        @click="
          navigateTo({
            path: '/user/timetable',
            query: {
              y: `${course?.year}-${course?.term}`,
            },
          })
        "
      />
    </div>

    <!-- title -->
    <div class="px-8 w-full max-w-5xl m-auto mt-4">
      <div class="text-2xl font-bold flex-wrap">
        {{ course?.name || title || "課程資訊" }}
      </div>
      <div class="text-xs text-dimmed">
        {{ course?.full_name_en?.split("<")[0]?.trim() }}
      </div>
      <div class="mt-1 flex flex-row justify-between">
        <p class="text-sm text-dimmed">
          {{
            course
              ? `${course.year}-${course.term?.replace("3", "暑期")} 開課`
              : ""
          }}
        </p>
        <!-- button -->
        <div
          :class="[
            'course-button flex flex-row items-center justify-end gap-2',
          ]"
        >
          <CourseFavoritesButton
            :course-name="course?.name"
            :course-code="course?.course_code"
          />
          <CourseTimetableButton
            :yt="`${course?.year}-${course?.term}`"
            :course="course"
            :is-added="isAdded"
            @change="isAdded = $event"
          />
        </div>
      </div>
    </div>

    <!-- info -->
    <div
      v-if="course"
      class="w-[calc(100%-1rem)] max-w-5xl mt-2 mx-auto p-4 rounded-lg bg-white dark:bg-gray-800 shadow grid grid-cols-1 md:grid-cols-[300px_auto] gap-4"
    >
      <CourseInfo :course="course" />

      <CourseAccordion :course="course" />
    </div>
    <UButton
      v-if="course && (!showIframe || showIframeLoading)"
      label="顯示課程大綱"
      color="primary"
      variant="outline"
      class="mt-4 w-[calc(100%-1rem)] max-w-5xl mx-auto cursor-pointer flex"
      @click="showIframeEvent"
      :loading="showIframeLoading"
      block
    />
    <div
      v-if="course"
      v-show="showIframe"
      :style="{
        height:
          windowWidth < 950
            ? ((windowWidth - 10) / 950) * 2000 + 'px'
            : '800px',
      }"
      class="overflow-hidden max-w-screen w-fit mx-auto"
    >
      <iframe
        :src="
          'https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/SyllabusCtrl?' +
          `year=${course.year}&term=${course.term}&` +
          `courseCode=${course.course_code}&courseGroup=${course.course_group}&` +
          `deptCode=${course.department_code}&formS=${course.grade}&` +
          `classes1=${course.class_kind}&deptGroup=${course.department_group}`
        "
        :height="windowWidth < 950 ? '2000px' : '800px'"
        :width="
          windowWidth < 950
            ? `950px`
            : windowWidth < 1040
              ? `${windowWidth - 16}px`
              : '1024px'
        "
        frameborder="0"
        :style="{
          '-webkit-transform': `scale(${
            windowWidth < 950 ? (windowWidth - 10) / 950 : 1
          })`,
          '-moz-transform': `scale(${
            windowWidth < 950 ? (windowWidth - 10) / 950 : 1
          })`,
          'margin-left': windowWidth < 950 ? `5px` : `0`,
        }"
        class="mt-4 mx-auto bg-white origin-top-left"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
// /courses/[year]/[term]/[id]/[[title]].vue
import type {
  Course,
  AllTermsData,
  AllTermsDenseData,
} from "@/composables/useCourseTable";
import { fetchTermData } from "@/composables/useCourseTable";
import { isCourseInTimetable } from "@/composables/useTimetable";
import { loadFavoriteCourses } from "@/composables/useFavorites";

const route = useRoute();
const router = useRouter();
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (useRuntimeConfig().public.ntnuxDefaultTerm as string) || "",
);
const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);
const showIframe = ref(false);
const showIframeLoading = ref(false);
const showIframeEvent = () => {
  if (!showIframe.value) {
    showIframeLoading.value = true;
    // wait for 1s to show loading state
    setTimeout(() => {
      showIframe.value = true;
      showIframeLoading.value = false;
    }, 1000);
  }
};
const previousRoute = useState<string>("previousRoute");

const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
const denseDataAllTerms = useState<AllTermsDenseData>(
  "denseDataAllTerms",
  () => ({}),
);

const year = route.params.year as string;
const term = route.params.term as string;
const yt = `${year}-${term}`;
const courseId = route.params.id as string;
const title = (route.params.title as string) || "";

if (!year || !term || !courseId) {
  // If any of the required parameters are missing, we can choose to show an error or redirect
  console.error("Missing required route parameters.");
}

// Try to find the course in dataAllTerms
const course = computed<Course | undefined>(() => {
  if (courseId && courseId.includes("-")) {
    const [code, group] = courseId.split("-", 2);
    return dataAllTerms.value[yt]?.find(
      (c) => c.course_code === code && c.course_group === group,
    );
  }
  return dataAllTerms.value[yt]?.find((c) => c.id === courseId);
});

const description = ref("");
async function getCourseDescription(code: string) {
  if (code && (!course.value?.description || course.value.description === "")) {
    // Fetch course description from the API
    await useFetch(`/api/crosstontnu/${encodeURIComponent(code)}`, {
      method: "POST",
      onResponse({ response }) {
        if (!response.ok) {
          console.error(
            `Failed to fetch course description: ${response.status} ${response.statusText}`,
          );
        }
        try {
          const data: any = response._data;
          if (typeof data === "string") {
            const json = JSON.parse(data);
            description.value = json?.brief || json?.CourseDescription || "";
            if (course.value) {
              course.value.description = description.value; // Update the course description in the state
            }
          } else if (data && typeof data === "object") {
            description.value = data?.brief || data?.CourseDescription || "";
            if (course.value) {
              course.value.description = description.value; // Update the course description in the state
            }
          } else {
            console.warn(
              "Unexpected response format for course description:",
              response._data,
            );
          }
        } catch (e) {
          console.error("Failed to parse course description response:", e);
        }
      },
    });
  }
}
function updateSeoMeta() {
  useSeoMeta({
    title: course.value
      ? `${course.value.name} - 課程資訊`
      : title || "課程資訊",
    description: description.value
      ? `課程資訊的詳細頁面。${description.value}`
      : `${course.value?.name || "課程資訊"} 的詳細課程資訊。`,
    ogUrl: `https://ntnux.org/courses/${year}/${term}/${courseId}${course.value?.name ? `/${encodeURIComponent(course.value?.name)}` : ""}`,
  });
  if (
    course.value &&
    route.path !==
      `/courses/${year}/${term}/${courseId}${course.value?.name ? `/${encodeURIComponent(course.value.name)}` : ""}`
  ) {
    router.replace({
      path: `/courses/${year}/${term}/${courseId}${course.value?.name ? `/${encodeURIComponent(course.value.name)}` : ""}`,
    });
  }
}
updateSeoMeta();

const isAdded = ref(
  course.value ? isCourseInTimetable(yt, course.value) : false,
);

function initialize() {
  if (
    course.value &&
    (!course.value.description || course.value.description === "")
  ) {
    getCourseDescription(
      course.value?.course_code || courseId.split("-", 2)[0] || "",
    ).then(() => {
      description.value = course.value?.description || "";
      updateSeoMeta();
    });
  } else {
    description.value = course.value?.description || "";
    updateSeoMeta();
  }
  loadFavoriteCourses();
  isAdded.value = course.value ? isCourseInTimetable(yt, course.value) : false;
}

onMounted(() => {
  if (!course.value) {
    // If course is not found, try to fetch the term data
    fetchTermData(yt, false)
      .refresh()
      .then(() => {
        if (!course.value) {
          console.error("Course not found after fetching term data:", {
            yt,
            courseId,
          });
        } else {
          initialize();
        }
      });
  } else {
    initialize();
  }
});
</script>
