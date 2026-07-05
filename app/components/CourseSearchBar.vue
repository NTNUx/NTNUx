<template>
  <div class="search-bar-container w-full flex flex-col justify-center">
    <div
      ref="modeScrollContainer"
      class="breadcrumb-container max-w-full h-fit m-auto max-md:my-1.5 px-2 flex items-center gap-2 hide-scrollbar overflow-x-scroll"
      @scroll.passive="handleScroll"
    >
      <UButton
        v-for="(breadcrumb, index) in modeBreadcrumbs"
        :key="index"
        :label="
          breadcrumb?.active
            ? breadcrumb?.activeLabel || breadcrumb.label
            : breadcrumb.label
        "
        variant="link"
        :color="breadcrumb?.active ? 'primary' : 'neutral'"
        size="xl"
        class="px-2 cursor-pointer"
        @click="
          () => {
            breadcrumb.do?.();
          }
        "
      />
    </div>
    <div
      class="relative search-bar max-w-3xl w-4/5 max-md:w-full m-auto max-md:flex-col max-md:items-center"
    >
      <div
        class="flex items-center max-md:flex-col max-md:items-stretch justify-between"
        :class="[
          'w-full md:h-16 md:rounded-full overflow-hidden shadow-xs shadow-gray-400',
          'max-md:rounded-none max-md:h-fit max-md:max-h-33 max-md:shadow-none max-md:border-t-[1.5px] max-md:border-b-[1.5px] max-md:border-gray-200 max-md:dark:border-gray-700',
          'gap-[0.8px] bg-elevated',
        ]"
      >
        <UInput
          ref="input"
          name="globalFilterInput"
          v-model="globalFilterInput"
          color="neutral"
          variant="ghost"
          placeholder=""
          clearable
          :ui="{
            root: 'peer/p',
            base: 'px-8 pb-3 pt-8 peer rounded-none md:rounded-full md:w-[calc(100%+28px)] md:-mr-7 z-40',
          }"
          class="bg-default text-base border-gray-300 search-input w-full max-md:h-16"
          @blur="
            () => {
              globalFilterInput = globalFilterInput.trim();
              updateFiltersToQuery(
                route.path.includes('/search') ? undefined : '/search/quick',
                {
                  s: globalFilterInput.replace(' ', '+') || undefined,
                },
              );
            }
          "
        >
          <label
            :class="[
              'pointer-events-none absolute left-8 z-50', // has text
              !globalFilterInput?.length
                ? 'top-1/2 -translate-y-1/2 object-left text-base text-dimmed ' +
                  'peer-focus:top-1/2 peer-focus:-translate-y-1/1 peer-focus:object-left peer-focus:text-xs peer-focus:text-primary' // no text + focus
                : 'top-1/2 -translate-y-1/1 text-xs text-primary object-left',
              'transition-all duration-200 ease-in-out',
            ]"
          >
            <span class="inline-flex">關鍵字搜尋</span>
          </label>
          <label
            :class="[
              'pointer-events-none absolute left-8 top-8 text-base text-dimmed collapse z-50', // has text
              'peer-placeholder-shown:peer-focus:visible', // focus + placeholder
              'transition-all duration-50 ease-in-out',
            ]"
          >
            <span class="inline-flex">搜尋課程名稱、教師、課程號碼</span>
          </label>
        </UInput>

        <USelectMenu
          v-if="['dept', 'general', 'program'].includes(mode)"
          :items="selectMenuItems"
          v-model="dropdownModel"
          placeholder=""
          multiple
          trailingIcon=""
          ignore-filter
          :content="{
            avoidCollisions: true,
          }"
          :class="[
            'bg-default search-input w-full max-md:h-16 text-base hover:bg-elevated ring-0 p-0',
            'rounded-none md:rounded-full md:-ml-7 z-40',
            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-1/2 before:bg-elevated',
            'before:transition-all before:duration-150 before:ease-in-out hover:before:scale-y-0 peer-has-[input:hover]/p:before:scale-y-0',
          ]"
          @update:model-value="
            mode === 'dept'
              ? deptDropdownOptions.updateHandler()
              : mode === 'general'
                ? generalDropdownOptions.updateHandler()
                : mode === 'program'
                  ? programDropdownOptions.updateHandler()
                  : () => {}
          "
          :resetSearchTermOnSelect="false"
          :search-input="false"
          :ui="{
            label: 'marked [&:has(+_.marked)]:hidden last:hidden',
            separator: 'marked [&:has(+_.marked)]:hidden last:hidden',
          }"
        >
          <template #content-top>
            <UInput
              v-model="selectMenuSearchTerm"
              color="neutral"
              variant="ghost"
              placeholder="搜尋選項"
              clearable
              class="mb-2 w-full p-0"
              :ui="{ base: 'px-4 py-2' }"
            />
          </template>

          <template #default="{ modelValue }">
            <div
              class="cursor-pointer text-base border-gray-300 w-full h-16 px-8 pb-3 pt-8 peer z-39"
            >
              <label
                :class="[
                  'pointer-events-none absolute left-8 top-1/2 z-50',
                  'object-left text-dimmed text-base', // placeholder
                  'transition-all duration-200 ease-in-out',
                  modelValue && modelValue.length > 0
                    ? 'text-primary -translate-y-1/1 text-xs' // labelfloat
                    : '-translate-y-1/2', // placeholder
                ]"
              >
                <span class="inline-flex">{{
                  {
                    dept: "篩選開課單位",
                    general: "篩選通識領域",
                    program: "篩選學分學程",
                  }[mode] || "篩選"
                }}</span>
              </label>
              <label
                :class="[
                  'pointer-events-none absolute left-8 top-8 text-base collapse object-left z-50', // no text
                  modelValue && modelValue.length > 0
                    ? 'visible text-default' // has text
                    : '',
                ]"
              >
                <span class="inline-flex">{{
                  modelValue && modelValue.length > 0
                    ? modelValue.length < 5
                      ? modelValue
                          .map((item: any) => (item as any)?.label)
                          .join(", ")
                      : modelValue
                          .slice(0, 3)
                          .map((item: any) => item.label)
                          .join(", ") + ` +${modelValue.length - 3} more`
                    : {
                        dept: "篩選開課單位",
                        general: "篩選通識領域",
                        program: "篩選學分學程",
                      }[mode] || "篩選"
                }}</span>
              </label>
            </div>
          </template>

          <template #item-leading="{ item }">
            <UBadge
              v-if="(item as any)?.value"
              class="font-bold rounded-full! w-10 justify-center"
              color="secondary"
              variant="soft"
              :label="(item as any)?.value"
            />
          </template>

          <template #item-label="{ item }">
            <span>{{ (item as any)?.label }}</span>
          </template>
        </USelectMenu>
      </div>

      <div
        class="absolute right-0 top-0 h-full w-16 flex items-center justify-center pr-2.5 z-51"
        :class="
          ['dept', 'general', 'program'].includes(mode) ? 'max-md:h-1/2' : ''
        "
      >
        <UButton
          color="primary"
          icon="tabler:search"
          size="xl"
          class="rounded-full cursor-pointer"
          @click="
            () => {
              globalFilterInput = globalFilterInput.trim();
              updateFiltersToQuery(
                route.path.includes('/search') ? undefined : '/search/quick',
                {
                  s: globalFilterInput.replace(' ', '+') || undefined,
                },
              );
            }
          "
        />
      </div>
    </div>
    <div
      class="advanced-search-control max-w-3xl w-4/5 max-md:w-full m-auto px-2 flex items-center gap-2 hide-scrollbar overflow-x-scroll my-4"
    >
      <UDropdownMenu
        :items="dropdownTermOptions"
        :content="{
          align: 'start',
          side: 'bottom',
        }"
      >
        <UButton
          :label="currentTerm || '學期'"
          :color="
            currentTerm
              ? currentTerm === defaultTerm
                ? 'primary'
                : 'warning'
              : 'neutral'
          "
          variant="subtle"
          size="lg"
          icon="tabler:calendar"
        />
      </UDropdownMenu>

      <UButton
        v-if="route.path?.includes('/search') && !isFilterEmpty"
        label="清空篩選"
        color="error"
        variant="subtle"
        size="lg"
        icon="tabler:filter-off"
        class="cursor-pointer gap-1"
        @click="
          () => {
            updateFiltersToQuery(
              route.path.includes('/search') ? undefined : '/search/quick',
              {},
              { clear: true, clearGlobal: true, clearAdvanced: true },
            );
          }
        "
      />
      <UButton
        label="更多篩選"
        size="lg"
        :color="isAdvancedFilterEmpty ? 'neutral' : 'primary'"
        :icon="isAdvancedFilterEmpty ? undefined : 'tabler:filter-plus'"
        :variant="isAdvancedFilterEmpty ? 'outline' : 'subtle'"
        class="cursor-pointer gap-1"
        @click="
          () => {
            advancedSearchOpen = true;
          }
        "
      />
      <UButton
        label="時間篩選"
        size="lg"
        :color="isTimeFilterEmpty ? 'neutral' : 'primary'"
        :icon="isTimeFilterEmpty ? undefined : 'tabler:filter-plus'"
        :variant="isTimeFilterEmpty ? 'outline' : 'subtle'"
        class="cursor-pointer gap-1"
        @click="
          () => {
            advancedTimeSearchOpen = true;
          }
        "
      />
    </div>
    <UModal
      v-model:open="advancedOpen"
      :title="
        advancedSearchOpen
          ? '更多篩選條件'
          : advancedTimeSearchOpen
            ? '時間篩子'
            : '更多篩選條件'
      "
      description="更多篩選條件"
      class="w-[calc(100%-2rem)]"
      :class="
        advancedSearchOpen && advancedTimeSearchOpen ? 'max-w-3xl' : 'max-w-md'
      "
      :ui="{
        header:
          'py-2! min-h-12!' + advancedSearchOpen || advancedTimeSearchOpen
            ? ''
            : 'hidden!',
        description: 'sr-only',
        body: 'p-0! max-h-[80vh] flex flex-row max-md:flex-col gap-px bg-muted',
      }"
      @update:open="
        (open) => {
          if (!open) {
            updateFiltersToQuery(
              route.path.includes('/search') ? undefined : '/search/quick',
              {
                gl: booleanToQueryValue(advancedValues.g_location.value),
                hl: booleanToQueryValue(advancedValues.h_location.value),
                ol: booleanToQueryValue(advancedValues.o_location.value),
                i: booleanToQueryValue(advancedValues.intensive.value),
                e: booleanToQueryValue(advancedValues.english_teaching.value),
                di: booleanToQueryValue(advancedValues.digital_course.value),
                c: advancedValues.credits.value
                  ? advancedValues.credits.value.join(',')
                  : undefined,
                nf:
                  advancedValues.exclude_full.value === true ? '1' : undefined,
                es: advancedValues.exclude.value
                  ? advancedValues.exclude.value.replace(/ /g, '+')
                  : undefined,
                t:
                  timeSelected && timeSelected.size > 0
                    ? Array.from(timeSelected).join(',')
                    : undefined,
                tl: timeLoose ? '1' : undefined,

                oa: undefined,
                ot: undefined,
              },
            );
          }
        }
      "
      :aria-describedby="undefined"
    >
      <template #body>
        <div
          v-if="advancedSearchOpen"
          class="p-4 bg-default flex flex-col gap-4 w-full overflow-auto hide-scrollbar"
        >
          <UFormField
            label="上課地點"
            :ui="{
              label: 'text-base mb-2',
            }"
          >
            <UButton
              v-for="(label, key) in {
                g_location: '公館',
                h_location: '和平',
                o_location: '其它',
              }"
              :key="key"
              :label="label"
              size="xl"
              :color="
                advancedValues[key].value === true
                  ? 'primary'
                  : advancedValues[key].value === false
                    ? 'error'
                    : 'neutral'
              "
              :variant="
                advancedValues[key].value === undefined ? 'outline' : 'subtle'
              "
              @click="
                () => {
                  advancedValues[key].value = getNextBoolean(
                    advancedValues[key].value,
                  );
                }
              "
              class="not-last:mr-2"
            />
          </UFormField>
          <UFormField
            label="上課形式"
            :ui="{
              label: 'text-base mb-2',
            }"
          >
            <UButton
              v-for="(label, key) in {
                intensive: '密集課程',
                english_teaching: '英文授課',
                digital_course: '數位課程',
              }"
              :key="key"
              :label="label"
              size="xl"
              :color="
                advancedValues[key].value === true
                  ? 'primary'
                  : advancedValues[key].value === false
                    ? 'error'
                    : 'neutral'
              "
              :variant="
                advancedValues[key].value === undefined ? 'outline' : 'subtle'
              "
              @click="
                () => {
                  advancedValues[key].value = getNextBoolean(
                    advancedValues[key].value,
                  );
                }
              "
              class="not-last:mr-2"
            />
          </UFormField>
          <UFormField
            label="學分"
            :ui="{
              label: 'text-base mb-2',
            }"
          >
            <UButton
              v-for="(label, key) in {
                '0': '0',
                '1': '1',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5以上',
              }"
              :key="key"
              :label="label"
              size="xl"
              :color="
                advancedValues.credits.value?.includes(parseInt(key))
                  ? 'primary'
                  : 'neutral'
              "
              :variant="
                advancedValues.credits.value?.includes(parseInt(key))
                  ? 'subtle'
                  : 'outline'
              "
              @click="
                () => {
                  if (advancedValues.credits.value?.includes(parseInt(key))) {
                    advancedValues.credits.value =
                      advancedValues.credits.value.filter(
                        (c) => c !== parseInt(key),
                      );
                  } else {
                    advancedValues.credits.value = [
                      ...(advancedValues.credits.value || []),
                      parseInt(key),
                    ].sort((a, b) => a - b);
                  }
                }
              "
              class="not-last:mr-2"
            />
          </UFormField>
          <UFormField
            label="選課資訊"
            :ui="{
              label: 'text-base mb-2',
            }"
          >
            <UButton
              label="排除額滿課程"
              size="xl"
              :color="
                advancedValues.exclude_full.value === true
                  ? 'primary'
                  : advancedValues.exclude_full.value === false
                    ? 'error'
                    : 'neutral'
              "
              :variant="
                advancedValues.exclude_full.value === undefined
                  ? 'outline'
                  : 'subtle'
              "
              @click="
                () => {
                  if (advancedValues.exclude_full.value) {
                    advancedValues.exclude_full.value = undefined;
                  } else {
                    advancedValues.exclude_full.value = true;
                  }
                }
              "
              class="not-last:mr-2"
            />
          </UFormField>
        </div>
        <div
          v-if="advancedTimeSearchOpen"
          class="p-4 bg-default flex flex-col gap-4 w-full overflow-auto hide-scrollbar"
        >
          <div class="w-fit mx-auto">
            <div class="text-base w-full flex h-8 items-center justify-between">
              時間篩選
              <UButton
                v-if="(timeSelected?.size || 0) > 0"
                label="重置"
                color="error"
                variant="outline"
                @click="
                  () => {
                    timeSelected = new Set();
                    removeColumnFilter('time_location_list');
                  }
                "
              />
            </div>
            <div>
              <USwitch
                v-model="timeLoose"
                label="寬鬆篩選"
                description="關閉時為嚴格篩選，不會出現所選節次以外的課程"
                :ui="{
                  container: 'my-auto',
                  description: 'text-xs',
                }"
                class="my-4"
              />
              <CourseTimeSelect />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem, SelectMenuItem } from "@nuxt/ui";
