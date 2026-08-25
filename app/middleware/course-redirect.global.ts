export default defineNuxtRouteMiddleware((to) => {
  const { path, query } = to;

  // /home 和 /home/ -> /
  if (path === "/home" || path === "/home/") {
    return navigateTo("/", { redirectCode: 301 });
  }

  // 檢查是否包含必要的 query 參數 (year, term, id)
  // 這是為了鎖定 Pattern 1 和 Pattern 2
  if (query.year && query.term && query.id && path.startsWith("/course")) {
    // 提取參數
    const year = query.year;
    const term = query.term;
    const id = query.id;
    let title = "";

    // 判斷是哪種舊網址模式

    // 情況 A: Pattern 2 - /courses/{title}?year=...
    // 判斷方式：路徑是 /courses/ 開頭，且後面有一段字串 (title)
    const pathSegments = path.split("/").filter((p) => p); // 移除空字串
    if (pathSegments.length === 2 && pathSegments[0]?.startsWith("course")) {
      // pathSegments[1] 就是 title
      title = pathSegments[1] || "";
    }

    // 情況 B: Pattern 1 - /courses/?year=...
    // 此時 path 可能只是 /courses 或 /courses/

    // 建構新網址
    // 有 title，導向 /courses/{year}/{term}/{id}/{title}
    // 沒 title (Pattern 1)，導向 /courses/{year}/{term}/{id}
    let newPath = `/courses/${year}/${term}/${id}`;
    if (title) {
      newPath += `/${encodeURIComponent(decodeURIComponent(title))}`;
    }

    // 執行 301 永久轉址 (for SEO)
    return navigateTo(newPath, { redirectCode: 301 });
  }
});
