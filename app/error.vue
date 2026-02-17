<template>
  <div
    class="flex min-h-screen items-center text-white"
    style="background-image: linear-gradient(135deg, #114a6f 35%, #0f4c75 100%)"
  >
    <div
      class="flex flex-wrap items-center p-4"
      style="margin-left: auto; margin-right: auto"
    >
      <div class="w-full p-4 text-center lg:w-1/2">
        <div style="font-size: 12rem; font-family: monospace">
          {{ error.statusCode }}
        </div>
      </div>
      <div class="w-full p-4 text-center lg:w-1/2 lg:text-left">
        <div style="margin-top: 1rem; margin-bottom: 1rem; font-size: large">
          糟糕！這不應該出現
        </div>
        <div style="font-size: large">error message: {{ error.message }}</div>
        <button type="button" class="button" @click="handleError">
          回到首頁
        </button>
        <button type="button" class="button" @click="handleReload">
          或嘗試重新整理
        </button>
        <div>
          <p style="margin-top: 0.5rem; font-size: small">
            如果問題持續且重複發生
            <br />
            請聯繫 NTNUx 的
            <a
              href="https://github.com/sun92122/NTNUx/issues"
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

const handleError = () => clearError({ redirect: "/" });

const handleReload = () => {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.min-h-screen {
  min-height: 100vh;
}

.w-full {
  width: 100%;
}

.items-center {
  align-items: center;
}

.text-white {
  color: white;
}

.text-center {
  text-align: center;
}

.p-4 {
  padding: 1rem;
}

@media (min-width: 768px) {
  .lg\:w-1\/2 {
    width: 50%;
  }

  .lg\:text-left {
    text-align: left;
  }
}

.button {
  background-color: transparent;
  border: 1px solid white;
  border-radius: 0.375rem;
  color: white;
  padding: 0.5rem 0.75rem;
  transition: background-color 0.2s ease;
  cursor: pointer;
  margin-right: 1.5rem;
  margin-top: 1rem;
}
.button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.a {
  color: white;
  text-decoration: underline;
}
.a:hover {
  color: rgba(255, 255, 255, 0.8);
}
</style>
