<template>
  <div class="sm:px-2">
    <UAlert
      v-if="checkInHiddenPeriod() && !hideHiddenPeriodWarning"
      title="有課程位於隱藏的節次中"
      description="檢查課表設定，如果這不符合你的預期"
      color="warning"
      variant="soft"
      close
      class="max-w-2xl mx-auto mb-4"
      @update:open="hideHiddenPeriodWarning = true"
    />
    <UAlert
      v-if="checkInSaturday() && !hideWeekendWarning"
      title="有課程位於週六"
      description="檢查課表設定，如果這不符合你的預期"
      color="warning"
      variant="soft"
      close
      class="max-w-2xl mx-auto mb-4"
      @update:open="hideWeekendWarning = true"
    />
    <UAlert
      v-if="checkOverlap() && !hideOverlapWarning"
      title="課程有重疊"
      description="若課表中未顯示重疊課程，請在設定中關閉「允許課程重疊」或檢查隱藏節次"
      color="error"
      variant="soft"
      close
      class="max-w-2xl mx-auto mb-4"
      @update:open="hideOverlapWarning = true"
    />
    <!-- table -->
    <div class="overflow-x-auto">
      <div class="max-w-2xl mx-auto w-full">
        <table
          ref="timetableRef"
          class="table table-fixed w-[calc(100%-1rem)] mx-auto"
          :class="downloading ? 'w-2xl!' : ''"
        >
          <colgroup>
            <col
              :class="
                !settings?.hidePeriodTime
                  ? 'w-8'
                  : !settings?.hidePeriod
                    ? 'w-1'
                    : 'w-0'
              "
            />
            <col class="w-10" />
            <col class="w-10" />
            <col class="w-10" />
            <col class="w-10" />
            <col class="w-10" />
            <col v-show="settings?.showWeekend" class="w-10" />
          </colgroup>

          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th v-for="i in 5" :key="i" v-show="i <= 5">
                {{ days[i - 1] }}
              </th>
              <th v-show="settings?.showWeekend">六</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="period in periods"
              :key="period"
              v-show="
                settings?.hidePeriods?.find((p) => p === period) === undefined
              "
            >
              <td
                class="font-bold text-center relative m-auto h-16 shrink-0 grow-0"
                v-if="!settings?.hidePeriod || !settings?.hidePeriodTime"
              >
                <div class="text-sm text-dimmed" v-show="!settings?.hidePeriod">
                  {{ period }}
                </div>
                <div
                  class="text-xs text-dimmed"
                  v-show="!settings?.hidePeriodTime"
                >
                  {{ periodMap[period] }}
                </div>
              </td>
              <template v-for="day in days" :key="day">
                <td
                  v-if="
                    !settings?.spanContinuous ||
                    (!settings?.allowOverlap &&
                      getCourseAt(day, period).length > 1) ||
                    !getHighestPriorityCourseAt(day, period) ||
                    getHighestPriorityCourseAt(day, period) !==
                      getPrevHighestPriorityCourseAt(day, period)
                  "
                  :rowspan="
                    settings?.spanContinuous ? getRootSpan(day, period) : 1
                  "
                  v-show="day !== days[5] || settings?.showWeekend"
                  class="relative h-16 w-32 p-0.5 content-start border border-gray-300 shrink-0 grow-0"
                >
                  <UContextMenu v-if="getHighestPriorityCourseAt(day, period)">
                    <UButton
                      :color="
                        !settings?.allowOverlap &&
                        getCourseAt(day, period).length > 1
                          ? 'error'
                          : 'neutral'
                      "
                      variant="outline"
                      :class="[
                        'w-full h-full! m-auto p-1 flex flex-col',
                        'align-top justify-start items-start gap-1 overflow-hidden cursor-pointer',
                        'b-0! ring-0! inset-ring-0! outline-none!',
                      ]"
                      :style="{
                        backgroundColor:
                          getHighestPriorityCourseAt(day, period)?.color
                            ?.length === 7
                            ? getHighestPriorityCourseAt(day, period)?.color +
                              '50'
                            : getHighestPriorityCourseAt(day, period)?.color ||
                              '#CCCCCC50',
                      }"
                      @click="openCoursesAt(day, period)"
                    >
                      <div class="text-sm font-bold text-start text-default">
                        {{ getHighestPriorityCourseAt(day, period)?.name }}
                      </div>
                      <div
                        v-show="settings?.showCourseTeacher"
                        class="text-xs text-muted text-start font-bold"
                      >
                        {{ getHighestPriorityCourseAt(day, period)?.teacher }}
                      </div>
                      <div
                        v-show="settings?.showCourseLocation"
                        class="text-xs text-muted text-start font-bold"
                      >
                        {{
                          getHighestPriorityCourseAt(day, period)?.tll?.find(
                            (t) => t.d === day && t.p === period,
                          )?.l || ""
                        }}
                      </div>

                      <div
                        v-if="
                          !settings?.allowOverlap &&
                          getCourseAt(day, period).length > 1
                        "
                        class="text-xs text-error font-bold"
                      >
                        {{ getCourseAt(day, period).length }} courses
                      </div>
                    </UButton>
                  </UContextMenu>
                  <div
                    v-else
                    class="w-full h-full m-0 p-0 cursor-default bg-transparent"
                    @click="console.log(`No course at ${day} ${period}`)"
                  ></div>
                </td>
              </template>
            </tr>
          </tbody>
          <tfoot v-if="settings?.showOthers">
            <tr>
              <td></td>
              <td
                class="relative h-16 w-32 p-0.5 border border-gray-300 text-muted max-sm:text-xs"
              >
                其他課程
              </td>
              <td
                :colspan="settings?.showWeekend ? 5 : 4"
                class="relative h-16 p-0.5 border border-gray-300"
              >
                <div class="flex flex-wrap gap-1 h-full align-baseline">
                  <UButton
                    v-for="course in others"
                    :key="course.id"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    class="w-full h-fit p-2.5 cursor-pointer"
                    @click="
                      () => {
                        selectedCourse = course;
                        showCourseModal = true;
                      }
                    "
                    :style="{
                      backgroundColor:
                        course?.color?.length === 7
                          ? course?.color + '50'
                          : course?.color || '#CCCCCC50',
                    }"
                  >
                    {{ course.name }}
                  </UButton>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <UModal
        :title="`此節次（${selectedPeriod}）有多個課程`"
        description="請選擇要查看的課程，"
        v-model:open="showMultipleCoursesModal"
        :ui="{ body: '!px-4 !py-2', content: 'max-w-sm' }"
      >
        <template #body>
          <UButton
            v-for="course in multipleCourses"
            :key="course.id"
            color="neutral"
            variant="soft"
            class="w-full justify-start mb-2 cursor-pointer"
            @click="
              () => {
                showMultipleCoursesModal = false;
                openCourse(course);
              }
            "
          >
            {{ course.name }} - {{ course.teacher }}
          </UButton>
        </template>
      </UModal>
      <UModal
        :title="selectedCourse?.name || '課程資訊'"
        :description="selectedCourse?.course_code || ''"
        v-model:open="showCourseModal"
        :ui="{ content: 'max-w-sm', body: '!py-2', title: 'text-lg' }"
      >
        <template #body>
          <div class="flex flex-col gap-2">
            <div class="text-muted align-middle min-h-6 flex flex-row gap-1">
              <UIcon name="tabler:users" class="size-4 mt-1" />
              <div class="inline-block whitespace-pre-wrap">
                {{ selectedCourse?.teacher }}
              </div>
            </div>
            <div class="text-muted align-middle min-h-6 flex flex-row gap-1">
              <UIcon name="tabler:clock" class="size-4 mt-1" />
              <div class="whitespace-pre-wrap">
                {{
                  selectedCourse?.tl?.join("\n") ||
                  denseDataAllTerms?.[activeTerm]?.[
                    `${selectedCourse?.course_code}-${selectedCourse?.course_group}`
                  ]
                    ?.map((t) => `${t.date} ${t.time_location}`)
                    .join("\n") ||
                  "無時間資訊"
                }}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <UPopover v-if="!shared">
                <UButton
                  color="neutral"
                  variant="outline"
                  @click="
                    () => {
                      if (selectedCourse && !selectedCourse.color) {
                        selectedCourse.color = '#CCCCCC';
                      }
                    }
                  "
                  class="cursor-pointer"
                >
                  <template #leading>
                    <span
                      :style="{
                        backgroundColor:
                          selectedCourse?.color &&
                          selectedCourse?.color?.length === 7
                            ? selectedCourse.color + '50'
                            : selectedCourse?.color || '#CCCCCC50',
                      }"
                      class="size-4 rounded-full"
                    ></span>
                  </template>
                  調整底色
                </UButton>
                <template #content>
                  <UColorPicker
                    v-if="selectedCourse"
                    v-model="selectedCourse.color"
                    @update:modelValue="
                      setCourseColor(
                        currentTerm,
                        selectedCourse.id ||
                          `${selectedCourse?.course_code}-${selectedCourse?.course_group}`,
                        selectedCourse?.color || '',
                      )
                    "
                  />
                  <!-- TODO: Add alpha channel support -->
                </template>
              </UPopover>
              <ULink
                :to="
                  selectedCourse?.id
                    ? `/courses/${activeTerm.replace('-', '/')}/${selectedCourse?.id}`
                    : `/courses/${activeTerm.replace('-', '/')}/${selectedCourse?.course_code}/${selectedCourse?.course_group}`
                "
                target="_blank"
                class="ml-auto"
              >
                查看課程詳情
              </ULink>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  Timetable,
  TimetableSettings,
  CourseTimetableItem,
} from "@/composables/useTimetable";
import { setCourseColor } from "@/composables/useTimetable";
import { days, periods, periodMap } from "@/composables/useConstants";

