<template>
  <footer class="footer">
    <Divider />
    <div class="footer-content">
      <div
        class="footer-content-col"
        v-for="footerItem in footerItems"
        :key="footerItem.label"
      >
        <h4>{{ footerItem.label }}</h4>
        <div
          v-for="item in footerItem.items"
          :key="item.label"
          style="padding: 2px 0"
        >
          <Button
            v-if="item.url"
            :label="item.label"
            class="p-button-text p-button-secondary"
            asChild
          >
            <a
              :href="item.url"
              target="_blank"
              style="text-decoration: none; color: inherit"
              >{{ item.label }}</a
            >
            <i
              class="pi pi-external-link"
              style="font-size: 0.75rem; margin-left: 0.5rem"
            ></i>
          </Button>
          <Button
            v-else
            :label="item.label"
            class="p-button-text p-button-secondary"
            @click="item.command"
            style="padding: 0; border: none"
          ></Button>
        </div>
      </div>
    </div>
    <Divider class="footer-content" />
    <span class="footer-copyright">
      &copy; 2025
      <a
        href="https://github.com/sun92122/NTNUx"
        target="_blank"
        style="color: var(--p-text-secondary-color)"
      >
        NTNUx.
      </a>
      <br />
      所有課程資料為國立臺灣師範大學所有，僅供學術研究與個人使用
      <br />
      資料非實時更新，請以學校公告為準
    </span>
  </footer>
</template>

<script setup>
import { Button, Divider } from "primevue";

const isShowSchedule = useState("isShowSchedule", () => false);

const footerItems = [
  {
    label: "更多功能",
    icon: "pi pi-fw pi-cog",
    items: [
      {
        label: "顯示課表",
        command: () => {
          isShowSchedule.value = true;
        },
      },
      {
        label: "進階搜尋",
        command: () => {
          useRouter().push("/?m=advanced");
        },
      },
      {
        label: "顯示收藏課程",
        command: () => {
          useRouter().push("/favorite");
        },
      },
      {
        label: "課程討論區（GitHub）",
        url: "https://github.com/sun92122/NTNUx/discussions/categories/course-%E8%AA%B2%E7%A8%8B",
      },
    ],
  },
  {
    label: "關於 NTNUx",
    icon: "pi pi-fw pi-info-circle",
    items: [
      {
        label: "GitHub",
        url: "https://github.com/sun92122/NTNUx",
      },
      {
        label: "Bug 回報",
        url: "https://github.com/sun92122/NTNUx/issues",
      },
      {
        label: "NTNUx 討論區",
        url: "https://github.com/sun92122/NTNUx/discussions",
      },
    ],
  },
  {
    label: "實用連結",
    icon: "pi pi-fw pi-link",
    items: [
      {
        label: "師大課程資訊",
        url: "https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/index.jsp",
      },
      {
        label: "師大選課系統",
        // randomly 1-4
        url: `https://cos${
          Math.floor(Math.random() * 4) + 1
        }s.ntnu.edu.tw/AasEnrollStudent`,
      },
      {
        label: "行政資訊入口",
        url: "https://iportal2.ntnu.edu.tw/ntnu/",
      },
      {
        label: "年度行事曆",
        url: "https://www.aa.ntnu.edu.tw/zh_tw/Calender",
      },
      {
        label: "選課沒地雷（FB）",
        url: "https://www.facebook.com/groups/143704482352660/",
      },
    ],
  },
];
</script>

<style scoped lang="scss">
footer {
  padding: 1rem 0;
  background-color: var(--p-content-background);
  width: 100%;
  margin-top: auto;
}

// 3 columns footer layout
.footer-content {
  width: clamp(40rem, 80vw, 60rem);
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 2rem;
}

.footer-content-col {
  flex: 1;
  min-width: 10rem;
  max-width: 20rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  h4 {
    margin: 0.5rem 0;
    font-size: clamp(1rem, 1.5vw + 0.25rem, 1.1rem);
    color: var(--p-text-secondary-color);
  }

  div {
    color: var(--p-surface-500);
  }
}

// 1 column footer layout for small screens
@media screen and (max-width: 600px) {
  .footer-content {
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0;
  }

  .footer-content-col {
    width: 100%;
    max-width: none;
    text-align: center;
    padding: 0.5rem 0;
  }
}

.footer-copyright {
  font-size: clamp(0.75rem, 1.5vw + 0.25rem, 12px);
  font-family: sans-serif;
  text-align: center;
  color: var(--p-text-secondary-color);
  margin-top: 0.5rem;
  width: 100%;
  display: block;
}
</style>
