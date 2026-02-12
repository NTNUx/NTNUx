export function useCourses() {
  const terms = useState("terms", () => []);
  const currentTerm = useState("currentTerm", () => null);
  const loadTermData = useState("loadTermData");
  const rowDatas = useState("rowDatas", () => ({}));
  const rowData = useState("rowData", () => []);
  const tempDatas = useState("tempDatas", () => ({}));
  const denseDatas = useState("denseDatas", () => ({})); // key: term, value: dense data
  const denseData = useState("denseData", () => ({})); // key: `{course_code}-{course_group}`, value: dense data
  const loading = useState("loading", () => true);
  const programSet = useState("programSet", () => new Set());
  const lastUpdate = useState("lastUpdate", () => ({}));
  const currentLastUpdate = useState("currentLastUpdate", () => "unknown");

  const defaultGlobalFilterFields = ["course_name", "teacher", "serial_no"];

  const fetchData = async (i) => {
    const res = await fetch(`/data/${currentTerm.value}/${i}.tsv`);
    if (!res.ok) return null;
    const text = await res.text();
    const data = tsvToJson(text);
    if (data.length === 0) return null;

    return coursesFormatter(data);
  };

  const fetchAllData = async () => {
    const fetchPromises = [];
    for (let i = 0; i <= 10; i++) {
      if (tempDatas.value[currentTerm.value]?.[i]) {
        fetchPromises.push(Promise.resolve(coursesFormatter(tempDatas.value[currentTerm.value][i])));
      } else {
        fetchPromises.push(fetchData(i));
      }
    }

    for await (const page of fetchPromises) {
      if (!page) continue;
      rowData.value = rowData.value.concat(page);
      loading.value = false;
    }
  };

  const reloadCurrentTerm = async () => {
    loading.value = true;

    if (rowDatas.value[currentTerm.value]) {
      rowData.value = rowDatas.value[currentTerm.value];
      if (!lastUpdate.value[currentTerm.value]) {
        await getLastUpdate();
      }
      currentLastUpdate.value = lastUpdate.value[currentTerm.value] || "unknown";
      loading.value = false;
      denseData.value = denseDatas.value[currentTerm.value] || {};
      return;
    }

    rowData.value = [];
    await fetchAllData();
    rowDatas.value[currentTerm.value] = rowData.value;
    await getLastUpdate();
    currentLastUpdate.value = lastUpdate.value[currentTerm.value] || "unknown";
    await fetchDenseData();
    denseDatas.value[currentTerm.value] = denseData.value;
  };

  const initTermData = async (route) => {
    if (terms.value.length > 0) {
      loading.value = false;
      return;
    }
    const termResp = await fetch("/data/terms.json");
    const termRespData = await termResp.json();
    terms.value = termRespData.terms;

    currentTerm.value = route?.query.term;
    if (!currentTerm.value || terms.value.indexOf(currentTerm.value) === -1) {
      currentTerm.value = termRespData.defaultValue;
    }

    loadTermData.value = reloadCurrentTerm;
    await reloadCurrentTerm();
  };

  const getLastUpdate = async () => {
    const res = await fetch(`/data/${currentTerm.value}/last_update.json`);
    if (!res.ok) return null;
    const data = await res.json();
    lastUpdate.value[currentTerm.value] = data.last_update;
  };

  const fetchDenseData = async () => {
    const res = await fetch(`/data/${currentTerm.value}/dense.json`);
    if (!res.ok) return null;
    const data = await res.json();
    denseData.value = data;
  }

  const courseFormatter = (course) => {
    const timeLoc = parseTimeInfo(course.time_inf);
    const timeLocList = parseTimeSlots(timeLoc);
    return {
      ...course,
      credit: Math.round(course.credit * 10) / 10,
      course_name: course.chn_name.replace(/<\/br>.*/g, "").trim(),
      time_loc: timeLoc,
      time: timeFormatter(timeLoc),
      location: locationFormatter(timeLoc),
      timeLocList: timeLocList,
      teacher: teacherNameFormatter(course.teacher),
      timeListStr: parseTimeListStr(timeLocList),
      programs: parseProgram(course.chn_name),
    };
  }

  const coursesFormatter = (courses) => {
    courses.forEach((item) => {
      item.credit = Math.round(item.credit * 10) / 10;
      item.course_name = item.chn_name.replace(/<\/br>.*/g, "").trim();
      item.time_loc = parseTimeInfo(item.time_inf);
      item.time = timeFormatter(item.time_loc);
      item.location = locationFormatter(item.time_loc);
      item.timeLocList = parseTimeSlots(item.time_loc);
      item.teacher = teacherNameFormatter(item.teacher);
      item.timeListStr = parseTimeListStr(item.timeLocList);
      item.programs = parseProgram(item.chn_name);
      item.notFull = Number(item.counter_exceptAuth) < Number(item.limit_count_h);

      if (item.programs) {
        item.programs.split("/").forEach((program) => {
          programSet.value.add(program);
        });
      }
    });

    return courses;
  };


  return {
    terms,
    currentTerm,
    rowData,
    tempDatas,
    loading,
    programSet,
    currentLastUpdate,
    reloadCurrentTerm,
    defaultGlobalFilterFields,
    initTermData,
    courseFormatter,
    tsvToJson,
  };
}

function teacherNameFormatter(teacher) {
  return teacher.replace("", "温");
}

function timeFormatter(time) {
  if (typeof time === "string") return time;
  return Object.entries(time)
    .map(([k, _]) => k)
    .join("/");
}

function locationFormatter(location) {
  if (typeof location === "string") return null;
  const values = Object.values(location).filter((v) => v !== "");
  const unique = [...new Set(values)];
  return unique.length === 1 ? unique[0] : values.join("/");
}

function parseTimeInfo(timeInf) {
  if (!timeInf || timeInf.startsWith("◎")) {
    return timeInf;
  }
  return timeInf.split(",").reduce((acc, part) => {
    const [day, time, ...locArr] = part.trim().split(" ");
    if (day && time) {
      acc[`${day} ${time}`] = locArr.join(" ");
    }
    return acc;
  }, {});
}

function parseTimeSlots(timeObj) {
  const result = [];
  if (typeof timeObj !== "object" || !timeObj) {
    return result;
  }

  for (const seg of Object.keys(timeObj)) {
    const match = seg.match(
      /([一二三四五六])\s*(\d+|A|B|C|D)(?:-(\d+|A|B|C|D))?/
    );
    if (match) {
      const [_, day, start, end] = match;
      const range = getRange(start, end || start);
      for (const period of range) {
        result.push({ day, period, loc: timeObj[seg] });
      }
    }
  }
  return result;
}

function getRange(start, end) {
  const periodOrder = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "A",
    "B",
    "C",
    "D",
  ];
  const s = periodOrder.indexOf(start);
  const e = periodOrder.indexOf(end);
  return periodOrder.slice(s, e + 1);
}

function parseTimeListStr(timeLocList) {
  if (!Array.isArray(timeLocList) || timeLocList.length === 0) {
    return "◎";
  }
  return timeLocList.map(({ day, period }) => `${day}${period.replace('10', 'X')}`).join("/");
}

function parseProgram(course_name) {
  const match = course_name.match(/.*\[ 學分學程：(.+?) \].*/)
  if (!match) return "";

  const programs = match[1].split(" ");
  return programs.length > 0 ? programs.join("/") : "";
}

function tsvToJson(tsv) {
  const lines = tsv.trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].trim().split('\t');
  return lines.slice(1).map(line => {
    const values = line.trim().split('\t');
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] ?? "";
    });
    return obj;
  });
}