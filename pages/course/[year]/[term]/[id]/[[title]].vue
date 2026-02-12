<template>
  <div class="course-details-container">
    <div class="course-details" v-if="course.course_name">
      <Button
        label="返回搜尋"
        icon="pi pi-angle-left"
        severity="secondary"
        variant="text"
        @click="$router.push('/')"
        style="padding-left: 0; padding-right: 0"
      ></Button>
      <h1>{{ course.course_name }}</h1>
      <div class="course-details-subtitle">
        <p>{{ course.acadm_year }}-{{ course.acadm_term }} 開課</p>
        <div class="course-details-subtitle-right">
          <Button
            :icon="
              checkSelectCode(course.course_code)
                ? 'pi pi-heart-fill'
                : 'pi pi-heart'
            "
            :severity="
              checkSelectCode(course.course_code) ? 'danger' : 'secondary'
            "
            variant="text"
            @click="selectCodeHandler(course.course_code, course.course_name)"
            rounded
          ></Button>
          <Button
            :label="
              checkSelectedCourse(
                course.serial_no,
                `${course.acadm_year}-${course.acadm_term}`
              )
                ? '取消'
                : '加入'
            "
            :severity="
              checkSelectedCourse(
                course.serial_no,
                `${course.acadm_year}-${course.acadm_term}`
              )
                ? 'warn'
                : 'secondary'
            "
            @click="
              selectCourseWithTerm(
                course,
                `${course.acadm_year}-${course.acadm_term}`
              )
            "
          ></Button>
        </div>
      </div>
      <Card class="course-card">
        <template #content>
          <div class="course-info-first">
            <div v-for="item in showInfo" :key="item.label">
              <div
                v-if="item.childen && item.childen.length > 0"
                class="course-info-item"
                :style="{
                  color: item.isNullValue
                    ? 'var(--p-surface-400)'
                    : 'var(--p-text)',
                }"
              >
                <Accordion :value="'1'" style="width: 100%">
                  <AccordionPanel
                    value="1"
                    :style="{ width: '100%', border: '0' }"
                  >
                    <AccordionHeader :style="{ padding: '0', width: '100%' }">
                      <div class="course-info-item">
                        <i :class="item.icon" style="font-size: 1.2rem"></i>
                        <div
                          style="flex: 1; display: flex; flex-direction: column"
                        >
                          <span
                            style="color: var(--p-surface-500); font-size: 12px"
                            >{{ item.label }}</span
                          >
                          <span style="font-size: 1.25rem">{{
                            item.value || ""
                          }}</span>
                        </div>
                      </div>
                    </AccordionHeader>
                    <AccordionContent
                      :style="{ '--p-accordion-content-padding': '0 1.25rem' }"
                    >
                      <div
                        v-for="child in item.childen"
                        :key="child"
                        :style="{ margin: '0.5rem 0', fontSize: '1.1rem' }"
                      >
                        <span>{{ child }}</span>
                      </div>
                    </AccordionContent>
                  </AccordionPanel>
                </Accordion>
              </div>
              <div
                v-else
                class="course-info-item"
                :style="{
                  color: item.isNullValue
                    ? 'var(--p-surface-400)'
                    : 'var(--p-text)',
                }"
              >
                <i :class="item.icon" style="font-size: 1.2rem"></i>
                <div style="flex: 1; display: flex; flex-direction: column">
                  <span style="color: var(--p-surface-500); font-size: 12px">{{
                    item.label
                  }}</span>
                  <span style="font-size: 1.25rem">{{ item.value || "" }}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="course-info-second"
            :style="
              windowWidth < 600
                ? { '--p-accordion-content-padding': '0 0 1.125rem 0' }
                : {}
            "
          >
            <Accordion multiple :value="['1', '2', '3']">
              <AccordionPanel value="1">
                <AccordionHeader :style="{ fontSize: '1.25rem' }">
                  備註/限修
                </AccordionHeader>
                <AccordionContent>
                  <div v-if="course.comment" class="course-info-item">
                    <i class="pi pi-comment" style="font-size: 1.2rem"></i>
                    <span style="font-size: 1.1rem">{{ course.comment }}</span>
                  </div>
                  <div v-if="course.restrict" class="course-info-item">
                    <i
                      class="pi pi-exclamation-triangle"
                      style="font-size: 1.2rem"
                    ></i>
                    <span style="font-size: 1.1rem">{{ course.restrict }}</span>
                  </div>
                  <div
                    v-if="!course.comment && !course.restrict"
                    class="course-info-item"
                  >
                    <span style="font-size: 1.1rem; color: var(--p-surface-500)"
                      >無</span
                    >
                  </div>
                </AccordionContent>
              </AccordionPanel>
              <AccordionPanel value="2">
                <AccordionHeader :style="{ fontSize: '1.25rem' }">
                  選課資訊
                </AccordionHeader>
                <AccordionContent>
                  <div
                    :style="{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 'clamp(0.5rem, 3vw - 0.5rem, 2rem)',
                      // gap: 'clamp(0.5rem, 3vw - 0.5rem, 1rem)',
                    }"
                  >
                    <div
                      v-for="[label, current, max] in [
                        [
                          '選課總人數',
                          course.counter_exceptAuth,
                          // null,
                          course.limit_count_h,
                        ],
                        [
                          '已使用授權碼',
                          Math.max(
                            0,
                            course.counter - course.counter_exceptAuth
                          ),
                          // null,
                          course.authorize_p,
                        ],
                        ['系統各校開放名額', null, course.limit],
                      ]"
                      :style="{
                        minWidth: '20%',
                      }"
                    >
                      <div
                        :style="{
                          fontSize: 'clamp(1rem, 2vw + 0.25rem, 1.2rem)',
                          marginBottom: '0.5rem',
                        }"
                      >
                        <span>{{ label }}</span>
                      </div>
                      <div
                        class="course-info-item"
                        :style="{
                          fontSize: '1.2rem',
                          fontFamily: 'sans-serif',
                          alignItems: 'flex-end',
                          gap: '0.2rem',
                        }"
                      >
                        <div
                          v-if="current !== null"
                          :style="{
                            fontSize: '1.75rem',
                            fontWeight: '900',
                          }"
                        >
                          {{ current }}
                        </div>
                        <div v-if="current !== null">/</div>
                        <div
                          :style="{
                            fontSize: current !== null ? '1.2rem' : '1.75rem',
                            fontWeight: current !== null ? '400' : '900',
                          }"
                        >
                          {{ max }}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionPanel>
              <AccordionPanel value="3">
                <AccordionHeader :style="{ fontSize: '1.25rem' }">
                  課程簡介
                </AccordionHeader>
                <AccordionContent>
                  <div
                    v-if="course.description"
                    class="course-info-item"
                    style="flex-direction: column; align-items: flex-start"
                  >
                    <span
                      v-html="
                        course.description.brief ||
                        course.description.description
                      "
                      style="
                        font-size: 1.1rem;
                        white-space: pre-wrap;
                        text-indent: 2em;
                      "
                    ></span>
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </template>
      </Card>
      <Button
        v-if="!showIframe || showIframeLoading"
        label="顯示課程大綱"
        icon="pi pi-file"
        severity="contrast"
        variant="outlined"
        @click="showIframeEvent"
        :loading="showIframeLoading"
        :style="{ marginTop: '20px', width: '100%' }"
      ></Button>
      <div
        v-show="showIframe"
        :style="{
          height:
            windowWidth < 950
              ? ((windowWidth - 10) / 950) * 2000 + 'px'
              : '800px',
          overflow: 'hidden',
          maxWidth: '95vw',
        }"
      >
        <iframe
          :src="
            'https://courseap2.itc.ntnu.edu.tw/acadmOpenCourse/SyllabusCtrl?' +
            `year=${course.acadm_year}&term=${course.acadm_term}&courseCode=${course.course_code}&courseGroup=${course.course_group}&deptCode=${course.dept_code}&formS=${course.form_s}&classes1=${course.classes}&deptGroup=${course.dept_group_name}`
          "
          :width="windowWidth < 950 ? `950px` : '100%'"
          :height="windowWidth < 950 ? '2000px' : '800px'"
          frameborder="0"
          :style="{
            marginTop: '20px',
            background: '#fff',
            '-webkit-transform': `scale(${
              windowWidth < 950 ? (windowWidth - 10) / 950 : 1
            })`,
            '-moz-transform': `scale(${
              windowWidth < 950 ? (windowWidth - 10) / 950 : 1
            })`,
            transformOrigin: 'top left',
            marginLeft: 'auto',
            marginRight: 'auto',
          }"
        ></iframe>
      </div>
    </div>
    <div v-else class="course-details">
      <h2>Loading course details...</h2>
    </div>
  </div>
