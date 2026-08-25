<template>
  <div>
    <UCollapsible
      v-for="item in infoItems"
      :key="item.label || item.title"
      class="w-full"
      v-model:open="item.collapsed"
    >
      <UContextMenu :items="item.contentMenu" :disabled="!item.contentMenu">
        <UButton
          variant="ghost"
          :disabled="item.disabled"
          :class="[
            'w-full min-h-10 text-left rounded-sm border-none',
            'disabled:cursor-default group',
          ]"
          :style="{
            cursor: item.cursor,
          }"
          @click="item.click && item.click()"
          :to="item.to && item.to"
          :target="item.target && item.target"
        >
          <template #default>
            <div class="w-full flex flex-row items-center">
              <div class="me-2 size-4">
                <UIcon
                  :name="item.icon"
                  class="size-4"
                  :class="
                    item.disabled || (item as any)?.textGray
                      ? 'text-dimmed'
                      : 'text-default'
                  "
                />
              </div>
              <div class="ps-1.5 flex flex-col">
                <span v-if="item?.label" class="text-xs text-dimmed">{{
                  item.label
                }}</span>
                <span
                  class="text-base"
                  :class="
                    item.disabled || (item as any)?.textGray
                      ? 'text-dimmed'
                      : 'text-default'
                  "
                  >{{ item.title }}</span
                >
              </div>
              <UIcon
                v-if="item.trailingIcon"
                :name="item.trailingIcon"
                class="rounded-none ml-auto group-hover:visible group-hover:text-default border-0 size-5 p-0 text-dimmed"
                :class="
                  item.trailingIconShown ? 'visible' : 'pointer-fine:collapse'
                "
              ></UIcon>
            </div>
          </template>
        </UButton>
      </UContextMenu>

      <template #content>
        <div v-if="item.content && item.content.length" class="pl-2">
          <UButton
            v-for="child in item.content"
            :key="child.label"
            :label="child.label"
            :icon="child.icon"
            @click="child.click && child.click()"
            :to="child?.to"
            :target="child?.target"
            :trailing-icon="child.trailingIcon"
            block
            class="text-left rounded-sm border-none h-10"
            variant="ghost"
            :ui="{ label: 'mr-auto', ...(child?.ui || {}) }"
          />
        </div>
      </template>
    </UCollapsible>
    <UModal scrollable v-model:open="infoModalOpen" title="原始資料" size="2xl">
      <template #body>
        <pre class="whitespace-pre-wrap break-all">{{ course }}</pre>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from "@nuxt/ui";
import type { Course } from "@/composables/useCourseTable";

import {
  optionMap,
  locationMap,
  generalCoreMap,
} from "@/composables/useConstants";
import { copyToClipboard } from "@/composables/useTools";

const props = defineProps({
  course: {
    type: Object as () => Course | undefined,
    required: true,
  },
  denseTime: {
    type: Array as () => { date: string; time_location: string }[],
    required: false,
  },
});
const emit = defineEmits(["click:dense-time"]);

const course = computed(() => {
  return props.course;
});
const denseTime = computed(() => {
  return props.denseTime || [];
});
const programMap = useState<Record<string, string>>(
  "programMap",
  () =>
    (jsonLzDecode(
      useRuntimeConfig().public.ntnuxProgramsLz as string,
    ) as Record<string, string>) || {},
);
const programs = useState(
  "programDropdownItems",
  () =>
    Object.entries(programMap.value).map(([key, value]) => ({
      value: key,
      label: value,
    })) || [],
);