const props = defineProps<{
  timetable: Timetable;
  settings: TimetableSettings;
  shared?: boolean | undefined;
  term?: string | undefined;
}>();
const config = useRuntimeConfig();
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (config.public.ntnuxDefaultTerm as string) || "",
);
const denseDataAllTerms = useState<AllTermsDenseData>(
  "denseDataAllTerms",
  () => ({}),
);
const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);
const activeTerm = computed(() => props.term || currentTerm.value);

const timetableRef = useState<HTMLTableElement>("timetableRef");
const downloading = useState("downloadingTimetableImage", () => false);

interface dayPeriodToCourse {
  [day: string]: {
    [period: string]: CourseTimetableItem[];
  };
}
const dayPeriodToCourse = computed(() => {
  const mapping: dayPeriodToCourse = {};
  for (const course of Object.values(props.timetable)) {
    for (const { d, p } of course?.tll || []) {
      if (!mapping[d]) {
        mapping[d] = {};
      }
      if (!mapping[d][p]) {
        mapping[d][p] = [];
      }
      mapping[d][p].push(course);
    }
  }
  return mapping;
});
const others = computed(() =>
  Object.values(props.timetable).filter((course) => {
    return !course.tll || course.tll.length === 0;
  }),
);

function getPrevPeriod(p: string): string {
  if (!p) {
    return "";
  }
  const index = periods.findIndex((period) => period.toString() === p);
  if (index > 0) {
    if (props.settings?.hidePeriods?.includes(periods[index - 1] as any)) {
      return getPrevPeriod(periods[index - 1]?.toString() || "");
    }
    return periods[index - 1]?.toString() || "";
  }
  return "";
}

