import time
import argparse
import requests
import json
import re

BASE = "https://courseap2.itc.ntnu.edu.tw"
INDEX_URL = f"{BASE}/acadmOpenCourse/index.jsp"
API_URL = f"{BASE}/acadmOpenCourse/CofopdlCtrl"
DEPT_API_URL = f"{BASE}/acadmOpenCourse/CofnameCtrl"
GU_API_URL = f"{BASE}/acadmOpenCourse/cofopdlGeneral.do"
DENSE_API_URL = f"{BASE}/acadmOpenCourse/coftmscDate.do"
GU_CORE = ['A1UG', 'A2UG', 'A3UG', 'A4UG',
           'B1UG', 'B2UG', 'B3UG', 'C1UG', 'C2UG']
GU_MAP = {
    "人文藝術": "A1UG",
    "社會科學": "A2UG",
    "自然科學": "A3UG",
    "邏輯運算": "A4UG",
    "學院共同課程": "B1UG",
    "跨域專業探索課程": "B2UG",
    "大學入門": "B3UG",
    "專題探究": "C1UG",
    "MOOCs": "C2UG",
    "所有通識": "all"
}


def build_params(year: int, term: int, dept: str, limit: int = 99999):
    """組出 GET 參數 dict"""
    return {
        "_dc": int(time.time() * 1000),  # 避免快取
        "acadmYear": year,
        "acadmTerm": term,
        "deptCode": dept,
        "action": "showGrid",
        "language": "chinese",
        "start": 0,
        "limit": limit,
        "page": 1,
        # 其餘過濾條件全留空或 N
        "chn": "", "engTeach": "N", "clang": "N",
        "moocs": "N", "remoteCourse": "N", "digital": "N",
        "adsl": "N", "zuDept": "", "classCode": "", "kind": "",
        "generalCore": "", "teacher": "", "serial_number": "",
        "course_code": "",
    }


def build_dept_params(year: int, term: int, limit: int = 25):
    """組出科系列表的 GET 參數 dict"""
    return {
        "_dc": int(time.time() * 1000),  # 避免快取
        "action": "cof",
        "type": "chn",
        "year": year,
        "term": term,
        "page": 1,
        "start": 0,
        "limit": limit,
    }


def getGUCore(course: dict, s: requests.Session) -> str:
    """取得通識核心課程代碼"""
    params = {
        "_dc": int(time.time() * 1000),  # 避免快取
        "action": "show",
        "acadmYear": course["acadm_year"],
        "acadmTerm": course["acadm_term"],
        "courseCode": course["course_code"],
        "courseGroup": course["course_group"],
        "deptCode": course["dept_code"],
        "deptGroup": course.get("dept_group_name", ""),
        "formS": course.get("form_s", ""),
        "aClass": course.get("classes", ""),
        "language": "chinese",
    }
    resp = s.get(GU_API_URL, params=params)
    resp.raise_for_status()
    data = resp.json()
    # 只擷取 109以後入學 的通識核心課程代碼
    if "msg" in data:
        msg = data["msg"]
        match = re.search(r"109以後入學：([^<]+)", msg)
        if match:
            core = match.group(1).strip()
            if core in GU_MAP:
                return GU_MAP[core]
            else:
                print(f"未知的通識核心課程代碼: {core}")
    return ""


def getDenseCourseInfo(course: dict, s: requests.Session) -> list[dict]:
    params = {
        "_dc": int(time.time() * 1000),  # 避免快取
        "action": "show",
        "acadmYear": course["acadm_year"],
        "acadmTerm": course["acadm_term"],
        "courseCode": course["course_code"],
        "courseGroup": course["course_group"],
        "deptCode": course["dept_code"],
        "deptGroup": course.get("dept_group_name", ""),
        "formS": course.get("form_s", ""),
        "aClass": course.get("classes", ""),
        "language": "chinese",
    }
    resp = s.get(DENSE_API_URL, params=params)
    resp.raise_for_status()
    # {"msg":"<span style=\"white-space:nowrap\"> 20250623(一) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250624(二) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250630(一) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250701(二) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250707(一) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250708(二) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250714(一) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><br>20250715(二) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603<\/a><\/span>","success":true}
    data: dict = resp.json()
    msg: str = data.get("msg", "")
    # 提取日期和時間地點資訊，源資料以<br>分隔，時間地點以<a>標籤包裹
    msg = msg.replace("<br>", "\n").replace(
        "<span style=\"white-space:nowrap\">", "").replace("</span>", "").strip()
    # 20250623(一) <a href=\"https://goo.gl/maps/fgmMngfzS5V3hc9T9\" target=\"_blank\">第6-9節 Ｓ603</a>
    # => [{"date": "20250623(一)", "time_location": "第6-9節 Ｓ603"}]
    dense_info = []
    for line in msg.split("\n"):
        if "<a href=" in line:
            date, time_location = line.split("<a href=")[0].strip(), line.split(">")[
                1].split("<")[0].strip()
            dense_info.append({"date": date, "time_location": time_location})
    return dense_info


