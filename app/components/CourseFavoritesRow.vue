<template>
  <div
    class="flex flex-row max-sm:grid max-sm:grid-cols-[auto_fit-content] items-center gap-x-4 gap-y-2 py-2 px-4"
  >
    <!-- left to right: (year, term), teacher, (time, location, ?dense), (info link, add to timetable) -->
    <div class="gap-2 flex flex-row flex-wrap items-center max-sm:order-1">
      <span class="text-sm text-dimmed">
        {{ course?.year }}-{{ course?.term?.replace("3", "暑期") }}
      </span>
      <UBadge icon="tabler:user" variant="soft" color="neutral">
        {{ course?.teacher }}
      </UBadge>
      <UBadge
        v-if="course?.english_teaching"
        icon="tabler:language"
        color="error"
        variant="soft"
      >
        英文授課
      </UBadge>
    </div>
    <div
      v-if="denseInfo"
      class="ml-2 flex flex-col gap-0.5 max-sm:order-3 max-sm:col-span-2"
    >
      <div v-for="d in denseInfo" :key="d?.date">
        <span class="text-sm text-dimmed">
          {{ d?.date }}
        </span>
        <span class="text-sm">
          {{ d?.time_location }}
        </span>
      </div>
    </div>
    <div
      v-else
      class="ml-2 gap-2 flex flex-row items-center max-sm:order-3 max-sm:col-span-2"
    >
      <UBadge
        icon="tabler:clock"
        :color="time.match(/.* (0|1)([-/\n\r]|$)/) ? 'warning' : 'neutral'"
        variant="soft"
      >
        {{ time || "無資料" }}
      </UBadge>
      <UBadge
        icon="tabler:map-pin"
        color="neutral"
        variant="soft"
        v-if="location"
      >
        {{ location }}
      </UBadge>
    </div>
    <div class="ml-auto max-sm:order-2">
      <UButton
        :label="isAdded ? '已加入' : '加入'"
        size="lg"
        :color="isAdded ? 'primary' : 'neutral'"
        :variant="isAdded ? 'solid' : 'soft'"
        class="w-14 items-center justify-center px-0 cursor-pointer"
        @click="toggleCourse"
      ></UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Course, AllTermsDenseData } from "@/composables/useCourseTable";
import {
  isCourseInTimetable,
  toggleCourseInTimetable,
} from "@/composables/useTimetable";
import {
  addToTimetableToast,
  removeFromTimetableToast,
} from "@/composables/useTools";

const props = defineProps<{
  course: Course;
}>();
const denseDataAllTerms = useState<AllTermsDenseData>(
  "denseDataAllTerms",
  () => ({}),
);
const yt = `${props.course.year}-${props.course.term}`;
const key = `${props.course.course_code}-${props.course.course_group}`;
const time = props.course.time.join("/");
const location = props.course.location;
const denseInfo = props.course.intensive
  ? denseDataAllTerms.value[yt]?.[key]
  : null;
const isAdded = ref(
  props.course ? isCourseInTimetable(yt, props.course as Course) : false,
);

function toggleCourse() {
  toggleCourseInTimetable(yt, props.course as Course);
  if (isCourseInTimetable(yt, props.course as Course)) {
    isAdded.value = true;
    addToTimetableToast(props.course?.name as string, props.course?.id || key);
  } else {
    isAdded.value = false;
    removeFromTimetableToast(
      props.course?.name as string,
      props.course?.id || key,
    );
  }
}
</script>