</template>

<script setup>
import {
  Button,
  Card,
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
  Knob,
} from "primevue";

import { useCourses } from "~/composables/useCourses";
import { useSelectCourse } from "~/composables/useSelectCourse";

const route = useRoute();

const {
  terms,
  currentTerm,
  rowData,
  tempDatas,
  loading,
  programSet,
  reloadCurrentTerm,
  defaultGlobalFilterFields,
  initTermData,
  courseFormatter,
  tsvToJson,
} = useCourses();

const {
  selectedCourses,
  selectedRows,
  selectCode,
  toast,
  windowWidth,
  selectCourse,
  selectCourseWithTerm,
  checkSelectedCourse,
  selectCodeHandler,
  checkSelectCode,
} = useSelectCourse();

const course = ref({
  year: route.params.year,
  term: route.params.term,
  serial_no: route.params.id,
});

if (route.params.title) {
  useSeoMeta({
    title: `${course.value.year}-${course.value.term} ${decodeURIComponent(
      route.params.title
    )}`,
  });
}

const showIframe = ref(false);
const showIframeLoading = ref(false);

const showInfo = ref([]);
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

if (course.value.year && course.value.term && course.value.serial_no) {
  getCourseData();
} else {
  // Handle the case where parameters are not provided
  console.error("Missing course parameters", {
    year: course.value.year,
    term: course.value.term,
    serial_no: course.value.serial_no,
  });
}

