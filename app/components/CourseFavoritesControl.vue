<template>
  <div
    class="flex flex-row flex-wrap max-sm:px-2 justify-between my-4 max-w-3xl mx-auto gap-2.5"
  >
    <div>
      <USelectMenu
        v-model="selectedTermItems"
        :items="dropdownTermOptions"
        multiple
        size="lg"
        class="w-64"
        :ui="{
          item: 'flex item-center p-0! rounded cursor-pointer hover:bg-primary/10 data-selected:bg-primary/20 data-selected:text-primary',
          itemWrapper: 'max-w-[calc(100%-2rem)]',
          itemLabel: 'w-full pl-2 py-2',
          itemTrailing: 'my-auto',
          separator: 'last:hidden',
          label: 'px-2 py-1 text-xs text-dimmed',
        }"
        :search-input="false"
        @change="termChangeHandler"
      >
        <template #item-label="{ item }">
          <span class="flex justify-between items-center w-full">
            <span>{{ item.label }}</span>
            <div v-if="item?.value">
              <UBadge
                v-if="item.value === defaultTerm"
                color="warning"
                variant="soft"
                size="sm"
                class="ml-2"
              >
                預設學期
              </UBadge>
              <UBadge
                v-if="dataAllTerms[item.value]?.length || 0 > 0"
                color="primary"
                variant="soft"
                size="sm"
                class="ml-2"
              >
                {{ `${dataAllTerms[item.value]?.length || 0} 門課` }}
              </UBadge>
              <UBadge
                v-else
                color="neutral"
                variant="soft"
                size="sm"
                class="ml-2"
              >
                未載入
              </UBadge>
            </div>
          </span>
        </template>
      </USelectMenu>
    </div>
    <div class="flex flex-row gap-2 mr-auto">
      <UButton
        label="全部展開"
        size="lg"
        color="primary"
        variant="outline"
        @click="allOpen"
      ></UButton>
      <UButton
        label="全部收合"
        size="lg"
        color="primary"
        variant="outline"
        @click="allClosed"
      ></UButton>
    </div>
    <div class="flex flex-row gap-2 mr-auto">
      <UButton
        label="隱藏空課程"
        size="lg"
        color="primary"
        :variant="hideEmptyCourses ? 'solid' : 'outline'"
        :icon="hideEmptyCourses ? 'tabler:eye-off' : 'tabler:eye'"
        @click="
          () => {
            hideEmptyCourses = !hideEmptyCourses;
            if (hideEmptyCourses) {
              sorting = false;
              deleting = false;
              editing = false;
            }
          }
        "
      ></UButton>
      <UDropdownMenu
        size="lg"
        :items="[
          {
            label: '排列順序',
            type: 'checkbox',
            onUpdateChecked(checked) {
              sorting = checked;
              if (checked) hideEmptyCourses = false;
            },
            onSelect: (e) => {
              e.preventDefault();
            },
            icon: 'tabler:menu-order',
            checked: sorting,
            color: sorting ? 'primary' : undefined,
          },
          {
            label: '刪除課程',
            type: 'checkbox',
            onUpdateChecked(checked) {
              deleting = checked;
              if (checked) hideEmptyCourses = false;
            },
            onSelect: (e) => {
              e.preventDefault();
            },
            icon: 'tabler:trash',
            checked: deleting,
            color: deleting ? 'error' : undefined,
          },
          {
            label: '編輯標題',
            type: 'checkbox',
            onUpdateChecked(checked) {
              editing = checked;
              if (checked) hideEmptyCourses = false;
            },
            onSelect: (e) => {
              e.preventDefault();
            },
            icon: 'tabler:pencil',
            checked: editing,
            color: editing ? 'primary' : undefined,
          },
          {
            label: '編輯全開',
            type: 'checkbox',
            onUpdateChecked(checked) {
              sorting = checked;
              deleting = checked;
              editing = checked;
              if (checked) hideEmptyCourses = false;
            },
            onSelect: (e) => {
              e.preventDefault();
            },
            icon: 'tabler:edit',
            checked: sorting && deleting && editing,
            color: sorting && deleting && editing ? 'success' : undefined,
          },
          {
            label: '新增標題',
            icon: 'tabler:plus',
            onClick() {
              headerModalOpen = true;
            },
          },
        ]"
        :ui="{
          content: 'min-w-40',
        }"
      >
        <UButton
          v-if="!shared"
          label="編輯"
          size="lg"
          color="primary"
          variant="outline"
          icon="tabler:pencil"
          class="cursor-pointer gap-1.5"
        />
      </UDropdownMenu>
      <UButton
        v-if="!shared"
        label="清空收藏"
        size="lg"
        color="error"
        variant="outline"
        @click="clearFavoriteModalOpen = true"
      ></UButton>
    </div>
    <div class="flex flex-row gap-2">
      <UButton
        v-if="!shared"
        label="匯入"
        color="neutral"
        variant="outline"
        icon="tabler:download"
        class="h-9 cursor-pointer"
        @click="importModalOpen = true"
      />
      <UButton
        v-if="!shared"
        label="匯出"
        color="neutral"
        variant="outline"
        icon="tabler:upload"
        class="h-9 cursor-pointer"
        @click="exportFavorites"
      />
    </div>

    <UModal
      v-model:open="headerModalOpen"
      title="新增標題"
      description="在收藏課程中新增一個標題，用來分隔不同類別的課程"
      :ui="{
        header: 'py-2',
        footer: 'justify-end py-2 gap-2',
        content: 'max-w-md',
      }"
    >
      <template #body>
        <UInput
          v-model="headerTitle"
          placeholder="標題名稱，例如：必修、選修、系專業選修..."
          class="w-full"
          color="neutral"
          variant="outline"
          autofocus
          @keyup.enter="addHeader(headerh1 ? 'h1' : headerh2 ? 'h2' : 'h1')"
        />
      </template>
      <template #footer>
        <UButton
          label="取消"
          variant="outline"
          class="mr-auto"
          @click="headerModalOpen = false"
        />
        <UButton
          v-if="!headerh2"
          :disabled="headerTitle.trim() === ''"
          label="新增為大標題"
          color="primary"
          @click="addHeader('h1')"
        />
        <UButton
          v-if="!headerh1"
          :disabled="headerTitle.trim() === ''"
          label="新增為小標題"
          color="primary"
          @click="addHeader('h2')"
        />
      </template>
    </UModal>

    <UModal
      title="清空收藏課程"
      description="確定要清空收藏？"
      :ui="{ header: 'py-2', footer: 'justify-end py-2', content: 'max-w-md' }"
      v-model:open="clearFavoriteModalOpen"
    >
      <template #footer>
        <UButton
          label="取消"
          variant="outline"
          class="mr-auto"
          @click="clearFavoriteModalOpen = false"
        />
        <UButton
          label="確定"
          color="error"
          @click="
            clearFavoriteModalOpen = false;
            clearFavorites();
          "
        />
      </template>
    </UModal>

    <UModal
      title="匯入收藏課程"
      :description="'請注意：\n匯入的收藏課程將會覆蓋現有收藏課程，若有需要請先備份收藏課程。'"
      :ui="{
        header: 'py-2',
        description: 'whitespace-pre-line',
        footer: 'justify-end py-2',
        content: 'max-w-md',
        body: 'p-4! max-h-[70vh] overflow-y-auto',
      }"
      v-model:open="importModalOpen"
      @update:open="
        () => {
          importConfirmed = false;
        }
      "
    >
      <template #body>
        <UTextarea
          v-model="importText"
          :placeholder="
            '格式為 courseCode:courseName，一行一門課，例如：\n' +
            'CSU0001:程式設計（一）\n' +
            'MAU0179:微積分甲（二）\n' +
            '或是分享連結：https://ntnux.org/share/favorites?cs=...'
          "
          class="w-full"
          color="neutral"
          variant="outline"
          :rows="6"
          autoresize
          :ui="{ base: 'max-sm:text-sm!' }"
          @blur="importText = importHandler()"
        />
      </template>
      <template #footer>
        <UButton
          label="取消"
          color="neutral"
          variant="outline"
          @click="importModalOpen = false"
        />
        <UButton
          v-if="!importConfirmed"
          :disabled="importText.trim() === ''"
          label="匯入"
          color="primary"
          class="ml-auto"
          @click="importConfirmed = true"
        />
        <UButton
          v-else
          label="確定匯入"
          color="warning"
          class="ml-auto"
          @click="
            () => {
              importCourses();
              importModalOpen = false;
              importConfirmed = false;
            }
          "
        />
      </template>
    </UModal>

    <UModal
      title="匯出收藏課程"
      :description="'匯出包含 ' + favoriteCourses.length + ' 門課程的連結'"
      :ui="{
        header: 'py-2',
        body: 'flex flex-col gap-4 !pt-2',
        description: 'whitespace-pre-line pr-8',
      }"
      v-model:open="exportModalOpen"
      scrollable
    >
      <template #body>
        <UFormField label="為這些課程命名">
          <UInput
            v-model="includeTitleInExport"
            placeholder="選填，例如：神奇的收藏課表、116資工雙主修"
            class="w-full"
            :ui="{ base: 'max-sm:text-sm!' }"
            color="neutral"
            variant="outline"
            @update:model-value="exportFavorites"
          >
            <template v-if="includeTitleInExport?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                icon="tabler:x"
                aria-label="Clear input"
                @click="includeTitleInExport = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <UFormField
          label="加上標籤"
          description="最多三個標籤，每個標籤 3 個字以內"
        >
          <UInputTags
            v-model="includeTagsInExport"
            placeholder="選填，例如：物理、雙主修、大學部..."
            class="w-full"
            :ui="{ base: 'max-sm:text-sm!' }"
            color="neutral"
            variant="outline"
            @update:model-value="exportFavorites"
            :max-length="3"
            :max="3"
            :add-on-tab="true"
            :add-on-blur="true"
          />
        </UFormField>
        <UFormField label="加上課程描述">
          <UInput
            v-model="includeDepictInExport"
            placeholder="選填，分享時會顯示在標題下方"
            class="w-full"
            :ui="{ base: 'max-sm:text-sm!' }"
            color="neutral"
            variant="outline"
            @update:model-value="exportFavorites"
          >
            <template v-if="includeDepictInExport?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                icon="tabler:x"
                aria-label="Clear input"
                @click="includeDepictInExport = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <UFormField label="加上你的暱稱">
          <UInput
            v-model="includeAuthorInExport"
            placeholder="選填，分享時會顯示在作者欄位"
            class="w-full"
            :ui="{ base: 'max-sm:text-sm!' }"
            color="neutral"
            variant="outline"
            @update:model-value="exportFavorites"
          >
            <template v-if="includeAuthorInExport?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                icon="tabler:x"
                aria-label="Clear input"
                @click="includeAuthorInExport = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USwitch
          v-model="excludeCourseNameInExport"
          label="匯出時不包含課程名稱（只包含課程代碼）"
          description="部分課程名在載入課程前無法顯示，但可以大幅縮短連結長度"
          :ui="{ base: 'max-sm:text-sm!' }"
          @update:model-value="exportFavorites"
        />
        <UInput
          v-model="exportUrl"
          label="分享連結（點擊複製）"
          readonly
          @click="copyToClipboard(exportUrl, '分享連結')"
          class="w-full"
          color="neutral"
          variant="outline"
          :ui="{ base: 'select-all! cursor-pointer' }"
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