interface CourseInfoItem {
  icon: string;
  label: string;
  title: string;
  disabled?: boolean;
  trailingIcon?: string;
  trailingIconShown?: boolean;
  cursor?: string;
  click?: () => void;
  to?: string;
  target?: string;
  contentMenu?: Array<ContextMenuItem>;
  content?: Array<{
    label: string;
    icon: string;
    click?: () => void;
    to?: string;
    target?: string;
    trailingIcon?: string;
    ui?: Record<string, any>;
  }>;
  collapsed?: any;
}
const infoItems = computed<CourseInfoItem[]>(
  () =>
    [
      {
        icon: "tabler:hash",
        label: "開課序號",
        title: course.value?.id || "尚未公布",
        disabled: !course.value?.id,
        trailingIcon: "tabler:copy",
        cursor: "pointer",
        click: () => {
          if (course.value?.id) {
            copyToClipboard(course.value.id, "開課序號");
          }
        },
        contentMenu: [
          {
            label: "複製開課序號",
            icon: "tabler:copy",
            onSelect: () => {
              if (course.value?.id) {
                copyToClipboard(course.value.id, "開課序號");
              }
            },
          },
          {
            label: "搜尋開課序號",
            icon: "tabler:search",
            to: `/search/quick?s=${decodeURIComponent("$id:" + (course.value?.id || ""))}`,
          },
        ],
      },
      {
        icon: "tabler:code",
        label: "科目代碼",
        title: course.value?.course_code,
        disabled: !course.value?.course_code,
        trailingIcon: "tabler:copy",
        cursor: "pointer",
        click: () => {
          if (course.value?.course_code) {
            copyToClipboard(course.value.course_code, "科目代碼");
          }
        },
        contentMenu: [
          {
            label: "複製科目代碼",
            icon: "tabler:copy",
            onSelect: () => {
              if (course.value?.course_code) {
                copyToClipboard(course.value.course_code, "科目代碼");
              }
            },
          },
          {
            label: "搜尋科目代碼",
            icon: "tabler:search",
            to: `/search/quick?s=${decodeURIComponent("$course_code:" + (course.value?.course_code || ""))}`,
          },
        ],
      },
      {
        icon: "tabler:building",
        label: "開課單位",
        title: course.value?.department,
        disabled: !course.value?.department,
        contentMenu: course.value?.department
          ? [
              {
                label: "搜尋開課單位",
                icon: "tabler:search",
                to: `/search/dept?d=${encodeURIComponent(course.value?.department_code || "")}`,
              },
              {
                label: "複製開課單位名稱",
                icon: "tabler:copy",
                onSelect: () => {
                  if (course.value?.department) {
                    copyToClipboard(course.value.department, "開課單位名稱");
                  }
                },
              },
              {
                label: "複製開課單位代碼",
                icon: "tabler:copy",
                onSelect: () => {
                  if (course.value?.department_code) {
                    copyToClipboard(
                      course.value.department_code,
                      "開課單位代碼",
                    );
                  }
                },
              },
            ]
          : undefined,
      },
      course.value?.course_category === "通"
        ? {
            icon: "tabler:layout-dashboard",
            title: "通識",
            content: course.value?.general_education
              ? course.value.general_education.split("/").map((cat) => ({
                  label: generalCoreMap[cat] || cat,
                  to: `/search/general?g=${encodeURIComponent(cat)}`,
                  trailingIcon: "tabler:filter-search",
                }))
              : undefined,
            collapsed: generalCollapsed,
            click: () => {
              generalCollapsed.value = !generalCollapsed.value;
            },
          }
        : {
            icon: "tabler:layout-dashboard",
            title: course.value?.course_category
              ? optionMap[course.value.course_category] ||
                course.value.course_category
              : "不明課程類別",
            disabled: !course.value?.course_category,
          },
      {
        icon: "tabler:school",
        title: course.value?.credits
          ? `${course.value.credits} 學分`
          : "學分數",
        disabled: course.value?.credits === undefined,
      },
      {
        icon: "tabler:users",
        label: "授課教師",
        title: course.value?.teacher ? course.value.teacher : "未定",
        disabled: !course.value?.teacher || course.value?.teacher === "未定",
      },
      course.value?.intensive && denseTime.value.length
        ? {
            icon: "tabler:calendar-time",
            title: "密集課程時間地點",
            disabled: false,
            cursor: "pointer",
            content: denseTime.value.map((dt) => ({
              label: `${dt.date} ${dt.time_location}`,
              ui: {
                base: "py-1 h-auto!",
              },
              click: () => {
                emit("click:dense-time");
              },
            })),
            click: () => {
              emit("click:dense-time");
            },
            collapsed: true,
          }
        : {
            icon: "tabler:clock",
            label: course.value?.time?.length ? "上課時間" : undefined,
            title: course.value?.time?.length
              ? course.value.time.join("/")
              : "無上課時間資料",
            disabled: !course.value?.time?.length,
          },
      course.value?.location
        ? (course.value?.location.search("/") || -1) >= 0
          ? {
              icon: "tabler:map-pin",
              label: locationCollapsed.value ? undefined : "上課地點",
              title: locationCollapsed.value
                ? "上課地點"
                : course.value.location,
              disabled: false,
              cursor: "pointer",
              trailingIcon: locationCollapsed.value
                ? undefined
                : "tabler:map-down",
              trailingIconShown: true,
              content: course.value.location.split("/").map((loc) => ({
                label: loc,
                trailingIcon: getMapLink(loc) ? "tabler:map-search" : undefined,
                to: getMapLink(loc),
                target: getMapLink(loc) ? "_blank" : undefined,
              })),
              click: () => {
                locationCollapsed.value = !locationCollapsed.value;
              },
              collapsed: locationCollapsed,
            }
          : {
              icon: "tabler:map-pin",
              label: "上課地點",
              title: course.value.location,
              disabled: false,
              trailingIcon: getMapLink(course.value.location)
                ? "tabler:map-search"
                : undefined,
              cursor: "pointer",
              trailingIconShown: true,
              to: getMapLink(course.value.location),
              target: getMapLink(course.value.location) ? "_blank" : undefined,
            }
        : {
            icon: "tabler:map-pin",
            title:
              course.value?.intensive && denseTime.value.length
                ? "密集課程"
                : "無上課地點資訊",
            disabled: true,
          },
      {
        icon: "tabler:language",
        title: course.value?.english_teaching
          ? "英文授課"
          : course.value?.comment?.match(/◎*語\s*授課/)
            ? "國家語言授課"
            : "中文授課",
      },
      course.value?.credit_program
        ? course.value.credit_program.split("/").length > 1
          ? {
              icon: "tabler:book",
              label: programCollapsed.value ? undefined : "學分學程",
              title: programCollapsed.value
                ? "學分學程"
                : `${course.value.credit_program.split("/").length} 個學分學程`,
              disabled: false,
              trailingIcon: programCollapsed.value
                ? undefined
                : "tabler:filter-search",
              cursor: "pointer",
              content: course.value.credit_program.split("/").map((item) => ({
                label: programMap.value[item] || item,
                to: `/search/program?p=${encodeURIComponent(item)}`,
                trailingIcon: "tabler:filter-search",
              })),
              click: () => (programCollapsed.value = !programCollapsed.value),
              collapsed: programCollapsed,
            }
          : {
              icon: "tabler:book",
              label: "學分學程",
              title:
                programMap.value[course.value.credit_program] ||
                course.value.credit_program,
              disabled: false,
              trailingIcon: "tabler:filter-search",
              cursor: "pointer",
              to: `/search/program?p=${encodeURIComponent(
                course.value.credit_program,
              )}`,
            }
        : {
            icon: "tabler:book",
            title: "無學分學程",
            disabled: true,
          },
      {
        icon: "tabler:info-circle",
        title: "原始資料",
        cursor: "pointer",
        click: () => {
          infoModalOpen.value = true;
        },
        textGray: true,
      },
    ] as CourseInfoItem[],
);
const generalCollapsed = ref(true);
const deseTimeCollapsed = ref(true);
const locationCollapsed = ref(false);
const programCollapsed = ref(true);
const infoModalOpen = ref(false);

function getMapLink(location: string): string | undefined {
  if (
    !location ||
    location.startsWith("校外") ||
    location.startsWith("◎") ||
    location.includes("教室自排") ||
    location.includes("請洽系所辦")
  )
    return undefined;

  const map = ref(`query=${encodeURIComponent(location.trim())}`);
  for (const key in locationMap) {
    if (location.startsWith(key)) {
      map.value = locationMap[key as keyof typeof locationMap] as string;
      return `https://www.google.com/maps/search/?api=1&${map.value}`;
    }
  }
  return undefined;
}
</script>
