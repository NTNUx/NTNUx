<template>
  <div
    class="course-row grid p-2 border-b-2 border-gray-200 w-full gap-2 items-center"
  >
    <div class="course-code flex flex-col shrink-0 grow-0">
      <span> {{ course?.id }}</span>
      <span>{{ course?.course_code }}</span>
    </div>
    <div class="course-title flex flex-col justify-center gap-2">
      <span class="course-name">
        <ULink
          as="button"
          :to="{
            path:
              course?.year &&
              course?.term &&
              (course?.id || course?.course_code)
                ? '/courses/' +
                  `${course.year}/${course.term}/${
                    course.id || course.course_code + '-' + course?.course_group
                  }/${encodeURIComponent(course?.name)}`
                : '#',
          }"
        >
          {{ course?.name }}
        </ULink>
      </span>
      <div class="badge-group flex flex-wrap gap-y-1 gap-x-2">
        <UBadge icon="tabler:building" variant="soft" color="neutral">
          {{ course?.department }}
        </UBadge>
        <UBadge icon="tabler:user" variant="soft" color="neutral">
          {{ course?.teacher }}
        </UBadge>
        <UBadge
          v-if="course?.time && !course?.intensive"
          icon="tabler:clock"
          :color="
            course.time.join('/').match(/.* (0|1)([-/\n\r]|$)/)
              ? 'warning'
              : 'neutral'
          "
          variant="soft"
        >
          {{ course.time.join("/") }}
        </UBadge>
        <UBadge
          v-if="course?.intensive"
          icon="tabler:clock"
          color="warning"
          variant="soft"
          style="cursor: pointer"
          @click="toggle($event)"
        >
          <div style="text-decoration: underline">密集課程</div>
        </UBadge>
        <UBadge
          icon="tabler:map-pin"
          color="neutral"
          variant="soft"
          v-if="course?.location"
        >
          {{ course?.location }}
        </UBadge>
      </div>
    </div>
    <div class="course-info flex flex-col justify-center gap-2">
      <div class="badge-group flex flex-wrap gap-y-1 gap-x-2">
        <UBadge variant="soft" color="neutral">
          {{ course?.credits }} 學分
        </UBadge>
        <UBadge variant="soft" color="neutral">
          {{
            course?.course_category
              ? optionMap[course.course_category] || course.course_category
              : ""
          }}
        </UBadge>
        <UBadge
          v-if="course?.general_education"
          v-for="item in course.general_education.split('/')"
          :key="item"
          icon="tabler:blocks"
          color="neutral"
          variant="soft"
        >
          {{ generalCoreMap[item] || item }}
        </UBadge>
        <UBadge
          v-if="course?.credit_program"
          v-for="item in course.credit_program"
          :key="item"
          icon="tabler:book"
          variant="soft"
          color="neutral"
        >
          {{ item }}
        </UBadge>
        <UBadge
          icon="tabler:users"
          :color="course?.limit_enrollment || 0 > 0 ? 'neutral' : 'warning'"
          variant="soft"
        >
          {{
            course?.limit_enrollment
              ? `${course.limit_enrollment} 人`
              : "無資料"
          }}
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
    </div>
    <div class="course-comment flex flex-col justify-center gap-2">
      <span v-if="course?.restriction">
        {{
          course.restriction.replace(/<\/br>/g, "\n").replace(/(?<=.)◎/g, "\n◎")
        }}
      </span>
      <span v-if="course?.comment">
        {{ course.comment.replace(/<\/br>/g, "\n") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Course } from "@/composables/useCourseTable";

defineProps({
  course: {
    type: Object as () => Course | undefined,
    required: true,
  },
});

const optionMap = <Record<string, string>>{
  必: "必修",
  選: "選修",
  通: "通識",
};
const generalCoreMap = <Record<string, string>>{
  A1UG: "人文藝術",
  A2UG: "社會科學",
  A3UG: "自然科學",
  A4UG: "邏輯運算",
  B1UG: "學院共同課程",
  B2UG: "跨域專業探索課程",
  B3UG: "大學入門",
  C1UG: "專題探究",
  C2UG: "MOOCs",
};

const densePopover = ref();
const denseData = useState("denseData", () => <Record<string, any>>{});
const toggle = (e: any) => {
  if (densePopover.value) {
    densePopover.value.toggle(e);
  }
};
</script>

<style lang="scss">
.course-row {
  grid-template-columns: 64px 6fr 6fr 7fr auto;
}
</style>
