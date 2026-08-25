<template>
  <div
    class="course-carousel-container w-full flex flex-col items-center justify-center py-6 overflow-hidden"
  >
    <!-- title -->
    <div class="md:text-lg font-bold mb-2">
      {{ year }} 學年度第 {{ semester }} 學期
    </div>
    <div class="text-lg md:text-4xl font-bold mb-6">選課日程</div>

    <!-- carousel -->
    <ClientOnly>
      <UCarousel
        ref="carousel"
        v-slot="{ item }"
        :items="carouselItem"
        class-names
        prev-icon="tabler:arrow-narrow-left"
        next-icon="tabler:arrow-narrow-right"
        class="mx-auto max-w-[98vw] w-240"
        :ui="{
          viewport: 'overflow-visible hide-scrollbar',
          container: 'ms-0',
          item: 'h-auto basis-xs ps-0 w-xs',
        }"
      >
        <UCard
          variant="soft"
          class="mx-2 bg-white dark:bg-gray-800 shadow-md"
          :class="item.title ? '' : 'collapse'"
          :ui="{
            header: 'border-b-0',
            body: 'border-b-0',
            footer: 'sm:px-4',
          }"
        >
          <template #header>
            <div
              class="flex flex-col text-lg font-bold items-center justify-center select-none"
            >
              <div>
                {{ item?.title }}
              </div>
              <div>
                <span v-if="item.dateTime[0]?.time" class="text-sm text-dimmed">
                  {{ item.dateTime[0]?.time }}
                </span>
                <span class="text-3xl" :style="{ color: item.color }">
                  {{ item.dateTime[0]?.date }}
                </span>
                <span v-if="item.dateTime[1]" class="text-3xl"> - </span>
                <span
                  v-if="item.dateTime[1]"
                  class="text-3xl"
                  :style="{ color: item.color }"
                >
                  {{ item.dateTime[1]?.date }}
                </span>
                <span v-if="item.dateTime[1]?.time" class="text-sm text-dimmed">
                  {{ item.dateTime[1]?.time }}
                </span>
              </div>
            </div>
          </template>

          <div class="h-64 select-none">
            <UTimeline
              v-if="item.step"
              :items="
                Array.from(
                  item.step.entries().map(([index, step]) => ({
                    ...step,
                    icon: step.icon || `tabler:number-${index + 1}`,
                  })),
                )
              "
              class="mt-4"
              :ui="{
                date: 'text-md',
                title: 'text-md',
                description: 'whitespace-pre-line',
                wrapper: 'pb-4',
              }"
              color="neutral"
            />
          </div>

          <template #footer>
            <div class="h-6 select-none">
              <UButton
                v-if="item.info"
                :label="item.info"
                :to="item.infoUrl"
                target="_blank"
                icon="tabler:external-link"
                variant="link"
                color="neutral"
              />
            </div>
          </template>
        </UCard>
      </UCarousel>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { TimelineItem } from "@nuxt/ui";
import { jsonLzDecode } from "@/composables/useTools";

const carousel = useTemplateRef("carousel");
const config = useRuntimeConfig();

interface CourseCarouselItem {
  title?: string;
  dateTime: Array<{ date: string; time?: string }>;
  color: string;
  step?: TimelineItem[];
  info?: string;
  infoUrl?: string;
}
interface ScheduleData {
  year: string;
  term: string;
  items: CourseCarouselItem[];
}
const scheduleData = useState<ScheduleData>("schedule", () => {
  try {
    const parsed = jsonLzDecode(config.public.ntnuxScheduleLz) as ScheduleData;
    if (Array.isArray(parsed)) {
      return { year: "", term: "", items: parsed };
    } else {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse schedule:", {
      error: e,
      rawData: config.public.ntnuxScheduleLz,
    });
    return { year: "", term: "", items: [] };
  }
});
const items = computed(() => scheduleData.value?.items || []);
const year = computed(() => scheduleData.value?.year || "");
const semester = computed(() => scheduleData.value?.term || "");
// const carouselItem = computed<CourseCarouselItem[]>(() => {
//   const emptyItem: CourseCarouselItem = {
//     dateTime: [],
//     color: "",
//   };
//   return [
//     emptyItem,
//     emptyItem,
//     emptyItem,
//     ...items.value,
//     emptyItem,
//     emptyItem,
//     emptyItem,
//   ];
// });
const carouselItem = ref<CourseCarouselItem[]>(items.value);
watch(
  () => carousel.value?.emblaApi?.scrollSnapList()?.length,
  () => {
    if (
      (carousel.value?.emblaApi?.scrollSnapList()?.length || 0) >
      items.value.length
    ) {
      return;
    }
    const emptyItem: CourseCarouselItem = {
      dateTime: [],
      color: "",
    };
    carouselItem.value = [emptyItem, ...carouselItem.value, emptyItem];
  },
  { immediate: true },
);

function scrollToCurrent() {
  if (!carousel.value) return;
  const now = new Date();
  const currentIndex = items.value.findIndex((item) => {
    // get the latest item in dateTime
    const endTime = item.dateTime[item.dateTime.length - 1];
    if (!endTime) return false;
    const dateParts = endTime.date.split("/").map(Number);
    const [endYear, endMonth, endDay] =
      dateParts.length === 3 ? dateParts : [null, dateParts[0], dateParts[1]];
    // use current year if year is not provided
    if (!endMonth || !endDay) return false;
    const _year = ref(endYear);
    if (endYear && endYear < 1911) {
      _year.value = endYear + 1911;
    } else {
      _year.value = now.getFullYear();
    }
    const endDate = new Date(_year.value, endMonth - 1, endDay);
    if (now <= endDate) {
      return true;
    }
    return false;
  });
  const shiftIndex =
    ((carousel.value?.emblaApi?.scrollSnapList()?.length ??
      items.value.length) - items.value.length || 0) / 2;
  if (currentIndex !== -1) {
    carousel.value?.emblaApi?.scrollTo(currentIndex + Math.floor(shiftIndex));
  } else {
    // if no upcoming schedule, scroll to the last one
    carousel.value?.emblaApi?.scrollTo(
      items.value.length - 1 + Math.floor(shiftIndex),
    );
  }
}

onMounted(() => {
  setTimeout(() => {
    scrollToCurrent();
  }, 200);
});
</script>