function getNextPeriod(p: string): string {
  if (!p) {
    return "";
  }
  const index = periods.findIndex((period) => period.toString() === p);
  if (index >= 0 && index < periods.length - 1) {
    if (props.settings?.hidePeriods?.includes(periods[index + 1] as any)) {
      return getNextPeriod(periods[index + 1]?.toString() || "");
    }
    return periods[index + 1]?.toString() || "";
  }
  return "";
}

function getRootSpan(day: string, period: string): number {
  const course = getHighestPriorityCourseAt(day, period);
  if (!course) {
    return 1;
  }
  let nextPeriod = getNextPeriod(period);
  let span = 1;
  while (nextPeriod) {
    if (
      !props.settings?.allowOverlap &&
      getCourseAt(day, nextPeriod).length > 1
    ) {
      break;
    }
    const next = getHighestPriorityCourseAt(day, nextPeriod);
    if (
      next?.id === course?.id &&
      next?.course_code === course?.course_code &&
      next?.course_group === course?.course_group
    ) {
      span++;
      nextPeriod = getNextPeriod(nextPeriod);
    } else {
      break;
    }
  }

  return span;
}

function getCourseAt(
  day: number | string,
  period: number | string,
): CourseTimetableItem[] {
  const dayStr =
    typeof day === "number" ? days[day - 1] || day.toString() : day;
  const periodStr = period.toString();
  return (
    dayPeriodToCourse.value?.[dayStr]?.[periodStr]?.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA; // higher priority first
    }) || []
  );
}

