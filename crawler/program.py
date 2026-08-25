from tool.analysis import get_program_dir
from tool.conversion_program import get_program_conversion
import argparse
import json
import os


def main(yt: str):
    config_path = os.path.join(os.path.dirname(
        __file__), "..", "wrangler.toml")
    program_dir = get_program_dir(config_path)

    # check if yt is exist in original_data directory
    data_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "original_data", yt))
    if not os.path.exists(data_path):
        print(f"找不到資料目錄: {data_path}")
        return
    # read data.json
    with open(os.path.join(data_path, "data.json"), "r", encoding="utf-8") as f:
        course_json = json.load(f)
    print(f"已讀取 {len(course_json)} 筆課程資料")
    # update program field
    for course in course_json:
        program_codes = course.get("p")
        try:
            program_name = get_program_conversion(program_codes, program_dir)
            course["p"] = program_name
        except ValueError as e:
            print(e)
            course["p"] = program_codes

    # write back to data.json (minified)
    with open(os.path.join(data_path, "data.json"), "w", encoding="utf-8") as f:
        json.dump(course_json, f, ensure_ascii=False, separators=(',', ':'))
    print(f"已更新課程資料中的學程名稱，並儲存至 {data_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="轉換程式資料")
    parser.add_argument("yt", type=str, help="學年度-學期，如 113-2",
                        nargs="+", default=None)
    args = parser.parse_args()

    yt = args.yt
    if args.yt is None:
        print("請提供學年度-學期，使用 -yt 或 --yt")
    else:
        yt = "-".join(args.yt)

    main(yt)