import {
  getGlobalFilterInput,
  updateGlobalFilterByInput,
  removeColumnFilter,
  clearAndSetAllFilters,
} from "~/composables/useCourseFilter";
import { jsonLzDecode } from "~/composables/useTools";

const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);
const config = useRuntimeConfig();
const termList = useState<string[]>("termList", () =>
  config.public.ntnuxTerms
    ? ((config.public.ntnuxTerms as String) || "")
        .split(",")
        .map((term: string) => term.trim())
    : [],
);
const defaultTerm = useState<string>(
  "defaultTerm",
  () => (config.public.ntnuxDefaultTerm as string) || "",
);
const currentTerm = useState<string>("currentTerm", () => defaultTerm.value);

const route = useRoute();
const params = ref(route.params);
const mode = computed(() => {
  return params.value.mode as string;
});

const globalFilterInput = useState("globalFilterInput", () => "");
const globalFilterInputRef = useTemplateRef("input");

// each year in termList is like "114", we need to convert it to "114-1", "114-2", "114-暑期", termList is like ["114", "113", "112"]
const dropdownTermOptions = computed(() => [
  ...termList.value.map((year) => {
    return {
      label: year,

      children: [
        {
          label: `${year}-1`,
          value: `${year}-1`,
          onSelect() {
            currentTerm.value = `${year}-1`;
            updateFiltersToQuery(
              route.path.includes("/search") ? undefined : "/search/quick",
              { y: `${year}-1` },
            );
          },
        },
        {
          label: `${year}-2`,
          value: `${year}-2`,
          onSelect() {
            currentTerm.value = `${year}-2`;
            updateFiltersToQuery(
              route.path.includes("/search") ? undefined : "/search/quick",
              { y: `${year}-2` },
            );
          },
        },
        {
          label: `${year}-暑期`,
          value: `${year}-3`,
          onSelect() {
            currentTerm.value = `${year}-3`;
            updateFiltersToQuery(
              route.path.includes("/search") ? undefined : "/search/quick",
              { y: `${year}-3` },
            );
          },
        },
      ],
    };
  }),
  {
    label: `預設（${defaultTerm.value}）`,
    value: defaultTerm.value,
    onSelect() {
      currentTerm.value = defaultTerm.value;
      updateFiltersToQuery(
        route.path.includes("/search") ? undefined : "/search/quick",
        { y: undefined },
      );
    },
  },
]);