function getCourseData() {
  const rowDatas = useState("rowDatas", () => ({}));

  const acadm = `${course.value.year}-${course.value.term}`;

  function beforeReturn() {
    useSeoMeta({
      title: `${acadm} ${course.value.course_name}`,
    });
    if (route.params.title !== course.value.course_name) {
      useRouter().replace({
        params: {
          ...route.params,
          title: course.value.course_name,
        },
        shallow: true,
      });
    }
    setTimeout(() => {
      getDescription(course.value.course_code).then((description) => {
        course.value.description = description;
        useHeadSafe({
          meta: [
            {
              name: "description",
              content: description
                ? description.brief || description.description
                : "",
            },
            {
              property: "og:title",
              content: `${acadm} ${course.value.course_name}`,
            },
            {
              property: "og:description",
              content: description
                ? description.brief || description.description
                : "",
            },
            {
              property: "twitter:title",
              content: `${acadm} ${course.value.course_name}`,
            },
            {
              property: "twitter:description",
              content: description
                ? description.brief || description.description
                : "",
            },
          ],
          link: [
            {
              rel: "canonical",
              href: `${useRuntimeConfig().public.baseURL}/course/${
                course.value.year
              }/${course.value.term}/${
                course.value.serial_no
              }/${encodeURIComponent(course.value.course_name)}`,
            },
          ],
        });
      });
    });
  }

  if (rowDatas.value[acadm]) {
    for (const rowData of rowDatas.value[acadm]) {
      if (rowData.serial_no === course.value.serial_no) {
        course.value = {
          ...rowData,
          description: null,
        };
        showInfo.value = getShowInfo(course.value);
        beforeReturn();
        return;
      }
    }
  }
  if (
    tempDatas.value[acadm] &&
    tempDatas.value[acadm][(Math.floor(course.value.serial_no / 1000) + 1) % 10]
  ) {
    for (const rowData of tempDatas.value[acadm][
      Math.floor(course.value.serial_no / 1000) + 1
    ]) {
      if (rowData.serial_no === course.value.serial_no) {
        course.value = {
          ...courseFormatter(rowData),
          description: null,
        };
        showInfo.value = getShowInfo(course.value);
        beforeReturn();
        return;
      }
    }
  }

  // If the course data is not found in the state, fetch it from the API
  const i = Math.floor(course.value.serial_no / 1000) % 10;
  fetch(`/data/${acadm}/${i}.tsv`)
    .then((response) => response.text())
    .then(async (data) => {
      data = await tsvToJson(data);
      tempDatas.value[acadm] = tempDatas.value[acadm] || {};
      tempDatas.value[acadm][i] = data;
      for (const rowData of data) {
        if (rowData.serial_no === course.value.serial_no) {
          course.value = {
            ...courseFormatter(rowData),
            description: null,
          };
          showInfo.value = getShowInfo(course.value);
          beforeReturn();
          return;
        }
      }
      console.error("Course not found in fetched data");
    })
    .catch((error) => {
      console.error("Error fetching course data:", error);
    });
}

