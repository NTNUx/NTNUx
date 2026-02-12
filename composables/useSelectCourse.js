export function useSelectCourse() {
  const selectedCourses = useState("selectedCourses", () => ({}));
  const selectedRows = useState("selectedRows", () => ({}));
  const selectCode = useState("selectCode", () => (new Set()));
  const toast = useToast();
  const windowWidth = useState("windowWidth", () => window?.innerWidth || 1200);


  function selectCourse(course) {
    const selected = selectedRows.value;
    if (selected[course.serial_no]) {
      delete selected[course.serial_no];
      toast.add({
        severity: "info",
        summary: "已取消選課",
        detail: `${course.serial_no} ${course.course_name}`,
        life: 3000,
        group: windowWidth.value < 768 ? "bottom" : null,
      });
    } else {
      selected[course.serial_no] = course;
      toast.add({
        severity: "success",
        summary: "已選課",
        detail: `${course.serial_no} ${course.course_name}`,
        life: 3000,
        group: windowWidth.value < 768 ? "bottom" : null,
      });
    }
  }

  function selectCourseWithTerm(course, term) {
    const selected = selectedCourses.value;
    if (selected[term]) {
      if (selected[term][course.serial_no]) {
        delete selected[term][course.serial_no];
        toast.add({
          severity: "info",
          summary: "已取消選課",
          detail: `${course.serial_no} ${course.course_name} (${term})`,
          life: 3000,
          group: windowWidth.value < 768 ? "bottom" : null,
        });
      } else {
        selected[term][course.serial_no] = course;
        toast.add({
          severity: "success",
          summary: "已選課",
          detail: `${course.serial_no} ${course.course_name} (${term})`,
          life: 3000,
          group: windowWidth.value < 768 ? "bottom" : null,
        });
      }
    } else {
      selected[term] = { [course.serial_no]: course };
      toast.add({
        severity: "success",
        summary: "已選課",
        detail: `${course.serial_no} ${course.course_name} (${term})`,
        life: 3000,
        group: windowWidth.value < 768 ? "bottom" : null,
      });
    }
  }

  function checkSelectedCourse(serial_no, term = null) {
    if (term) {
      if (!selectedCourses.value[term]) return false;
      return selectedCourses.value[term]?.[serial_no] || false;
    }
    return selectedRows.value[serial_no] || false;
  }

  function selectCodeHandler(code, name) {
    if (selectCode.value.has(code)) {
      selectCode.value.delete(code);
      toast.add({
        severity: "info",
        summary: "已取消收藏",
        detail: `${code} ${name}`,
        life: 3000,
        group: windowWidth.value < 768 ? "bottom" : null,
      });
    } else {
      selectCode.value.add(code);
      toast.add({
        severity: "success",
        summary: "已收藏",
        detail: `${code} ${name}`,
        life: 3000,
        group: windowWidth.value < 768 ? "bottom" : null,
      });
    }
  }

  function checkSelectCode(code) {
    return selectCode.value.has(code);
  }

  return {
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
  }
}