const { favoriteCourses, courseNameMap, shared } = defineProps<{
  favoriteCourses: FavoriteCourses;
  courseNameMap: CourseNameMap;
  shared?: boolean | undefined;
}>();

const dataAllTerms = useState<AllTermsData>("dataAllTerms", () => ({}));

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
const selectedTermItems = ref([
  {
    label: defaultTerm.value.replace("3", "暑期"),
    value: defaultTerm.value,
  },
]);
const selectedTerm = useState<string[]>("selectedTerm", () => [
  defaultTerm.value,
]);
const dropdownTermOptions = computed(() => {
  return [
    {
      label: "預設學期",
      onSelect: () => {
        nextTick(() => {
          selectedTermItems.value = [
            {
              label: defaultTerm.value.replace("3", "暑期"),
              value: defaultTerm.value,
            },
          ];
          selectedTerm.value = [defaultTerm.value];
        });
      },
    },
    ...termList.value
      .map((year) => {
        return [
          {
            type: "label",
            label: `${year} 學年`,
          },
          { label: `${year}-1`, value: `${year}-1` },
          { label: `${year}-2`, value: `${year}-2` },
          { label: `${year}-暑期`, value: `${year}-3` },
          { type: "separator" },
        ];
      })
      .flat(),
  ] as any[];
});

