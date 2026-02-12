<template>
  <div class="course-row">
    <div class="course-cell course-code">
      <span> {{ course.serial_no }}</span>
      <span>{{ course.course_code }}</span>
    </div>
    <div class="course-cell course-title">
      <span class="course-name">
        <Button variant="link" size="large" asChild>
          <NuxtLink
            :to="{
              // path: '/course',
              // query: {
              //   year: course.acadm_year,
              //   term: course.acadm_term,
              //   id: course.serial_no,
              // },
              path:
                '/course/' +
                `${course.acadm_year}/${course.acadm_term}/${
                  course.serial_no
                }/${encodeURIComponent(course.course_name)}`,
            }"
          >
            {{ course.course_name }}
          </NuxtLink>
        </Button>
      </span>
      <div class="message-group">
        <Message
          icon="pi pi-building"
          severity="secondary"
          class="custom-message"
          >{{ course.dept_chiabbr }}</Message
        >
        <Message
          icon="pi pi-user"
          severity="secondary"
          class="custom-message"
          >{{ course.teacher }}</Message
        >
        <Message
          v-if="course.time && course.time !== '◎密集課程'"
          icon="pi pi-clock"
          :severity="
            course.time.match(/.* (0|1)([-/\n\r]|$)/) ? 'warn' : 'secondary'
          "
          class="custom-message"
          >{{ course.time }}</Message
        >
        <Message
          v-if="course.time == '◎密集課程'"
          icon="pi pi-clock"
          severity="warn"
          class="custom-message"
          style="cursor: pointer"
          @click="toggle($event)"
        >
          <div style="text-decoration: underline">密集課程</div>
        </Message>
        <Popover ref="densePopover">
          <span style="width: 20rem; white-space: nowrap">
            <div
              v-for="value in denseData[
                `${course.course_code}-${course.course_group}`
              ] || []"
              :key="value"
            >
              {{ value.date }}: {{ value.time_location }}
            </div>
          </span>
        </Popover>
        <Message
          icon="pi pi-map-marker"
          severity="secondary"
          class="custom-message"
          v-if="course.location"
          >{{ course.location }}</Message
        >
      </div>
    </div>
    <div class="course-cell">
      <div class="message-group">
        <Message severity="secondary" class="custom-message"
          >{{ course.credit }} 學分</Message
        >
        <Message severity="secondary" class="custom-message">{{
          optionMap[course.option_code] || course.option_code
        }}</Message>
        <Message
          v-if="course.generalCore"
          v-for="item in course.generalCore.split('/')"
          :key="item"
          icon="pi pi-objects-column"
          severity="secondary"
          class="custom-message"
          >{{ generalCoreMap[item] || item }}</Message
        >
        <Message
          v-if="course.programs"
          v-for="item in course.programs.split('/')"
          :key="item"
          icon="pi pi-book"
          severity="secondary"
          class="custom-message"
          >{{ item }}</Message
        >
        <Message
          icon="pi pi-users"
          :severity="course.limit_count_h > 0 ? 'secondary' : 'warn'"
          class="custom-message"
          >{{ `${course.limit_count_h} 人` }}</Message
        >
        <Message
          v-if="course.eng_teach === '是'"
          severity="error"
          class="custom-message"
          >英文授課</Message
        >
      </div>
    </div>
    <div class="course-cell course-comment">
      <span v-if="course.restrict">
        {{
          course.restrict.replace(/<\/br>/g, "\n").replace(/(?<=.)◎/g, "\n◎")
        }}
      </span>
      <span v-if="course.comment">
        {{ course.comment.replace(/<\/br>/g, "\n") }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Message, Button, Popover } from "primevue";

defineProps({
  course: {
    type: Object,
    required: true,
  },
});

const optionMap = {
  必: "必修",
  選: "選修",
  通: "通識",
};
const generalCoreMap = {
  A1UG: "人文藝術",
  A2UG: "社會科學",
  A3UG: "自然科學",
  A4UG: "邏輯運算",
  B1UG: "學院共同課程",
  B2UG: "跨域專業探索課程",
  B3UG: "大學入門",
  C1UG: "專題探究",
  C2UG: "MOOCs",
};

const densePopover = ref(null);
const denseData = useState("denseData", () => ({}));
const toggle = (e) => {
  if (densePopover.value) {
    densePopover.value.toggle(e);
  }
};
</script>

<style lang="scss">
.course-row {
  display: grid;
  grid-template-columns: 64px 6fr 6fr 7fr auto;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
}

.course-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

@media screen and (max-width: 768px) {
  .course-row {
    grid-template-columns: 1fr;
  }

  .course-cell {
    flex-direction: row;
    justify-content: flex-start;
  }

  .course-title,
  .course-comment {
    flex-direction: column;
  }
}

.course-name {
  font-size: medium;

  a {
    font-weight: bold;
    color: var(--text-color);
    padding: 0;
  }
}

.message-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.custom-message {
  --p-message-content-padding: 0.25rem 0.5rem;
  --p-message-text-font-size: smaller;
}
</style>