def fetch_courses(year: int, term: int, depts: list[str] | None = None) -> tuple[list[dict], dict[str, list[dict]]]:
    all_courses: list[dict] = []
    dense_courses_map: dict[str, list[dict]] = {}

    with requests.Session() as s:
        # 1. 造訪 index.jsp 取得 JSESSIONID
        s.get(INDEX_URL, timeout=10)

        headers = {
            "Referer": INDEX_URL,
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/137.0.0.0 Safari/537.36"
            ),
            "Accept": "*/*",
            "Accept-Language": "zh-TW,zh;q=0.9",
        }

        # 2. 取得科系列表
        depts_original = []
        if depts is None:
            resp = s.get(DEPT_API_URL,
                         headers=headers,
                         params=build_dept_params(year, term))
            resp.raise_for_status()
            depts_original = json.loads(resp.text.replace("'", '"'))
            depts = [item[0] for item in depts_original]
            print(f"共取得 {len(depts)} 個科系代碼", flush=True)

        for i, dept in enumerate(depts):
            try:
                print(f"正在抓取 {depts_original[i][1]} 的課程資料...", flush=True)
            except IndexError:
                print(f"正在抓取 {dept} 的課程資料...", flush=True)

            if dept == "GU":
                for core in GU_CORE:
                    print(f"正在抓取 {core} 核心通識課程...", flush=True)
                    time.sleep(0.5)
                    resp = s.get(API_URL,
                                 headers=headers,
                                 params=build_params(year, term, "GU") |
                                 {"kind": 3, "generalCore": core})
                    resp.raise_for_status()
                    data: list[dict] = resp.json().get("List", [])
                    # 對所有 data 內容:
                    # 尋找 all_courses 中是否已存在相同 serial_no 的課程
                    # 有 -> 對其 generalCore 欄位修改加 "/core"，若原本為空則 改為 core
                    # 沒有 -> 直接加入 all_courses，並將 generalCore 設為 core
                    # 沒有 serial_no: 改用 (courseCode, courseGroup) 作為唯一識別
                    for course in data:
                        serial_no = course.get("serial_no")
                        if serial_no:
                            existing = next(
                                (c for c in all_courses
                                 if c["serial_no"] == serial_no), None)
                            if existing:
                                if core not in existing["generalCore"]:
                                    existing["generalCore"] += f"/{core}"
                            else:
                                course["generalCore"] = core
                                all_courses.append(course)
                        else:
                            # 處理沒有 serial_no 的情況
                            existing = next(
                                (c for c in all_courses
                                 if (c["course_code"] == course["course_code"] and
                                     c["course_group"] == course["course_group"])), None)
                            if existing:
                                if core not in existing["generalCore"]:
                                    existing["generalCore"] += f"/{core}"
                            else:
                                course["generalCore"] = core
                                all_courses.append(course)
                continue
            time.sleep(0.5)
            resp = s.get(API_URL,
                         headers=headers,
                         params=build_params(year, term, dept))
            resp.raise_for_status()
            data = resp.json().get("List", [])
            all_courses.extend(data)

        # 移除重複課程（serial_no 相同，沒有 serial_no: 改用 (courseCode, courseGroup) 作為唯一識別）
        seen_serials = set()

        def seen_serials_add(course: dict) -> bool:
            serial_no = course.get("serial_no")
            if serial_no:
                return serial_no not in seen_serials and not seen_serials.add(serial_no)
            else:
                unique_key = (course["course_code"], course["course_group"])
                return unique_key not in seen_serials and not seen_serials.add(unique_key)

        all_courses = [course for course in all_courses
                       if seen_serials_add(course)]

        for course in all_courses:
            # 篩選 option_code 為 通 且 generalCore 為空，各別處理 generalCore
            try:
                if course.get("option_code") == "通" and not course.get("generalCore"):
                    course["generalCore"] = getGUCore(course, s)
                    time.sleep(0.05)
            except Exception as e:
                print(f"處理校際通識核心課程時發生錯誤: {e}", flush=True)

            # 處理密集課程資訊
            try:
                if "密集課程" in course.get("time_inf", ""):
                    dense_courses_map[
                        f"{course['course_code']}-{course['course_group']}"
                    ] = getDenseCourseInfo(course, s)
                    time.sleep(0.05)
            except Exception as e:
                print(f"處理密集課程資訊時發生錯誤: {e}", flush=True)

    return all_courses, dense_courses_map


def fetch_course(year: int, term: int, dept: str):
    with requests.Session() as s:
        # 1. 造訪 index.jsp 取得 JSESSIONID
        s.get(INDEX_URL, timeout=10)

        # 2. API 呼叫
        headers = {
            "Referer": INDEX_URL,
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/137.0.0.0 Safari/537.36"
            ),
            "Accept": "*/*",
            "Accept-Language": "zh-TW,zh;q=0.9",
        }
        resp = s.get(API_URL,
                     headers=headers,
                     params=build_params(year, term, dept))
        resp.raise_for_status()
        data = resp.json().get("List", [])
        return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-y", "--year", type=int,
                        required=True, help="民國學年度，如 113")
    parser.add_argument("-t", "--term", type=int,
                        required=True, help="學期：1 、 2 或 3")
    parser.add_argument("-d", "--dept", type=str, help="科系代碼，如 AIA")
    parser.add_argument("-o", "--out", type=str, default=None,
                        help="TSV 輸出檔名，可省略")
    args = parser.parse_args()

    if args.dept:
        data = fetch_course(args.year, args.term, args.dept)
    else:
        # data = fetch_courses(args.year, args.term)
        data = fetch_courses(args.year, args.term, ["GU"])
        args.out = f"{args.year}-{args.term}.tsv"
    import pandas as pd
    df = pd.DataFrame(data)
    print(f"抓到 {len(df)} 筆課程資料")
    print(df.head(10))  # 顯示前 10 筆資料
    if args.out:
        df.to_csv(args.out, index=False, sep="\t", encoding="utf-8-sig")
        print(f"已輸出 {args.out}")


if __name__ == "__main__":
    main()