defineShortcuts({
  "/": {
    handler: () => {
      globalFilterInputRef.value?.inputRef?.focus();
    },
  },
  // if enter is pressed while the input is focused, trigger search
  enter: {
    usingInput: "globalFilterInput",
    handler: () => {
      globalFilterInput.value = globalFilterInput.value.trim();
      updateFiltersToQuery(undefined, {
        s: globalFilterInput.value.replace(" ", "+") || undefined,
      });
    },
  },
});

const advancedSearchOpen = ref(false);
const advancedTimeSearchOpen = ref(false);
const advancedOpen = computed({
  get: () => advancedSearchOpen.value || advancedTimeSearchOpen.value,
  set: (value: boolean) => {
    advancedSearchOpen.value = value;
    advancedTimeSearchOpen.value = value;
  },
});
const advancedValues = {
  g_location: ref<boolean | undefined>(undefined),
  h_location: ref<boolean | undefined>(undefined),
  o_location: ref<boolean | undefined>(undefined),

  intensive: ref<boolean | undefined>(undefined),
  english_teaching: ref<boolean | undefined>(undefined),
  digital_course: ref<boolean | undefined>(undefined),

  credits: ref<number[] | undefined>(undefined),
  exclude_full: ref<boolean | undefined>(undefined),

  exclude: ref<string>(""),
};

