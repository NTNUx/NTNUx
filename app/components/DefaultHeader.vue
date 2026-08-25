<template>
  <UHeader to="#" :toggle="false" :ui="{ center: 'flex' }">
    <template #left>
      <UDropdownMenu
        :items="dropdownItems"
        :content="{ sideOffset: 14 }"
        size="xl"
      >
        <UButton
          icon="tabler:menu-2"
          color="neutral"
          variant="ghost"
          size="lg"
          class="flex sm:hidden"
        />
      </UDropdownMenu>
      <UAvatar
        src="/favicon.png"
        alt="NTNUx Logo"
        size="xl"
        class="mr-2 rounded-xl hidden sm:flex"
      />
    </template>

    <template #default>
      <UNavigationMenu
        variant="link"
        class="hidden sm:flex"
        :items="navigationItems"
        content-orientation="vertical"
      />
      <UAvatar
        src="/favicon.png"
        alt="NTNUx Logo"
        size="xl"
        class="mr-2 rounded-xl flex sm:hidden"
        @click="$router.push('/')"
      />
    </template>

    <template #right>
      <ClientOnly>
        <UButton
          v-if="nextTheme === 'dark'"
          :aria-label="`Switch to dark mode`"
          icon="tabler:sun"
          color="neutral"
          variant="ghost"
          size="lg"
          class="rounded-full"
          @click="startViewTransition"
        />
        <UButton
          v-else
          :aria-label="`Switch to light mode`"
          icon="tabler:moon"
          color="neutral"
          variant="ghost"
          size="lg"
          class="rounded-full"
          @click="startViewTransition"
        />
        <template #fallback>
          <div class="size-9"></div>
        </template>
      </ClientOnly>
      <UTooltip text="Open on GitHub">
        <UButton
          aria-label="GitHub"
          icon="tabler:brand-github"
          color="neutral"
          variant="ghost"
          size="lg"
          class="rounded-full hidden sm:flex"
          to="https://github.com/ntnux/ntnux"
          target="_blank"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
const route = useRoute();
const menuActive = ref();

const navigationItems = computed(() => [
  {
    label: "選課事項",
    to: "/",
  },
  {
    label: "課程搜尋",
    to: "/search/quick",
  },
  {
    label: "課程規劃",
    children: [
      {
        label: "課表規劃",
        to: "/user/timetable",
      },
      {
        label: "收藏課程",
        to: "/user/favorites",
      },
      {
        label: "公開收藏",
        to: "/community/favorites",
      },
    ],
  },
]);

const dropdownItems = computed(() => [
  [...navigationItems.value],
  [
    {
      label: "GitHub",
      icon: "tabler:brand-github",
      to: "https://github.com/ntnux/ntnux",
      target: "_blank",
    },
  ],
]);

/// for color mode switch animation, bottum source:
/// LICENSE: MIT
/// SOURCE: https://github.com/nuxt-ui-templates/portfolio/blob/main/app/components/ColorModeButton.vue
/// Copyright (c) 2025 Nuxt UI Templates

const colorMode = useColorMode();

const nextTheme = computed(() =>
  colorMode.value === "dark" ? "light" : "dark",
);

const switchTheme = () => {
  colorMode.preference = nextTheme.value;
  useHead({
    meta: [
      {
        key: "theme-color",
        name: "theme-color",
        content: colorMode.value === "dark" ? "#1e293b" : "#f8fafc",
      },
    ],
  });
};

const startViewTransition = (event: MouseEvent) => {
  if (!document.startViewTransition) {
    switchTheme();
    return;
  }

  const { clientX: x, clientY: y } = event;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  document
    .startViewTransition(() => switchTheme())
    .ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(.76,.32,.29,.99)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
};
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  z-index: 9999;
}

::view-transition-old(root) {
  z-index: 1;
}
</style>
