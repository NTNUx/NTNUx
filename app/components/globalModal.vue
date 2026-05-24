<template>
  <UModal
    v-model:open="globalModal.open"
    :close="globalModal.close"
    :ui="{
      wrapper: 'pr-6',
      description: 'whitespace-pre-wrap',
    }"
  >
    <template #title v-if="globalModal.title">
      <div v-html="globalModal.title"></div>
    </template>
    <template #description v-if="globalModal.description">
      <div v-html="globalModal.description"></div>
    </template>

    <template #body v-if="globalModal.slots?.body"> </template>

    <template #footer v-if="globalModal.slots?.footer">
      <div
        v-if="globalModal.slots.footer === 'timetable-warning-footer'"
        class="w-full flex justify-end"
      >
        <UButton
          label="不再提醒"
          variant="outline"
          class="mr-2"
          @click="
            () => {
              setTimetableAlertIgnore(true);
              globalModal.open = false;
            }
          "
        />
        <UButton
          label="我知道了"
          color="primary"
          @click="globalModal.open = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { defaultModalOptions } from "@/composables/useTools";
import { setTimetableAlertIgnore } from "@/composables/useTimetable";

const globalModal = useState("globalModal", () => ({
  ...defaultModalOptions,
}));
</script>