const selectedFavorite = useState<string[]>("selectedFavorite", () => []);
function allClosed() {
  selectedFavorite.value = [];
}
function allOpen() {
  // Array: 0 - favoriteCourses.length - 1
  selectedFavorite.value = favoriteCourses.map((_, index) => index.toString());
}

function termChangeHandler() {
  selectedTerm.value = selectedTermItems.value.map((item) => item.value);
  for (const term of selectedTerm.value) {
    if (!dataAllTerms.value[term]) {
      fetchTermData(term);
    }
  }
}

const hideEmptyCourses = useState<boolean>("hideEmptyCourses", () => false);
const sorting = useState<boolean>("sorting", () => false);
const deleting = useState<boolean>("deleting", () => false);
const editing = useState<boolean>("editing", () => false);
const clearFavoriteModalOpen = ref(false);
function clearFavorites() {
  favoriteCourses.splice(0, favoriteCourses.length);
  Object.keys(courseNameMap).forEach((key) => {
    delete courseNameMap[key];
  });
  saveFavoriteCourses();
}

const importModalOpen = ref(false);
const importText = ref("");
const importConfirmed = ref(false);
function importHandler(): string {
  const newTextLines = [];
  const lines = importText.value.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (!line.includes("cs=")) {
      newTextLines.push(line);
      continue;
    }

    const url = new URL(line, window.location.origin);
    const cs = url.searchParams.get("cs");
    if (cs) {
      for (const item of cs.split(",")) {
        const [code, name] = item.split(":").map((part) => part.trim());
        newTextLines.push(`${code}:${name}`);
      }
    } else {
      newTextLines.push(line);
    }
  }
  return newTextLines.join("\n");
}
function importCourses() {
  const result = importHandler();

  const newFavoriteCourses: FavoriteCourses = [];
  const newCourseNameMap: CourseNameMap = {};
  for (const item of result.split("\n")) {
    const [code, name] = item.split(":").map((part) => part.trim());
    if (code) {
      newFavoriteCourses.push(code);
      if (name) newCourseNameMap[code] = name;
    }
  }

  if (result.trim() === "") {
    alert("沒有找到有效的課程資料");
    return;
  }

  favoriteCourses.splice(0, favoriteCourses.length, ...newFavoriteCourses);
  Object.assign(courseNameMap, newCourseNameMap);
  saveFavoriteCourses();
  importText.value = "";
  alert("匯入成功！");
}
const exportModalOpen = ref(false);
const exportUrl = ref("");
const includeTitleInExport = ref("");
const includeDepictInExport = ref("");
const includeAuthorInExport = ref("");
const includeTagsInExport = ref([]);
const excludeCourseNameInExport = ref(false);
function exportFavorites() {
  if (favoriteCourses.length === 0) {
    alert("沒有課程可供匯出");
    return;
  }
  exportModalOpen.value = true;
  exportUrl.value =
    window.location.origin +
    "/share/favorites?" +
    [
      includeTitleInExport.value.trim() !== ""
        ? `title=${encodeURIComponent(includeTitleInExport.value.trim())}`
        : "",
      includeTagsInExport.value.length > 0
        ? `tags=${encodeURIComponent(includeTagsInExport.value.map((tag: string) => tag.trim()).join(","))}`
        : "",
      includeDepictInExport.value.trim() !== ""
        ? `depict=${encodeURIComponent(includeDepictInExport.value.trim())}`
        : "",
      includeAuthorInExport.value.trim() !== ""
        ? `a=${encodeURIComponent(includeAuthorInExport.value.trim())}`
        : "",
      "cs=" +
        encodeURIComponent(
          excludeCourseNameInExport.value
            ? favoriteCourses
                .map((code) => {
                  if (code.startsWith("NTNUx-h")) {
                    const name = courseNameMap[code] || "";
                    return `${code}:${name}`;
                  }
                  return code;
                })
                .join(",")
            : favoriteCourses
                .map((code) => {
                  const name = courseNameMap[code] || "";
                  return `${code}:${name}`;
                })
                .join(","),
        ),
      ,
    ]
      .filter((part) => part !== "")
      .join("&");
}