const timeSelected = useState<Set<string>>(
  "timeSelectedCells",
  () => new Set(),
);
const timeLoose = useState<boolean>("courseTableTimeLoose", () => false);
function getNextBoolean(value: boolean | undefined): boolean | undefined {
  if (value === undefined) {
    return true;
  } else if (value === true) {
    return false;
  } else {
    return undefined;
  }
}
function booleanToQueryValue(value: boolean | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? "1" : "0";
}

interface modeBreadcrumb extends BreadcrumbItem {
  activeLabel?: string;
  do?: Function;
}
const modeScrollContainer = ref<any>(null);
const modeBreadcrumbs = computed<modeBreadcrumb[]>(() => [
  {
    label: "快速",
    activeLabel: "快速搜尋",
    active: mode.value === "quick",
    do: () => {
      updateFiltersToQuery("/search/quick", {}, { clear: true });
    },
  },
  {
    label: "系所",
    activeLabel: "系所課程",
    active: mode.value === "dept",
    do: () => {
      updateFiltersToQuery("/search/dept", {}, { clear: true });
    },
  },
  {
    label: "通識",
    activeLabel: "通識課程",
    active: mode.value === "general",
    do: () => {
      updateFiltersToQuery("/search/general", {}, { clear: true });
    },
  },
  {
    label: "體育",
    activeLabel: "普通體育",
    active: mode.value === "pe",
    do: () => {
      updateFiltersToQuery("/search/pe", {}, { clear: true });
    },
  },
  {
    label: "進階搜尋",
    do: () => {
      updateFiltersToQuery(
        route.path.includes("/search") ? undefined : "/search/quick",
        {
          oa: 1,
          ot: 1,
        },
      );
    },
  },
  {
    label: "國防",
    activeLabel: "全民國防",
    active: mode.value === "nd",
    do: () => {
      updateFiltersToQuery("/search/nd", {}, { clear: true });
    },
  },
  {
    label: "學分學程",
    active: mode.value === "program",
    do: () => {
      updateFiltersToQuery("/search/program", {}, { clear: true });
    },
  },
  {
    label: "校際",
    activeLabel: "臺大系統課程",
    active: mode.value === "interschool",
    do: () => {
      updateFiltersToQuery("/search/interschool", {}, { clear: true });
    },
  },
  {
    label: "英文三",
    active: mode.value === "english3",
    do: () => {
      updateFiltersToQuery("/search/english3", {}, { clear: true });
    },
  },
  {
    label: "英文授課",
    do: () => {
      updateFiltersToQuery(
        route.path.includes("/search") ? undefined : "/search/quick",
        {
          oa: 1,
          e: 1,
        },
      );
    },
  },
]);
const currentScrollPosition = useState("currentScrollPosition", () => 0);
function handleScroll(event: any) {
  currentScrollPosition.value = event.target?.scrollLeft || 0;
}
async function handleBreadcrumbClick() {
  await nextTick();

  if (modeScrollContainer.value) {
    modeScrollContainer.value.scrollLeft = currentScrollPosition.value;
  }
}

