<template>
  <div
    :class="[
      last ? 'border-b-0' : 'border-b-2 border-gray-200 dark:border-gray-700',
      'course-row relative px-4 py-3 w-full items-start',
      'grid gap-x-2 grid-cols-[56px_6fr_6fr_7fr] grid-flow-col',
      'max-md:flex max-md:flex-col max-md:items-start',
      settings?.show_others && settings?.show_others_dev
        ? 'grid-rows-[auto_1fr_auto]'
        : 'grid-rows-[auto_1fr]',
    ]"
  >
    <div
      class="course-code order-1 flex flex-col max-md:flex-row shrink-0 grow-0 md:row-span-2 md:h-full md:justify-center"
      v-show="settings.show_code"
    >
      <span v-show="settings.show_code_id" class="max-md:mr-4 text-sm">
        {{ course?.id }}</span
      >
      <span v-show="settings.show_code_course_code" class="text-sm">{{
        course?.course_code
      }}</span>
    </div>
    <span
      class="col-start-1 row-start-3 max-md:row-end col-span-4 order-end"
      v-if="settings.show_others && settings.show_others_dev"
    >
      {{ course }}
    </span>
    <span class="course-title order-2 col-span-2 max-md:w-full max-md:pr-25">
      <ULink
        class="course-name text-lg text-primary dark:text-white font-bold"
        as="button"
        :to="{
          path:
            course?.year && course?.term && (course?.id || course?.course_code)
              ? '/courses/' +
                `${course.year}/${course.term}/${
                  course.id || course.course_code + '-' + course?.course_group
                }/${encodeURIComponent(course?.name)}`
              : '#',
        }"
      >
        {{ course?.name }}
      </ULink>
      <span
        v-if="course?.full_name_en"
        v-show="settings.show_others && settings.show_others_full_name_en"
        class="text-sm text-gray-500 dark:text-gray-400 leading-1"
        v-html="`<br>${course.full_name_en}`"
      >
      </span>
    </span>
    <div
      class="course-info order-3 badge-group flex flex-wrap gap-y-1 gap-x-2 pt-2"
      v-show="settings.show_info"
    >
      <UBadge
        v-show="settings.show_info_department"
        icon="tabler:building"
        variant="soft"
        color="neutral"
      >
        {{ course?.department }}
      </UBadge>
      <UBadge
        v-show="settings.show_info_teacher"
        icon="tabler:user"
        variant="soft"
        color="neutral"
      >
        {{ course?.teacher }}
      </UBadge>
      <UBadge
        v-if="course?.time && !course?.intensive"
        v-show="settings.show_info_time"
        icon="tabler:clock"
        :color="
          !course?.time?.length ||
          course.time.join('/').match(/.* (0|1)([-/\n\r]|$)/)
            ? 'warning'
            : 'neutral'
        "
        variant="soft"
      >
        {{ course.time.join("/") || "無資料" }}
      </UBadge>
      <UTooltip
        v-if="course?.intensive"
        :delayDuration="50"
        :ui="{
          content: 'bg-muted ring-1 ring-(--ui-text-toned) h-auto',
        }"
      >
        <UBadge
          v-if="course?.intensive"
          v-show="true /*settings.show_info_time*/"
          icon="tabler:clock"
          color="warning"
          variant="soft"
          class="cursor-pointer underline"
          @click="denseModalOpen = true"
        >
          密集課程
        </UBadge>
        <template #content>
          <div class="flex flex-col gap-1">
            <div
              v-for="({ date, time_location }, index) in denseTime"
              :key="index"
              class="flex flex-row gap-2 items-center"
            >
              <span class="font-bold">{{ date }}</span>
              <span>{{ time_location }}</span>
            </div>
            <div v-if="!denseTime.length" class="text-sm text-dimmed">
              無資料
            </div>
          </div>
        </template>
      </UTooltip>
      <UBadge
        v-if="course?.location"
        v-show="settings.show_info_location"
        icon="tabler:map-pin"
        color="neutral"
        variant="soft"
      >
        {{ course?.location }}
      </UBadge>
      <UBadge
        v-if="course?.gender_restriction"
        v-show="settings.show_others && settings.show_others_gender_restriction"
        icon="tabler:gender-bigender"
        color="warning"
        variant="soft"
      >
        {{
          genderRestrictionMap[course.gender_restriction] ||
          course.gender_restriction
        }}
      </UBadge>
    </div>
    <div
      class="course-info order-4 badge-group flex flex-wrap gap-y-1 gap-x-2 pt-2"
      v-show="settings.show_info2"
    >
      <UBadge
        v-show="settings.show_info2_credits"
        variant="soft"
        :color="course?.credits ? 'neutral' : 'warning'"
      >
        {{ course?.credits }} 學分
      </UBadge>
      <UBadge
        v-show="settings.show_info2_course_category"
        variant="soft"
        color="neutral"
      >
        {{
          course?.course_category
            ? optionMap[course.course_category as keyof typeof optionMap] ||
              course.course_category
            : ""
        }}
      </UBadge>
      <UBadge
        v-if="course?.class_kind"
        v-show="settings.show_others && settings.show_others_class_kind"
        variant="soft"
        color="neutral"
      >
        {{ classKindMap[course.class_kind] || course.class_kind }}
      </UBadge>
      <UBadge
        v-if="course?.general_education"
        v-for="item in course.general_education.split('/')"
        v-show="settings.show_info2_general_education"
        :key="item"
        icon="tabler:blocks"
        color="neutral"
        variant="soft"
      >
        {{ generalCoreMap[item as keyof typeof generalCoreMap] || item }}
      </UBadge>
      <UBadge
        v-if="course?.limit_enrollment !== undefined"
        v-show="settings.show_info2_limit_enrollment"
        icon="tabler:users"
        :color="course?.limit_enrollment || 0 > 0 ? 'neutral' : 'warning'"
        variant="soft"
      >
        <span v-show="settings.show_others && settings.show_others_enrolled">
          {{ course.count_enrolled_without_authorized }} /
        </span>
        {{
          course?.limit_enrollment ? `${course.limit_enrollment} 人` : "無資料"
        }}
      </UBadge>
      <UBadge
        v-if="course?.limit_authorized !== undefined"
        v-show="settings.show_others && settings.show_others_limit_authorized"
        icon="tabler:lock"
        :color="
          course?.limit_authorized &&
          !(
            settings.show_others &&
            settings.show_others_count_used_authorized &&
            course.count_used_authorized >= course.limit_authorized
          )
            ? 'neutral'
            : 'warning'
        "
        variant="soft"
      >
        <span
          v-show="
            settings.show_others &&
            settings.show_others_count_used_authorized &&
            course.limit_authorized
          "
        >
          {{ course.count_used_authorized }} /
        </span>
        {{
          course.limit_authorized
            ? course.limit_authorized + " 授權碼"
            : "無授權碼"
        }}
      </UBadge>
      <UBadge
        v-if="course?.limit_system !== undefined"
        v-show="settings.show_others && settings.show_others_limit_system"
        :color="course?.limit_system > 0 ? 'neutral' : 'warning'"
        variant="soft"
      >
        {{
          course?.limit_system
            ? course.limit_system + " 系統開放名額"
            : "無系統開放名額"
        }}
      </UBadge>
      <UBadge
        v-if="course?.english_teaching"
        v-show="settings.show_info2_english_teaching"
        icon="tabler:language"
        color="error"
        variant="soft"
      >
        英文授課
      </UBadge>
      <UBadge
        v-if="course?.credit_program"
        v-for="item in course.credit_program.split('/')"
        v-show="settings.show_info2_credit_program"
        :key="item"
        icon="tabler:book"
        variant="soft"
        color="neutral"
      >
        {{ programMap[item] || item }}
      </UBadge>
    </div>
    <div
      class="course-comment order-5 flex flex-col justify-center text-sm whitespace-pre-wrap row-span-2"
    >
      <div
        :class="[
          'course-button flex flex-row items-center justify-end gap-2',
          'max-md:absolute max-md:right-4 max-md:top-4',
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
          @update:isAdded="isAdded = $event"
        />
      </div>
      <span
        v-if="course?.restriction"
        v-show="settings.show_info3 && settings.show_info3_restriction"
        class="pt-1 text-xs"
      >
        {{
          course.restriction.replace(/<\/br>/g, "\n").replace(/(?<=.)◎/g, "\n◎")
        }}
      </span>
      <span
        v-if="course?.comment"
        v-show="settings.show_info3 && settings.show_info3_comment"
        class="pt-1 text-xs"
      >
        {{ course.comment.replace(/<\/br>/g, "\n") }}
      </span>
    </div>
    <UModal
      v-if="course?.intensive"
      v-model:open="denseModalOpen"
      title="密集課程時間"
      class="max-w-3xl"
    >
      <template #body
        ><UCalendar
          v-model="denseDate"
          :view-controls="false"
          :year-controls="false"
          :number-of-months="windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3"
          :fixed-weeks="false"
          locale="zh-TW"
          readonly
          :ui="{
            cellTrigger: 'data-selected:data-outside-view:bg-primary/50',
          }"
      /></template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  optionMap,
  generalCoreMap,
  classKindMap,
  genderRestrictionMap,
} from "@/composables/useConstants";
import {
  type Course,
  type CourseTableSettings,
  defaultCourseTableSettings,
} from "@/composables/useCourseTable";
import { CalendarDate } from "@internationalized/date";

