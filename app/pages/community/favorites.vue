<template>
  <div class="page-container w-full">
    <UPageHero
      title="來自社群分享的收藏課程"
      :description="'這是來自社群分享的收藏課程，內容由使用者或 NTNUx 的貢獻者提供\n可能會有不準確或過時的資訊，請自行斟酌參考'"
      :links="[
        {
          label: '回到我的收藏課程',
          to: '/user/favorites',
          color: 'neutral',
          size: 'md',
        },
        {
          label: '分享我的收藏課程',
          href: `https://github.com/ntnux/ntnux/issues/new?assignees=&labels=help+wanted%2C+share+favorite&template=submit_favorite.yml&title=%5B收藏課程分享%5D+${
            // date format: YYYY-MM-DD (UTC+8)
            new Date().toLocaleDateString('zh-TW', {
              timeZone: 'Asia/Taipei',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          }`,
          target: '_blank',
          trailingIcon: 'tabler:share',
          color: 'primary',
          size: 'md',
        },
      ]"
      :ui="{
        container: 'py-6! lg:py-8!',
        title: 'text-3xl! lg:text-4xl!',
        description:
          'text-base! md:text-lg! lg:text-xl! whitespace-pre-line text-pretty!',
        footer: 'mt-4!',
      }"
    />

    <div
      class="flex flex-col max-h-[80vh] min-h-100 max-w-3xl my-8 mx-auto shadow-lg rounded-xl"
    >
      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput
          v-model="globalFilter"
          class="max-w-md w-full"
          placeholder="篩選收藏課程..."
        >
          <template v-if="globalFilter?.length > 0" #trailing>
            <UButton
              color="neutral"
              variant="link"
              icon="tabler:x"
              @click="globalFilter = ''"
            />
          </template>
        </UInput>
      </div>
      <UTable
        :data="data"
        :columns="columns"
        :loading="status === 'pending' || status === 'idle'"
        loadingColor="neutral"
        v-model:globalFilter="globalFilter"
        @select="(_, row) => row.toggleExpanded()"
        class=""
      >
        <template #expanded="{ row }">
          <ULink
            :href="row.original.url"
            class="text-default underline max-w-2xl w-full text-ellipsis whitespace-nowrap overflow-hidden block"
            target="_blank"
          >
            {{ row.original.url }}
          </ULink>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

type FavoriteItem = {
  id: number;
  title: string;
  description: string;
  author: string;
  url: string;
  tags: string;
};

const { data, status } = useLazyFetch<FavoriteItem[]>("/data/favorites.json", {
  method: "GET",
  transform: (response) => {
    // ["url1", "url2", ...] -> [{ id: 1, title: "Title 1", description: "Description 1", author: "Author 1", url: "url1" }, ...]
    return response.map((url: any, index) => {
      const query = new URL(url).searchParams;
      const title = query.get("title") || "未命名的收藏";
      const description =
        query.get("depict") || `這是第 ${index + 1} 個收藏的課程`;
      const author = query.get("a") || "未知";
      const tags = query.get("tags") || "";
      return {
        id: index + 1,
        title,
        description,
        author,
        url,
        tags,
      } as FavoriteItem;
    });
  },
  server: false,
});
const UBadge = resolveComponent("UBadge");
const columns = ref<TableColumn<FavoriteItem>[]>([
  {
    accessorKey: "title",
    header: "收藏名稱",
    cell: ({ row }) => {
      return h(
        "a",
        {
          href: row.original.url,
          class:
            "text-muted underline max-w-25 min-w-10 w-full whitespace-pre-line",
        },
        row.original.title,
      );
    },
  },
  {
    accessorKey: "author",
    header: "作者",
  },
  {
    accessorKey: "tags",
    header: "標籤",
    cell: ({ row }) => {
      const tags = row.original.tags.split(",").map((tag) => tag.trim());
      if (tags.length === 0 || (tags.length === 1 && tags[0] === "")) {
        return;
      }
      return h(
        "div",
        {
          class: "flex flex-col gap-1",
        },
        tags.map((tag) =>
          h(UBadge, {
            key: tag,
            label: tag,
            size: "sm",
            color: "neutral",
            variant: "soft",
            class: "rounded-full justify-center font-bold",
          }),
        ),
      );
    },
  },
  {
    accessorKey: "description",
    header: "描述",
  },
]);
const globalFilter = ref("");

const pageTitle = "公開的收藏課程";
useHead({
  title: pageTitle,
});
useSeoMeta({
  title: pageTitle,
  appleMobileWebAppTitle: pageTitle,
  ogTitle: pageTitle,
  twitterTitle: pageTitle,
  ogUrl: "https://ntnux.org/community/favorites",
});

onMounted(() => {
  prefetchDefaultTermData(false);
  loadFavoriteCourses();
});
</script>