const deptDropdownOptions = {
  items: useState<SelectMenuItem[]>(
    "deptDropdownItems",
    () =>
      (jsonLzDecode(
        config.public.ntnuxDepartmentsLz as string,
      ) as SelectMenuItem[]) || [],
  ),
  model: ref<SelectMenuItem[]>([]),
  updateHandler: () => {
    updateFiltersToQuery(
      "/search/dept",
      {
        d:
          deptDropdownOptions.model.value
            ?.map((item: any) => item.value)
            ?.join(",") || undefined,
      },
      { clear: true },
    );
  },
};
const generalDropdownOptions = {
  items: useState<SelectMenuItem[]>(
    "generalDropdownItems",
    () =>
      (jsonLzDecode(
        config.public.ntnuxGeneralsLz as string,
      ) as SelectMenuItem[]) || [],
  ),
  model: ref<SelectMenuItem[]>([]),
  updateHandler: () => {
    updateFiltersToQuery(
      "/search/general",
      {
        g:
          generalDropdownOptions.model.value
            ?.map((item: any) => item.value)
            ?.join(",") || undefined,
      },
      { clear: true },
    );
  },
};
const programDropdownOptions = {
  items: useState<SelectMenuItem[]>(
    "programDropdownItems",
    () =>
      (Object.entries(
        jsonLzDecode(config.public.ntnuxProgramsLz as string) as Record<
          string,
          string
        >,
      ).map(([key, value]) => ({
        value: key,
        label: value,
      })) as SelectMenuItem[]) || [],
  ),
  model: ref<SelectMenuItem[]>([]),
  updateHandler: () => {
    updateFiltersToQuery(
      "/search/program",
      {
        p:
          programDropdownOptions.model.value
            ?.map((item: any) => item.value)
            ?.join(",") || undefined,
      },
      { clear: true },
    );
  },
};
const bufferModel = ref<any>(null);