async function getDescription(course_code) {
  const proxyUrl = "https://cors.ntnux.org/?course_code=";

  return await fetch(proxyUrl + course_code)
    .then(async (response) => {
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        return {
          description: data.data[0].CourseDescription || "",
          brief: data.data[0].brief || "",
        };
      } else {
        console.error("Description not found in response", data);
        return "No description available.";
      }
    })
    .catch((error) => {
      console.error("Error fetching course description:", error);
      return "Error fetching description.";
    });
}

function getShowInfo(course) {
  return [
    {
      label: "開課序號",
      icon: "pi pi-hashtag",
      value: course.serial_no,
    },
    {
      label: "科目代碼",
      icon: "pi pi-code",
      value: course.course_code,
    },
    {
      label: "開課單位",
      icon: "pi pi-building",
      value: course.dept_chiabbr,
    },
    {
      icon: "pi pi-objects-column",
      value: optionMap[course.option_code] || course.option_code,
      childen:
        typeof course.generalCore === "string" && course.generalCore
          ? course.generalCore.split("/").map((item) => {
              return generalCoreMap[item] || item;
            })
          : [],
    },
    {
      icon: "pi pi-graduation-cap",
      value: `${course.credit} 學分`,
      isNullValue: !course.credit,
    },
    {
      label: "授課教師",
      icon: "pi pi-user",
      value: course.teacher || "無",
      isNullValue: !course.teacher,
    },
    {
      label: "上課時間",
      icon: "pi pi-clock",
      value: course.time || "無",
      isNullValue: !course.time,
    },
    {
      label: "上課地點",
      icon: "pi pi-map-marker",
      value: course.location || "無",
      isNullValue: !course.location,
    },
    {
      icon: "pi pi-language",
      value:
        course.eng_teach === "是"
          ? "英文授課"
          : course.comment.match(/◎*語\s*授課/)
          ? "國家語言授課"
          : "中文授課",
    },
    {
      label:
        typeof course.programs === "string" &&
        course.programs.split("/").length > 1
          ? "學分學程"
          : "",
      icon: "pi pi-book",
      value:
        typeof course.programs !== "string" || course.programs === ""
          ? "無學分學程"
          : course.programs.split("/").length > 1
          ? `${course.programs.split("/").length} 個學分學程`
          : course.programs,
      isNullValue:
        typeof course.programs !== "string" || course.programs === "",
      childen:
        typeof course.programs === "string" &&
        course.programs.split("/").length > 1
          ? course.programs.split("/")
          : [],
    },
  ];
}

function showIframeEvent() {
  showIframeLoading.value = true;
  setTimeout(() => {
    showIframeLoading.value = false;
    showIframe.value = true;
  }, 500);
}

onMounted(async () => {
  const updateMenubar = useState("updateMenubar");

  await initTermData(route);

  updateMenubar.value();
});
</script>

<style scoped lang="scss">
h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.course-details-container {
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  display: table;
  min-height: 95vh;
}

.course-details {
  padding: 20px;
}
@media screen and (min-width: 992px) {
  .course-details {
    width: clamp(992px, 88%, 1632px);
    margin: 0 auto;
  }
}

.course-details-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.course-details-subtitle-right {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.course-info-item {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  align-items: center;
  gap: 1rem;
  min-height: 2.5rem;
}

@media screen and (max-width: 600px) {
  .course-details {
    padding: 0 10px 10px;
  }

  .p-accordionheader,
  .p-accordioncontent-content {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>

<style lang="scss">
@media screen and (min-width: 760px) {
  .p-card-content {
    display: grid;
    grid-template-columns: 20rem auto;
    gap: 1rem;
  }
}
</style>