function getHighestPriorityCourseAt(
  day: number | string,
  period: number | string,
): CourseTimetableItem | null {
  if (!day || !period) {
    return null;
  }
  const courses = getCourseAt(day, period);
  if (courses.length === 0) {
    return null;
  }
  return courses[0] as CourseTimetableItem;
}

function getPrevHighestPriorityCourseAt(
  day: number | string,
  period: number | string,
): CourseTimetableItem | null {
  const prevPeriod = getPrevPeriod(period.toString());
  if (!prevPeriod) {
    return null;
  }
  return getHighestPriorityCourseAt(day, prevPeriod);
}
function getNextHighestPriorityCourseAt(
  day: number | string,
  period: number | string,
): CourseTimetableItem | null {
  const nextPeriod = getNextPeriod(period.toString());
  if (!nextPeriod) {
    return null;
  }
  return getHighestPriorityCourseAt(day, nextPeriod);
}

const hideHiddenPeriodWarning = ref(false);
function checkInHiddenPeriod() {
  const hidden = props.settings?.hidePeriods || [];
  for (const course of Object.values(props.timetable)) {
    for (const { p } of course?.tll || []) {
      if (hidden.find((hp) => hp.toString() === p.toString())) {
        return true;
      }
    }
  }
  return false;
}
const hideWeekendWarning = ref(false);
function checkInSaturday() {
  for (const course of Object.values(props.timetable)) {
    for (const { d } of course?.tll || []) {
      if (d === "六") {
        return true;
      }
    }
  }
  return false;
}
const hideOverlapWarning = ref(false);
function checkOverlap() {
  const courseCount: Record<string, number> = {};
  for (const course of Object.values(props.timetable)) {
    for (const { d, p } of course?.tll || []) {
      const key = `${d}-${p}`;
      courseCount[key] = (courseCount[key] || 0) + 1;
      if (courseCount[key] > 1) {
        return true;
      }
    }
  }
  return false;
}

const showMultipleCoursesModal = ref(false);
const multipleCourses = ref<CourseTimetableItem[]>([]);
const selectedPeriod = ref("");
const showCourseModal = ref(false);
const selectedCourse = ref<CourseTimetableItem | null>(null);
function openCourse(course: CourseTimetableItem) {
  selectedCourse.value = course;
  showCourseModal.value = true;
}
function openCoursesAt(
  day: number | string,
  period: number | string,
  course: CourseTimetableItem | undefined = undefined,
) {
  selectedPeriod.value = `${typeof day === "number" ? days[day - 1] || day.toString() : day} ${period}`;
  const courses = course ? [course] : getCourseAt(day, period);
  if (courses.length === 0) {
    return;
  } else if (courses.length === 1) {
    openCourse(courses[0] as CourseTimetableItem);
  } else {
    multipleCourses.value = courses;
    showMultipleCoursesModal.value = true;
  }
}
</script>