const props = defineProps({
  course: {
    type: Object as () => Course | undefined,
    required: true,
  },
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const isAdded = ref(false);

const settings = useState<CourseTableSettings>("courseTableSettings", () => ({
  ...defaultCourseTableSettings,
})); // TODO: local storage

const programs = useState("programDropdownItems");
const programMap = useState<Record<string, string>>("programMap", () => {
  const map: Record<string, string> = {};
  for (const program of programs.value as Array<{
    value: string;
    label: string;
  }>) {
    if (program.value && program.label) {
      map[program.value] = program.label;
    }
  }
  return map;
});

const yt = computed(() => `${props.course?.year}-${props.course?.term}`);
const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);

const denseModalOpen = ref(false);
const denseDataAllTerms = useState(
  "denseDataAllTerms",
  () => <Record<string, any>>{},
);
const denseTime = computed<{ date: string; time_location: string }[]>(() => {
  if (!props.course || !props.course.intensive) return [];
  return (
    denseDataAllTerms.value[yt.value]?.[
      props.course.course_code + "-" + props.course.course_group
    ] || []
  );
});
const denseDate = computed(() =>
  denseTime.value
    .map((item) => {
      // item.date is in format of "YYYYMMDD(DayOfWeek)"
      const dateStr = item.date.slice(0, 8);
      const year = parseInt(dateStr.slice(0, 4), 10);
      const month = parseInt(dateStr.slice(4, 6), 10);
      const day = parseInt(dateStr.slice(6, 8), 10);
      return new CalendarDate(year, month, day);
    })
    .reverse(),
);

onMounted(() => {
  isAdded.value = isCourseInTimetable(yt.value, props.course as Course);
});
</script>
