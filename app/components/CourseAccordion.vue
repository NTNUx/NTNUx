<template>
  <div>
    <UAccordion
      :items="accordionItems"
      v-model="accordionModel"
      type="multiple"
      trailingIcon="tabler:chevron-down"
      :ui="{
        trigger: 'cursor-default bg-gray-100 dark:bg-gray-700 px-4',
        body: 'text-md text-default px-4',
        trailingIcon: 'collapse',
      }"
    >
      <template #default="{ item, index, open }">
        <div class="ps-1.5">
          <span class="text-base">{{ item.label }}</span>
        </div>
      </template>

      <template #body="{ item, index, open, ui }">
        <p
          v-for="c in (item as AccordionItem).content
            ?.replace(/<\/br>/g, '\n')
            .replace(/(?<=.)◎/g, '\n◎')
            .split('\n') || []"
          v-html="c"
          class="whitespace-pre-wrap indent-8"
        ></p>
      </template>
      <template #description-body="{ item, index, open, ui }">
        <p
          v-html="(item as AccordionItem).content"
          class="whitespace-pre-wrap indent-8"
        ></p>
      </template>
      <template #user-count-body="{ item, index, open, ui }">
        <div
          class="sm:ml-4 mb-2 flex flex-row items-end gap-4 sm:gap-8 select-none"
        >
          <div v-for="c in (item as AccordionItem).contents || []">
            <span class="text-sm max-[420px]:text-xs">{{ c.label }}</span>
            <div class="flex items-end gap-1 font-mono">
              <span v-if="c.current !== null" class="text-4xl font-bold">{{
                c.current
              }}</span>
              <span v-if="c.current !== null">/</span>
              <span
                :class="{
                  'text-4xl font-bold': c.current === null,
                  'text-sm': c.current !== null,
                }"
                >{{ c.max === undefined ? "無" : c.max }}</span
              >
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { Course } from "@/composables/useCourseTable";

const props = defineProps({
  course: {
    type: Object as () => Course | undefined,
    required: true,
  },
});
const course = computed(() => {
  return props.course;
});

const accordionItems = computed<AccordionItem[]>(() => [
  {
    label: "限修條件",
    icon: "tabler:alert-triangle",
    content: course.value?.restriction
      ? course.value.restriction
          .replace(/<\/br>/g, "\n")
          .replace(/(?<=.)◎/g, "\n◎")
      : "無",
    disabled: !course.value?.restriction,
  },
  {
    label: "備註",
    icon: "tabler:notes",
    content: course.value?.comment
      ? course.value.comment.replace(/<\/br>/g, "\n")
      : "無",
    disabled: !course.value?.comment,
  },
  {
    label: "選課資訊",
    icon: "tabler:users",
    contents: [
      {
        label: "選課總人數",
        current: course.value?.count_enrolled_without_authorized,
        max: course.value?.limit_enrollment,
      },
      {
        label: "已使用授權碼",
        current: course.value
          ? Math.max(
              0,
              course.value.count_enrolled -
                course.value.count_enrolled_without_authorized,
            )
          : null,
        max: course.value?.limit_authorized,
      },
      {
        label: "系統各校開放名額",
        current: null,
        max: course.value?.limit_system,
      },
    ],
    slot: "user-count",
  },
  {
    label: "課程簡介",
    icon: "tabler:bookmark",
    content: course.value?.description,
    disabled: !course.value?.description,
    slot: "description",
  },
]);
const accordionModel = ref<string[]>(
  accordionItems.value.reduce<string[]>((acc, item, index) => {
    if (!item.disabled) {
      acc.push(index.toString());
    }
    return acc;
  }, []),
);

watch(
  () => course.value?.description,
  () => {
    if (course.value?.description) {
      // If description becomes available, ensure the "課程簡介" section is open
      if (!accordionModel.value.includes("3")) {
        accordionModel.value.push("3");
      }
    } else {
      // If description becomes unavailable, remove the "課程簡介" section from the open state
      accordionModel.value = accordionModel.value.filter((key) => key !== "3");
    }
  },
);
</script>
