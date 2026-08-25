<template>
  <USeparator class="mx-auto my-4 max-w-4xl" />
  <UFooter :ui="{ top: 'mx-auto max-w-2xl !py-2' }">
    <template #top>
      <UContainer>
        <UFooterColumns
          :columns="columns"
          :ui="{
            list: 'mt-2',
            item: 'mb-1',
            link: 'text-muted! hover:text-default! transition-colors!',
            center:
              'sm:grid sm:col-span-3 sm:gap-8 max-sm:max-w-md mx-auto px-4 w-full',
          }"
          class="flex!"
        />
      </UContainer>
    </template>

    <template #default>
      <div class="text-center text-sm text-dimmed">
        <div>&copy; {{ new Date().getFullYear() }} NTNUx.</div>
        <div>
          所有課程資料為國立臺灣師範大學所有<br />僅供學術研究與個人使用
        </div>
        <div>資料非實時更新，請以學校公告為準</div>
      </div>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { FooterColumn } from "@nuxt/ui";

const randomCos = useState(
  "randomCos",
  () => Math.floor(Math.random() * 4) + 1,
);
const cosUrl = `https://cos${randomCos.value}s.ntnu.edu.tw/AasEnrollStudent`;
const columns: FooterColumn[] = [
  {
    label: "更多功能",
    children: [
      { label: "課表規劃", to: "/user/timetable" },
      { label: "顯示收藏課程", to: "/user/favorites" },
    ],
  },
  {
    label: "關於 NTNUx",
    children: [
      {
        label: "GitHub",
        href: "https://github.com/NTNUx/NTNUx",
        target: "_blank",
      },
      {
        label: "Bug 回報",
        href: "https://github.com/NTNUx/NTNUx/issues",
        target: "_blank",
      },
    ],
  },
  {
    label: "實用連結",
    children: [
      {
        label: "師大課程資訊",
        href: "https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/index.jsp",
        target: "_blank",
      },
      {
        label: "師大選課系統",
        href: cosUrl,
        target: "_blank",
      },
      {
        label: "行政資訊入口",
        href: "https://iportal2.ntnu.edu.tw/ntnu/",
        target: "_blank",
      },
      {
        label: "年度行事曆",
        href: "https://www.aa.ntnu.edu.tw/zh_tw/Calender",
        target: "_blank",
      },
      {
        label: "選課沒地雷（FB）",
        href: "https://www.facebook.com/groups/143704482352660/",
        target: "_blank",
      },
    ],
  },
];
</script>
