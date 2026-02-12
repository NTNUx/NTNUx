import os
import argparse
import pandas as pd
import json

from core.cofopdl import fetch_courses
from tool.analysis import course_format
from tool.strip import strip_course


def save_courses(year: int, term: int, output_dir: str, original_data_output: str) -> None:
    """
    抓取課程資料並儲存為 TSV 檔案、預處理後的 JSON 檔案。

    :param year: 民國學年度，如 113
    :param term: 學期：1 、 2 或 3
    :param output_dir: 儲存格式化後課程資料的目錄
    :param original_data_output: 儲存原始課程資料的目錄
    """
    courses, dense_courses_map = fetch_courses(year, term)
    if not courses:
        print("沒有抓到任何課程資料")
        return

    # 格式化課程資料
    courses_df = course_format(pd.DataFrame(courses))

    # 移除所有 \t
    courses_df = courses_df.map(
        lambda x: x.replace("\t", "") if isinstance(x, str) else x)

    # 儲存原始課程資料
    for col in ["serial_no", "course_code", "course_group"]:
        if col not in courses_df.columns:
            courses_df[col] = pd.NA
    courses_df = courses_df.sort_values(
        by=["serial_no", "course_code", "course_group"],
        ascending=True,
        na_position="last"
    )
    courses_df.to_csv(
        os.path.join(original_data_output, f"{year}-{term}.tsv"),
        sep="\t", index=False, encoding="utf-8-sig")
    with open(os.path.join(original_data_output, f"{year}-{term}-dense.json"), "w", encoding="utf-8") as f:
        json.dump(dense_courses_map, f, ensure_ascii=False, indent=None)

    # 儲存為 TSV 檔案
    strip_course(courses_df, output_dir)
    # 儲存為 JSON 檔案
    with open(os.path.join(output_dir, "dense.json"), "w", encoding="utf-8") as f:
        json.dump(dense_courses_map, f, ensure_ascii=False, indent=None)
    # 更新 日期 json 檔案
    with open(os.path.join(output_dir, "last_update.json"), "w", encoding="utf-8") as f:
        json.dump({
            "last_update": pd.Timestamp.now().strftime("%Y-%m-%d")
        }, f, ensure_ascii=False)

    print(f"課程資料已儲存至 {output_dir}，"
          f"共 {len(courses_df)} 筆課程資料")


def main():
    parser = argparse.ArgumentParser(description="抓取並儲存課程資料")
    parser.add_argument("-y", "--year", type=int, required=True,
                        help="民國學年度，如 113")
    parser.add_argument("-t", "--term", type=int, required=True,
                        help="學期：1 、 2 或 3")
    parser.add_argument("-o", "--out", type=str,
                        help="輸出目錄，預設為 ../public/data/{year}-{term}")
    parser.add_argument("-d", "--data", type=str,
                        help="原始課程資料儲存目錄，預設為 original_data/")
    args = parser.parse_args()

    if not args.out:
        args.out = os.path.abspath(os.path.join(
            os.path.dirname(__file__),
            "..", "public", "data",
            f"{args.year}-{args.term}"))
    if not args.data:
        args.data = os.path.abspath(os.path.join(
            os.path.dirname(__file__),
            "original_data"))

    save_courses(args.year, args.term, args.out, args.data)


if __name__ == "__main__":
    main()
