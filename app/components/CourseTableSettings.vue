<template>
  <div>
    <ul class="space-y-4">
      <li v-for="(value, key) in courseTableSettingInfo" :key="key">
        <USwitch :label="value?.label || key" v-model="settingsTemp[key]" />
        <div
          v-show="settingsTemp[key]"
          v-if="value?.children"
          class="ml-6 mt-2 space-y-2"
        >
          <li
            v-for="(childValue, childKey) in value.children"
            :key="childKey"
            class="flex items-center space-x-2"
          >
            <USwitch
              :label="childValue?.label || childKey"
              :description="(childValue as any)?.description || ''"
              v-model="settingsTemp[childKey]"
              :disabled="!settingsTemp[key]"
            />
          </li>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { CourseTableSettings } from "@/composables/useCourseTable";
import {
  defaultCourseTableSettings,
  courseTableSettingInfo,
} from "@/composables/useCourseTable";

const settings = useState<CourseTableSettings>("courseTableSettings", () => ({
  ...defaultCourseTableSettings,
})); // TODO: local storage

const settingsTemp = useState<Record<string, any>>(
  "courseTableSettingsTemp",
  () => ({ ...settings.value }),
);

onMounted(() => {
  settingsTemp.value = { ...settings.value };
});
</script>