const selectMenuSearchTerm = ref("");
const dropdownModel = computed({
  get() {
    if (mode.value === "dept") {
      return deptDropdownOptions.model.value;
    } else if (mode.value === "general") {
      return generalDropdownOptions.model.value;
    } else if (mode.value === "program") {
      return programDropdownOptions.model.value;
    }
    return bufferModel.value;
  },
  set(value) {
    if (mode.value === "dept") {
      deptDropdownOptions.model.value = value;
    } else if (mode.value === "general") {
      generalDropdownOptions.model.value = value;
    } else if (mode.value === "program") {
      programDropdownOptions.model.value = value;
    } else {
      bufferModel.value = value;
    }
  },
});
const selectMenuItems = computed(() => {
  switch (mode.value) {
    case "dept":
      return deptDropdownOptions.items.value.filter(
        (item: any) =>
          !item?.value ||
          item?.label.includes(selectMenuSearchTerm.value) ||
          item?.value.includes(selectMenuSearchTerm.value),
      );
    case "general":
      return generalDropdownOptions.items.value.filter(
        (item: any) =>
          !item?.value ||
          item?.label.includes(selectMenuSearchTerm.value) ||
          item?.value.includes(selectMenuSearchTerm.value),
      );
    case "program":
      return programDropdownOptions.items.value.filter(
        (item: any) =>
          !item?.value ||
          item?.label.includes(selectMenuSearchTerm.value) ||
          item?.value.includes(selectMenuSearchTerm.value),
      );
    default:
      return [];
  }
});

