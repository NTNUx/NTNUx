import os
import argparse
import pandas as pd
import json

from core.cofopdl import fetch_courses
from tool.analysis import course_format
from tool.analysis import raws_to_json
from tool.strip import strip_course


def save_courses(year: int, term: int, output_dir: str, original_data_output: str, resave: bool) -> None:
    """
    抓取課程資料並儲存為 TSV 檔案、預處理後的 JSON 檔案。

    :param year: 民國學年度，如 113
    :param term: 學期：1 、 2 或 3
    :param output_dir: 儲存格式化後課程資料的目錄
    :param original_data_output: 儲存原始課程資料的目錄
    :param resave: 是否跳過爬蟲直接讀取 tsv 並重新儲存
    """
    if not resave:
        courses, dense_courses_map = fetch_courses(year, term)
        courses_df = course_format(pd.DataFrame(courses))
    else:
        # read from original_data_output
        courses_df = pd.read_csv(
            os.path.join(original_data_output, "data.tsv"),
            sep="\t", encoding="utf-8-sig", dtype=str)
        dense_courses_map = {}
        with open(os.path.join(original_data_output, "dense.json"), "r", encoding="utf-8") as f:
            dense_courses_map = json.load(f)
    if courses_df.empty:
        print("沒有抓到任何課程資料")
        return

    # 格式化課程資料
    courses_df = courses_df.map(
        lambda x: x.replace("\t", "") if isinstance(x, str) else x)
    for col in ["serial_no", "course_code", "course_group"]:
        if col not in courses_df.columns:
            courses_df[col] = pd.NA
    courses_df = courses_df.sort_values(
        by=["serial_no", "course_code", "course_group"],
        ascending=True,
        na_position="last"
    )
    course_json = raws_to_json(courses_df)
    yt = f"{year}-{term}"

    # 儲存原始課程資料
    # check if original_data_output exists, if not create it
    if not os.path.exists(original_data_output):
        os.makedirs(original_data_output)
    courses_df.to_csv(
        os.path.join(original_data_output, "data.tsv"),
        sep="\t", index=False, encoding="utf-8-sig")
    with open(os.path.join(original_data_output, "dense.json"), "w", encoding="utf-8") as f:
        json.dump(dense_courses_map, f, ensure_ascii=False, indent=None)
    with open(os.path.join(original_data_output, "data.json"), "w", encoding="utf-8") as f:
        json.dump(course_json, f, ensure_ascii=False, indent=None)

    # 儲存為 JSON 檔案
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(os.path.join(output_dir, "dense.json"), "w", encoding="utf-8") as f:
        json.dump(dense_courses_map, f, ensure_ascii=False, indent=None)
    with open(os.path.join(output_dir, "data.json"), "w", encoding="utf-8") as f:
        json.dump(course_json, f, ensure_ascii=False, indent=None)
    # 更新 日期 json 檔案
    with open(os.path.join(output_dir, "last_update.json"), "w", encoding="utf-8") as f:
        json.dump({
            "last_update": pd.Timestamp.now().strftime("%Y-%m-%d")
        }, f, ensure_ascii=False)

    print(f"課程資料已儲存至 {output_dir}，"
          f"共 {len(courses_df)} 筆課程資料")


def main():
    parser = argparse.ArgumentParser(description="抓取並儲存課程資料")
    parser.add_argument("_y", type=int, help="民國學年度，如 113",
                        nargs="?", default=None)
    parser.add_argument(
        "_t", type=int, help="學期：1 、 2 或 3 (暑期)", nargs="?", default=None)
    parser.add_argument("-y", "--year", type=int, required=False,
                        help="民國學年度，如 113")
    parser.add_argument("-t", "--term", type=int, required=False,
                        help="學期：1 、 2 或 3 (暑期)")
    parser.add_argument("-r", "--resave", required=False, default=False, action="store_true",
                        help="是否跳過爬蟲直接讀取 tsv 並重新儲存，預設為 False")
    parser.add_argument("-o", "--out", type=str,
                        help="輸出目錄，預設為 ../public/data/{year}-{term}")
    parser.add_argument("-d", "--data", type=str,
                        help="原始課程資料儲存目錄，預設為 original_data/")
    args = parser.parse_args()

    year = args.year or args._y or None
    term = args.term or args._t or None
    if year is None:
        print("請提供學年度，使用 -y 或 --year")
        return
    if term is None:
        print("請提供學期，使用 -t 或 --term")
        return

    if not args.out:
        args.out = os.path.abspath(os.path.join(
            os.path.dirname(__file__),
            "..", "public", "data",
            f"{year}-{term}"))
    if not args.data:
        args.data = os.path.abspath(os.path.join(
            os.path.dirname(__file__),
            "original_data", f"{year}-{term}"))

    save_courses(year, term, args.out, args.data, args.resave)


if __name__ == "__main__":
    main()
