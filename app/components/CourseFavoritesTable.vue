<template>
  <div class="sm:px-2">
    <UAccordion
      ref="accordion"
      :items="favoriteAccordionItems"
      v-model="selectedFavorite"
      type="multiple"
      class="w-full max-w-3xl mx-auto"
      :ui="{
        item: 'mb-2 shadow-sm rounded-xl',
        header:
          'bg-gray-500/5 p-2 rounded-xl data-[state=open]:rounded-b-none cursor-pointer',
        trigger: 'cursor-pointer',
        content: 'bg-gray-500/1 rounded-b-xl',
        body: 'pb-0',
      }"
    >
      <template
        v-if="sorting || deleting || editing || shared"
        #leading="{ item, index }"
      >
        <Icon
          v-if="!shared && sorting"
          class="cursor-ns-resize text-dimmed hover:text-primary size-5 ml-2"
          title="拖曳以調整順序"
          name="tabler:menu-order"
        />
        <UButton
          v-if="!shared && deleting"
          color="error"
          variant="link"
          icon="tabler:trash"
          class="py-0 cursor-pointer"
          title="刪除課程"
          @click="
            () => {
              courseToDelete = index;
              deleteModalOpen = true;
            }
          "
          @click.stop
        />
        <UButton
          v-if="!shared && editing && item.type.startsWith('h')"
          color="primary"
          variant="link"
          icon="tabler:pencil"
          class="py-0 cursor-pointer"
          title="編輯標題"
          @click="
            () => {
              courseToEdit = index;
              headerModalOpen = true;
            }
          "
          @click.stop
        />
        <CourseFavoritesButton
          v-if="item.type === 'course' && shared"
          :course-name="courseNameMap[favoriteCourses[index] || '']"
          :course-code="favoriteCourses[index]"
          @click.stop
          class="py-0"
        />
      </template>
      <template #body="{ item }">
        <CourseFavoritesRow
          v-for="course in item.courses"
          :key="`${course?.year}-${course?.term}-${course?.course_group}`"
          :course="course"
          class="even:bg-gray-500/5 last:pb-3.5"
        />
        <div
          v-if="item.courses?.length === 0"
          class="text-center text-dimmed py-4"
        >
          在選擇的學期中沒有找到課程資料，嘗試選擇其它學期
        </div>
      </template>
    </UAccordion>
    <div
      v-if="favoriteAccordionItems.length === 0"
      class="text-center text-dimmed py-10"
    >
      沒有收藏的課程
    </div>
    <UModal
      v-if="courseToDelete !== null"
      :title="`刪除：${courseNameMap[favoriteCourses[courseToDelete] || ''] || favoriteCourses[courseToDelete]}`"
      description="確定要刪除？"
      :ui="{ header: 'py-2', footer: 'justify-end py-2', content: 'max-w-md' }"
      v-model:open="deleteModalOpen"
    >
      <template #footer>
        <UButton
          label="取消"
          variant="outline"
          class="mr-auto"
          @click="deleteModalOpen = false"
        />
        <UButton label="確定" color="error" @click="deleteCourse()" />
      </template>
    </UModal>
    <UModal
      v-if="courseToEdit !== null"
      :title="`編輯標題：${favoriteCourses[courseToEdit]?.replace('NTNUx-', '')}`"
      description="輸入新的標題"
      :ui="{ header: 'py-2', footer: 'justify-end py-2', content: 'max-w-md' }"
      v-model:open="headerModalOpen"
    >
      <template #body>
        <UInput
          v-model="courseNameMap[favoriteCourses[courseToEdit] || '']"
          placeholder="標題名稱"
          class="w-full"
        />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type {
  FavoriteCourses,
  CourseNameMap,
} from "@/composables/useFavorites";
import { saveFavoriteCourses } from "@/composables/useFavorites";
import {
  useSortable,
  moveArrayElement,
} from "@vueuse/integrations/useSortable";

const { favoriteCourses, courseNameMap, shared } = defineProps<{
  favoriteCourses: FavoriteCourses;
  courseNameMap: CourseNameMap;
  shared?: boolean | undefined;
}>();

const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));
const config = useRuntimeConfig();
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (config.public.ntnuxDefaultTerm as string) || "",
);
const selectedTerm = useState<string[]>("selectedTerm", () => [
  defaultTerm.value,
]);

const selectedFavorite = useState<string[]>("selectedFavorite", () => []);

