<template>
  <UButton
    :label="isAdded ? '已加入' : '加入'"
    size="lg"
    :color="isAdded ? 'primary' : 'neutral'"
    :variant="isAdded ? 'solid' : 'soft'"
    class="w-14 items-center justify-center px-0 cursor-pointer"
    @click="toggleCourse"
  ></UButton>
</template>

<script lang="ts" setup>
// props: course: Course, isAdded: boolean
import type { Course } from "@/composables/useCourseTable";
import {
  toggleCourseInTimetable,
  ignoreTimetableAlert,
} from "@/composables/useTimetable";
import {
  addToTimetableToast,
  removeFromTimetableToast,
  addGlobalModal,
} from "@/composables/useTools";

const { yt, course } = defineProps<{
  yt: string;
  course: Course | undefined;
}>();
const courseKey = computed(() => {
  return course?.id || `${course?.course_code}-${course?.course_group}`;
});
const isAdded = computed(() => {
  return isCourseInTimetable(yt, course as Course) || false;
});

function toggleCourse() {
  toggleCourseInTimetable(yt, course as Course);
  if (!ignoreTimetableAlert()) {
    addGlobalModal({
      title: "請注意",
      description:
        'NTNUx 提供的選課功能並<strong>不會</strong>與學校選課系統連動\n<color class="text-red-500">請務必在選課時間於學校選課系統完成選課</color>',
      slots: {
        footer: "timetable-warning-footer",
      },
    });
  }
  if (isCourseInTimetable(yt, course as Course)) {
    addToTimetableToast(course?.name as string, courseKey.value);
  } else {
    removeFromTimetableToast(course?.name as string, courseKey.value);
  }
}
</script>
