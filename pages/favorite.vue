<template>
  <div class="container">
    <DataTable :value="selectionCodeDatas" class="p-datatable-striped">
      <template #header>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span>收藏課程</span>
          <!-- 匯入收藏 -->
          <Button
            icon="pi pi-file-import"
            label="匯入收藏課程"
            class="p-button-text p-button-secondary"
            @click="isShowFavoriteImport = true"
          ></Button>
        </div>
      </template>

      <template #empty>
        <div class="flex align-items-center justify-content-center">
          <i class="pi pi-exclamation-triangle mr-2" />
          <span>沒有收藏的課程</span>
        </div>
      </template>

      <Column
        v-for="header in headers"
        :key="header"
        :field="header"
        :header="header"
        :sortable="true"
        :style="{ textAlign: 'center' }"
      >
        <template #body="{ data }">
          <span>{{ data[header] }}</span>
        </template>
      </Column>
    </DataTable>

    <OrderList
      v-if="selectionCodeNotFound?.length > 0"
      v-model="selectionCodeNotFound"
      :listStyle="{ height: 'calc(100vh - 200px)' }"
      :style="{ width: '100%' }"
      :header="'未找到的收藏課程'"
      :itemStyle="{ textAlign: 'center' }"
      :buttonProps="{
        style: { display: 'none' },
      }"
    >
      <template #option="{ option }">
        {{ option }}
      </template>
    </OrderList>

    <Dialog
      v-model:visible="isShowFavoriteImport"
      header="匯入收藏課程"
      modal
      :style="{ width: '50vw' }"
      :content-style="{ margin: '0 0 1rem' }"
      :footer="null"
    >
      <div class="p-d-flex p-flex-column p-ai-center">
        <!-- 從文字匯入 paste -->
        <FloatLabel variant="in">
          <Textarea
            id="import_textarea"
            v-model="importText"
            rows="5"
            cols="50"
            style="resize: none"
          ></Textarea>
          <label for="import_textarea" style="color: var(--p-floatlabel-color)"
            >複數科目代碼以空格、換行、逗號或頓號隔開</label
          >
        </FloatLabel>
        <FileUpload
          class="p-mt-3"
          name="file"
          accept=".txt,.tsv"
          :auto="true"
          :maxFileSize="1000000"
          :chooseLabel="'選擇檔案'"
          :uploadLabel="'上傳檔案'"
          :cancelLabel="'取消'"
          @upload="
            (e) => {
              importText += e.files[0].text;
            }
          "
          @error="
            (e) => {
              importText = '';
              console.error('File upload error:', e);
            }
          "
        ></FileUpload>
        <Button
          label="匯入"
          icon="pi pi-check"
          class="p-button-text p-button-secondary"
          @click="importHandler"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import {
  DataTable,
  Column,
  Dialog,
  Button,
  OrderList,
  Textarea,
  FloatLabel,
  FileUpload,
} from "primevue";

import { useSelectCourse } from "~/composables/useSelectCourse";

const { selectCode } = useSelectCourse();
const selectionCodeDatas = useState("selectionCodeDatas", () => []);
const selectionCodeNotFound = useState("selectionCodeNotFound", () => []);
const tsvDatas = useState("tsvDatas", () => []);

const isShowFavoriteImport = ref(false);
const importText = ref("");

const headers = ref([
  "學年度",
  "開課系所代碼",
  "開課系所名稱",
  "科目代碼",
  "科目中文名稱",
  "科目英文名稱",
  "必選修",
  "上學期學分",
  "下學期學分",
  "停開",
]);

async function loadAndSearchTSV() {
  if (tsvDatas?.value?.length < 1) {
    const res = await fetch("./data/113.tsv");
    const text = await res.text();

    const lines = text.replace(/\r/g, "").trim().split("\n");
    const tsvHheaders = lines[0].split("\t");
    for (let i = 0; i < tsvHheaders.length; i++) {
      tsvHheaders[i] = tsvHheaders[i].trim();
    }
    while (tsvHheaders[-1] === "") {
      tsvHheaders.pop();
    }
    const data = lines.slice(1).map((line) => {
      const obj = {};
      line
        .split("\t")
        .forEach((val, idx) => (obj[tsvHheaders[idx]] = val.trim()));
      return obj;
    });

    tsvDatas.value = data;
  }

  selectionCodeDatas.value = tsvDatas.value.filter((row) =>
    [...selectCode.value].includes(row.科目代碼)
  );

  selectionCodeNotFound.value = [...selectCode.value].filter(
    (code) => !selectionCodeDatas.value.some((row) => row.科目代碼 === code)
  );
}

function importHandler() {
  const importCode = importText.value
    .split(/[\s,，、\n]+/)
    .filter((code) => code.trim() !== "");
  importCode.forEach((code) => {
    if (!selectCode.value.includes(code)) {
      selectCode.value.push(code);
    }
  });
  importText.value = "";
  isShowFavoriteImport.value = false;
  loadAndSearchTSV();
}

loadAndSearchTSV();
</script>