function getCourseData(course_code: string) {
  const courses = [];
  for (const term of selectedTerm.value) {
    const termData = dataAllTerms.value[term];
    if (!termData) continue;
    const matchedCourses = termData.filter(
      (course) => course.course_code === course_code,
    );
    courses.push(...matchedCourses);
  }
  if (!courseNameMap[course_code] && courses?.[0]) {
    courseNameMap[course_code] = courses[0].name;
  }
  return courses;
}

const headerUI = {
  item: "shadow-none",
  header: "bg-transparent cursor-default",
  trigger: "cursor-default p-0 opacity-100",
  trailingIcon: "hidden",
  content: "hidden",
} as const;
const hideEmptyCourses = useState<boolean>("hideEmptyCourses", () => false);
const favoriteAccordionItems = computed<any>(() => {
  return favoriteCourses
    .map((course_code) => {
      if (course_code.startsWith("NTNUx-")) {
        if (course_code.startsWith("NTNUx-h1-")) {
          return {
            label: courseNameMap[course_code] || "h1",
            disabled: true,
            ui: {
              ...headerUI,
              label: courseNameMap[course_code]
                ? "text-xl font-bold"
                : "text-xl font-bold italic text-dimmed",
            },
            type: "h1",
          };
        } else if (course_code.startsWith("NTNUx-h2-")) {
          return {
            label: courseNameMap[course_code] || "h2",
            disabled: true,
            ui: {
              ...headerUI,
              label: courseNameMap[course_code]
                ? "text-lg font-semibold ml-8"
                : "text-lg font-semibold ml-8 italic text-dimmed",
            },
            type: "h2",
          };
        } else if (course_code.startsWith("NTNUx-h3")) {
          return {
            label: courseNameMap[course_code] || "h3",
            disabled: true,
            ui: {
              ...headerUI,
              label: courseNameMap[course_code]
                ? "text-base font-medium ml-16"
                : "text-base font-medium ml-16 italic text-dimmed",
            },
            type: "h3",
          };
        } else if (course_code.startsWith("NTNUx-separator")) {
          return {
            disabled: true,
            ui: {
              item: "rounded-none shadow-none border-x-0 border-t-0 border-b border-inverted/50 my-2",
              header: "bg-transparent cursor-default py-0",
              trigger: "cursor-default p-0 opacity-100 border-none",
              trailingIcon: "hidden",
              content: "hidden",
              label: "p-0 h-0",
            },
            type: "separator",
          };
        }
      }
      const courses = getCourseData(course_code);
      return {
        label: courseNameMap[course_code]
          ? `${course_code}（${courseNameMap[course_code]}）`
          : course_code,
        courses: courses,
        type: "course",
      };
    })
    .filter((item: any) => {
      if (hideEmptyCourses.value && item.type === "course") {
        return item?.courses?.length || 0 > 0;
      }
      return true;
    });
});

const deleting = useState<boolean>("deleting", () => false);
const deleteModalOpen = ref(false);
const courseToDelete = ref<number | null>(null);
function deleteCourse() {
  if (!courseToDelete.value) return;
  deleteModalOpen.value = false;
  if (courseToDelete.value < favoriteCourses.length) {
    favoriteCourses.splice(courseToDelete.value, 1);
    saveFavoriteCourses();
  }
}
const sorting = useState<boolean>("sorting", () => false);
const accordion = useTemplateRef<HTMLElement>("accordion");
const { start, stop } = useSortable(accordion, favoriteCourses, {
  animation: 150,
  onStart: () => {
    // Prevent accordion from changing selected item when dragging
    selectedFavorite.value = [];
  },
  onUpdate: (e: any) => {
    moveArrayElement(favoriteCourses, e.oldIndex, e.newIndex, e);
    nextTick(() => {
      saveFavoriteCourses();
    });
  },
} as any);
watch(sorting, (newVal) => {
  if (newVal) {
    start();
  } else {
    stop();
  }
});
const editing = useState<boolean>("editing", () => false);
const courseToEdit = ref<number | null>(null);
const headerModalOpen = ref(false);

onMounted(() => {
  if (shared || !sorting.value) {
    stop();
  } else {
    start();
  }
});

defineShortcuts({
  meta_delete: {
    handler() {
      if (deleteModalOpen.value && courseToDelete.value !== null) {
        deleteCourse();
      } else if (favoriteCourses.length > 0) {
        courseToDelete.value = favoriteCourses.length - 1;
        deleteModalOpen.value = true;
      }
    },
  },
});
</script>
