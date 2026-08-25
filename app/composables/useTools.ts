import { compressToBase64, decompressFromBase64 } from "lz-string";
import { JSONC } from "jsonc.min";

export function jsonLzEncode(obj: any) {
  try {
    // return compressToBase64(JSONC.minify(obj));
    if (typeof obj === "string") {
      return compressToBase64(obj);
    } else {
      const jsonString = JSONC.minify(JSONC.stringify(obj));
      return compressToBase64(jsonString);
    }
  } catch (e) {
    console.error("Failed to compress JSON:", e);
    return "";
  }
}

export function jsonLzDecode(str: string) {
  try {
    if (!str) return null;
    return JSONC.parse(decompressFromBase64(str));
  } catch (e) {
    console.error("Failed to decompress JSON:", e);
    return null;
  }
}

function customToast(
  id: string,
  title: string,
  icon: string = "tabler:copy",
  description?: string,
) {
  useToast().add({
    id: id,
    title: title,
    description: description,
    icon: icon,
    progress: false,
    type: "foreground",
    duration: 1500,
  });
}

export function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  customToast(
    `copy-${label}`,
    `已複製${label}（${text.length > 10 ? text.slice(0, 10) + "..." : text}）`,
    "tabler:copy",
  );
}

export function addToTimetableToast(courseName: string, courseId: string) {
  customToast(
    "timetable",
    `${courseName}（${courseId}）`,
    "tabler:check",
    "已加入課表",
  );
}
export function removeFromTimetableToast(courseName: string, courseId: string) {
  customToast(
    "timetable",
    `${courseName}（${courseId}）`,
    "tabler:x",
    "已從課表移除",
  );
}

export function addToFavoritesToast(courseName: string, courseId: string) {
  customToast(
    "favorites",
    `${courseName}（${courseId}）`,
    "tabler:heart-filled",
    "已加入收藏",
  );
}
export function removeFromFavoritesToast(courseName: string, courseId: string) {
  customToast(
    "favorites",
    `${courseName}（${courseId}）`,
    "tabler:heart-broken",
    "已從收藏移除",
  );
}

export const defaultModalOptions = {
  open: false,
  title: "",
  description: "",
  close: false,
  slots: {
    body: "",
    footer: "",
  },
};
export function addGlobalModal(attr: Record<string, any>) {
  const globalModal = useState("globalModal", () => ({
    ...defaultModalOptions,
  }));

  Object.assign(globalModal.value, attr);

  globalModal.value.open = true;
}