const headerModalOpen = ref(false);
const headerTitle = ref("");
function addHeader(type: "h1" | "h2") {
  let id = 0;
  while (favoriteCourses.includes(`NTNUx-${type}-${id}`)) {
    id++;
  }
  favoriteCourses.push(`NTNUx-${type}-${id}`);
  courseNameMap[`NTNUx-${type}-${id}`] = headerTitle.value;
  saveFavoriteCourses();
  headerTitle.value = "";
  headerModalOpen.value = false;
  setTimeout(() => {
    headerh1.value = false;
    headerh2.value = false;
  }, 300);
}
const headerh1 = ref(false);
const headerh2 = ref(false);

defineShortcuts({
  meta_h: {
    handler() {
      headerh1.value = true;
      headerh2.value = false;
      headerModalOpen.value = true;
    },
  },
  meta_shift_h: {
    handler() {
      headerh1.value = false;
      headerh2.value = true;
      headerModalOpen.value = true;
    },
  },
  meta_enter: {
    handler() {
      if (headerModalOpen.value) {
        if (headerh1.value) {
          addHeader("h1");
        } else if (headerh2.value) {
          addHeader("h2");
        } else {
          addHeader("h1");
        }
      }
    },
  },
});

onMounted(() => {
  selectedTermItems.value = dropdownTermOptions.value.filter((option) =>
    selectedTerm.value.includes(option.value as string),
  );
});
</script>