const isFilterEmpty = computed(() => {
  const {
    y: _, // current term is not considered as a filter
    oa: __, // open advanced search is not a filter
    ot: ___, // open time search is not a filter
    tl: ____,
    s,
    d,
    g,
    p,
    gl,
    hl,
    ol,
    i,
    e,
    di,
    c,
    nf,
    es,
    t,
  } = route.query;
  return ![s, d, g, p, gl, hl, ol, i, e, di, c, nf, es, t].some((v) => !!v);
});
const isAdvancedFilterEmpty = computed(() => {
  const { gl, hl, ol, i, e, di, c, nf, es } = route.query;
  return ![gl, hl, ol, i, e, di, c, nf, es].some((v) => !!v);
});
const isTimeFilterEmpty = computed(() => {
  return !route.query?.t;
});

function onflash() {
  // open advanced search if oa is 1
  if (useRoute().query.oa) {
    advancedSearchOpen.value = true;
  }
  if (useRoute().query.ot) {
    advancedTimeSearchOpen.value = true;
  }
  getFiltersFromQuery();
  handleBreadcrumbClick();
}
watch(
  () => route.query,
  () => {
    onflash();
  },
);

onMounted(async () => {
  onflash();
});

function getFiltersFromQuery() {
  // query: {
  //   y: string; // year-term, undefined if default term is used

  //   s: string; // search input

  //   d: string; // dept filter, e.g. "CS,EE"
  //   g: string; // general education filter, e.g. "A,B,C"
  //   p: string; // program filter, e.g. "prog1,prog2"

  //   gl: 1 / 0; // g location filter, 1 for true, 0 for false, undefined for all
  //   hl: 1 / 0; // h location filter, 1 for true, 0 for false, undefined for all
  //   ol: 1 / 0; // o location filter, 1 for true, 0 for false, undefined for all

  //   i: 1 / 0; // intensive filter, 1 for true, 0 for false, undefined for all
  //   e: 1 / 0; // english teaching filter, 1 for true, 0 for false, undefined for all
  //   di: 1 / 0; // digital filter, 1 for true, 0 for false, undefined for all

  //   c: string; // credit filter, e.g. "1,2,3"
  //   nf: 1 / 0; // no full courses filter, 1 for true, 0 for false, undefined for all

  //   es: string; // exclude filter

  //   t: string; // time filter
  //   tl: 1 / 0; // time loose filter, 1 for loose, 0 for strict, undefined for strict

  //   oa: 1 / 0; // open advanced search
  //   ot: 1 / 0; // open time search
  // }
  const query = route.query;
  const filters: Record<string, any> = {};
  // term
  const term =
    query.y && typeof query.y === "string" ? query.y : defaultTerm.value;
  // global filter
  const globalFilter =
    query.s && typeof query.s === "string" ? query.s.replace(/\+/g, " ") : "";
  // advanced filters
  filters.location =
    query.gl || query.hl || query.ol
      ? {
          g: query.gl === "1" ? true : query.gl === "0" ? false : undefined,
          h: query.hl === "1" ? true : query.hl === "0" ? false : undefined,
          o: query.ol === "1" ? true : query.ol === "0" ? false : undefined,
        }
      : undefined;
  filters.intensive =
    query.i === "1" ? true : query.i === "0" ? false : undefined;
  filters.english_teaching =
    query.e === "1" ? true : query.e === "0" ? false : undefined;
  filters.digital_course =
    query.di === "1" ? true : query.di === "0" ? false : undefined;
  filters.credits =
    query.c && typeof query.c === "string"
      ? query.c.split(",").map((c) => parseInt(c))
      : undefined;
  filters.count_enrolled_without_authorized =
    query.nf === "1" ? true : query.nf === "0" ? false : undefined;
  // // exclude filter
  // filters.full_name =
  //   query.es && typeof query.es === "string"
  //     ? query.es.replace(/\+/g, " ")
  //     : "";
  // time filter
  filters.time_location_list =
    query.t && typeof query.t === "string"
      ? new Set(query.t.split(",").filter((t) => t.trim() !== ""))
      : undefined;
  const loose = query.tl === "1";

  // update filters based on query
  if (term) {
    currentTerm.value = term;
  }
  globalFilterInput.value = globalFilter || "";
  updateGlobalFilterByInput(globalFilterInput.value);

  // department_code
  switch (mode.value) {
    case "dept":
      filters.department_code =
        query.d && typeof query.d === "string" ? query.d.split(",") : [];
      const deptFilter = deptDropdownOptions.items.value.filter((item: any) =>
        filters.department_code.includes(item.value),
      );
      deptDropdownOptions.model.value = deptFilter;
      break;
    case "pe":
      filters.department_code = ["PE"];
      break;
    case "interschool":
      filters.department_code = ["9UAA", "9MAA", "9DAA", "9UAB", "9MAB"];
      break;
    default:
      filters.department_code = undefined;
      break;
  }
  switch (mode.value) {
    case "general":
      filters.general_education =
        query.g && typeof query.g === "string" ? query.g.split(",") : ["all"];
      const generalFilter = generalDropdownOptions.items.value.filter(
        (item: any) => filters.general_education.includes(item.value),
      );
      generalDropdownOptions.model.value = generalFilter;
      break;
    default:
      filters.general_education = undefined;
      break;
  }
  switch (mode.value) {
    case "program":
      filters.credit_program =
        query.p && typeof query.p === "string" ? query.p.split(",") : ["all"];
      const programFilter = programDropdownOptions.items.value.filter(
        (item: any) => filters.credit_program.includes(item.value),
      );
      programDropdownOptions.model.value = programFilter;
      break;
    default:
      filters.credit_program = undefined;
      break;
  }
  // name
  switch (mode.value) {
    case "nd":
      filters.name = "全民國防教育軍事訓練";
      break;
    case "english3":
      filters.name = "英文（三）";
      break;
    default:
      filters.name = undefined;
      break;
  }

  // DEBUG
  // console.trace("filters from query: ", filters);
  clearAndSetAllFilters(filters);

  advancedValues.g_location.value = filters.location?.g;
  advancedValues.h_location.value = filters.location?.h;
  advancedValues.o_location.value = filters.location?.o;

  advancedValues.intensive.value = filters.intensive;
  advancedValues.english_teaching.value = filters.english_teaching;
  advancedValues.digital_course.value = filters.digital_course;

  advancedValues.credits.value = filters.credits;
  advancedValues.exclude_full.value = filters.count_enrolled_without_authorized;

  advancedValues.exclude.value = filters.full_name;

  timeSelected.value = filters.time_location_list;
  timeLoose.value = loose;
}

