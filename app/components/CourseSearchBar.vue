<template>
  <div class="search-bar-container w-full flex justify-center">
    <div class="search-bar w-fit m-auto mb-4 mt-20">
      <UInput
        v-model="golbalFilterInput"
        placeholder="搜尋課程名稱、教師、課程號碼"
        clearable
        class="search-input w-80"
      />
      <UButton
        label="搜尋"
        class="search-button ml-2"
        @click="updateGolbalFilterByInput(golbalFilterInput)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useCourseFilter,
  updateGolbalFilterByInput,
} from "~/composables/useCourseFilter";
const { golbalFilter } = useCourseFilter();

const golbalFilterInput = ref("");
</script>
