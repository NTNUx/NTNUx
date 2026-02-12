import pandas as pd
import re


def time_location_format(time_inf: str) -> dict[str, str] | str:
    """
    將時間地點資訊格式化為指定的格式
    :param time_inf: 原始時間資訊
    :return: 格式化後的時間、地點資訊
    """
    if not time_inf or time_inf.startswith('◎'):
        return time_inf

    time_loc_parts = time_inf.split(",")
    formatted_times = {}
    for part in time_loc_parts:
        # 提取星期和時間
        part = part.strip().split(" ")
        day_time = part[0:2]
        location = part[2:]
        if len(day_time) == 2:
            formatted_times[" ".join(day_time)] = " ".join(location)
    # 返回格式化後的時間資訊
    return formatted_times


def time_location_to_array(time_inf: dict[str, str]) -> list[dict[str, str]]:
    """
    將格式化後的時間地點資訊轉換為陣列格式
    :param time_inf: 格式化後的時間、地點資訊
    :return: 時間、地點資訊陣列
    """
    if not isinstance(time_inf, dict):
        return []
    result = []
    for seg, loc in time_inf.items():
        match = re.match(r"([一二三四五六])\s*(\d+|A|B|C|D)(?:-(\d+|A|B|C|D))?", seg)
        if match:
            day, start, end = match.groups()
            end = end or start
            range_periods = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "A", "B", "C", "D",
                             ]
            start_index = range_periods.index(start)
            end_index = range_periods.index(end)
            range_periods = range_periods[start_index:end_index + 1]
            for period in range_periods:
                result.append({"d": day, "p": period, "l": loc})
    return result


def teacher_format(teacher: str) -> str:
    return teacher.replace("", "温")


def course_format(courses: pd.DataFrame) -> pd.DataFrame:
    """
    將課程資訊 DataFrame 格式化為指定的格式
    :param courses: 課程資訊 DataFrame
    :return: 格式化後的課程資訊 DataFrame
    """
    courses["generalCore"] = courses["generalCore"].fillna("")
    return courses[[
        "acadm_year", "acadm_term", "authorize_p", "authorize_using",
        "chn_name", "classes", "comment", "counter", "counter_exceptAuth",
        "course_avg", "course_code", "course_group", "course_kind", "credit",
        "dept_chiabbr", "dept_code", "dept_group_name", "eng_name",
        "eng_teach", "form_s", "limit", "limit_count_h", "option_code",
        "restrict", "rt", "serial_no", "teacher", "time_inf",
        "generalCore"
    ]]


def raws_to_json(courses: pd.DataFrame) -> dict[str, dict[str, str | int | float]]:
    """
    將原始課程資訊轉換為 JSON 格式
    :param courses: 課程資訊 DataFrame
    :return: 格式化後的課程資訊 JSON

    key_mapping：
    | 原始欄位名稱 | 縮寫欄位名稱 | 前端預設值 | 說明 |
    | ------------------- | --- | --- | ------------------------ |
    | acadm_year          | y   |     | 學年                      |
    | acadm_term          | t   |     | 學期                      |
    | authorize_p         | a   |     | 授權碼數量                |
    | authorize_using     | au  |     | 已使用授權碼數量          |
    | chn_name            | cn  |     | 原始中文名稱              |
    | classes             | cl  |     | 開課種類（8：大碩         |
    | comment             | c   |     | 說明                      |
    | counter             | co  |     | 選課人數                  |
    | counter_exceptAuth  | ce  |     | 非授權碼選課人數          |
    | course_avg          | ca  |     |                           |
    | course_code         | cc  |     | 課程代碼                  |
    | course_group        | cg  |     | 課程組別                  |
    | course_kind         | ck  |     | 半/全 學年                |
    | credit              | cr  |     | 學分                      |
    | dept_chiabbr        | d   |     | 開課單位                  |
    | dept_code           | dc  |     | 開課單位代號              |
    | dept_group_name     | dgn |     | 開課單位組別              |
    | eng_name            | en  |     | 英文課程名稱              |
    | eng_teach           | et  |     | 英文授課（是/None）       |
    | form_s              | fs  |     |                           |
    | limit               | l   |     | 系統各校開放名額          |
    | limit_count_h       | lh  |     | 選課人數上限              |
    | option_code         | oc  |     | 課程類別（通、選、必）    |
    | restrict            | r   |     | 限修說明                  |
    | rt                  | rt  |     | 數位課程（N/1）           |
    | serial_no           | s   |     | 開課序號                  |
    | teacher             | te  |     | 授課教師                  |
    | time_inf            | ti  |     | 時間地點資訊（列表）       |
    | generalCore         | gc  |     | 通識領域（"/" 分隔         |
    |                     | n   |     | 課程名稱                  |
    |                     | p   |     | 學分學程（"/" 分隔）       |
    |                     | t   |     | 時間（列表）               |
    |                     | lc  |     | 地點（"/" 分隔）           |
    |                     | tll |     | 時間地點（列表）           |
    |                     | tl  |     | 時間地點（"/" 分隔）       |
    """
    key_mapping = {
        "acadm_year": "y",
        "acadm_term": "t",
        "authorize_p": "a",
        "authorize_using": "au",
        "chn_name": "cn",
        "classes": "cl",
        "comment": "c",
        "counter": "co",
        "counter_exceptAuth": "ce",
        "course_avg": "ca",
        "course_code": "cc",
        "course_group": "cg",
        "course_kind": "ck",
        "credit": "cr",
        "dept_chiabbr": "d",
        "dept_code": "dc",
        "dept_group_name": "dgn",
        "eng_name": "en",
        "eng_teach": "et",
        "form_s": "fs",
        "limit": "l",
        "limit_count_h": "lh",
        "option_code": "oc",
        "restrict": "r",
        "rt": "rt",
        "serial_no": "s",
        "teacher": "te",
        "time_inf": "ti",
        "generalCore": "gc",
    }

    output = {}
    for _, row in courses.fillna("").iterrows():
        course_id = row["serial_no"]
        if pd.isna(course_id):
            course_id = f"{row['course_code']}_{row['course_group']}"
        course_value = {
            key_mapping[str(k)]: v for k, v in row.items() if str(k) in key_mapping
        }
        course_value["cr"] = int(float(course_value["cr"])) if pd.notna(
            course_value["cr"]) else 0
        course_value["n"] = re.sub(r"<\/br>.*", "", course_value["cn"])
        course_value["p"] = "/".join(re.sub(r".*\[ 學分學程：(.+?) \].*", r"\1",
                                     course_value["cn"]).split(" ")) if "學分學程" in course_value["cn"] else []
        course_value["ti"] = time_location_format(course_value["ti"])
        if isinstance(course_value["ti"], dict):
            course_value["t"] = list(course_value["ti"].keys())
            course_value["lc"] = "/".join(set(course_value["ti"].values()))
            course_value["tll"] = time_location_to_array(course_value["ti"])
            course_value["tl"] = "/".join([f"{t} {l}" for t,
                                          l in course_value["ti"].items()])
        else:
            course_value["t"] = course_value["ti"]
        course_value["te"] = teacher_format(course_value["te"])

        output[course_id] = {
            k: v for k, v in course_value.items() if v
        }
    return output
