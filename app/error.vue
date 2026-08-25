<template>
  <div
    class="flex min-h-screen items-center text-white bg-linear-135 from-[#114a6f] to-[#0f4c75]"
  >
    <div class="flex flex-wrap items-center p-4 mx-auto">
      <div class="w-full p-4 text-center lg:w-1/2">
        <div class="text-7xl font-mono">
          {{ error.statusCode }}
        </div>
      </div>
      <div class="w-full p-4 text-center lg:w-1/2 lg:text-left">
        <div class="mt-4 mb-4 text-lg">糟糕！這不應該出現</div>
        <div class="text-lg">error message: {{ error.message }}</div>
        <button type="button" class="button" @click="handleError">
          回到首頁
        </button>
        <button type="button" class="button" @click="handleReload">
          或嘗試重新整理
        </button>
        <div>
          <p class="mt-2 text-sm">
            如果問題持續且重複發生
            <br />
            請聯繫 NTNUx 的
            <a
              href="https://github.com/ntnux/NTNUx/issues"
              class="a"
              target="_blank"
            >
              Github
            </a>
            或
            <a href="https://www.threads.com/@ntnux" class="a" target="_blank">
              Threads
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const handleError = () => clearError({ redirect: "/search" });

const handleReload = () => {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

useHead({
  title: `錯誤 ${error.statusCode} - NTNUx`,
});
useSeoMeta({
  title: `錯誤 ${error.statusCode} - NTNUx`,
  appleMobileWebAppTitle: `錯誤 ${error.statusCode} - NTNUx`,
  ogTitle: `錯誤 ${error.statusCode} - NTNUx`,
  twitterTitle: `錯誤 ${error.statusCode} - NTNUx`,
});
</script>