async function updateFiltersToQuery(
  path: string | undefined = undefined,
  filters: Record<string, any> = {},
  opt: {
    clear?: boolean; // whether to clear other filters that are not in the given filters, default is false
    clearGlobal?: boolean; // whether to clear global filters that are not in the given filters, default is false
    clearAdvanced?: boolean; // whether to clear advanced filters that are not in the given filters, default is false
    replace?: boolean; // whether to replace the query instead of pushing, default is false
  } = {
    clear: false,
    clearGlobal: false,
    clearAdvanced: false,
    replace: false,
  },
) {
  const newPath = route.path.includes("/dev")
    ? `/dev${path || ""}`
    : path || route.path;
  const currentQuery = { ...route.query };
  if (opt.clear) {
    delete currentQuery.d;
    delete currentQuery.g;
    delete currentQuery.p;
  }
  if (opt.clearGlobal) {
    delete currentQuery.s;
  }
  if (opt.clearAdvanced) {
    delete currentQuery.gl;
    delete currentQuery.hl;
    delete currentQuery.ol;
    delete currentQuery.i;
    delete currentQuery.e;
    delete currentQuery.di;
    delete currentQuery.c;
    delete currentQuery.nf;
    delete currentQuery.es;
    delete currentQuery.t;
    delete currentQuery.tl;
  }
  const newQuery: Record<string, any> = {
    ...currentQuery,
    ...filters,
  };

  navigateTo({
    path: newPath,
    query: newQuery,
    replace: opt.replace,
  });
}
</script>
