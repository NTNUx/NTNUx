import json
import os
import pandas as pd
import argparse

from tool.analysis import raws_to_json

def tsv_to_json(tsv_file: str, json_file: str):
    """將 TSV 檔案轉換為 JSON 檔案（minified）

    Args:
        tsv_file (str): TSV 檔案路徑
        json_file (str): 輸出 JSON 檔案路徑
    """
    if not os.path.exists(tsv_file):
        print(f"找不到 TSV 檔案: {tsv_file}")
        return

    # 讀取 TSV 檔案
    df = pd.read_csv(tsv_file, sep="\t", dtype=str)

    # 將 DataFrame 轉換為字典列表
    data = raws_to_json(df)

    # 儲存為 minified JSON
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"已成功將 {tsv_file} 轉換為 {json_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="將 TSV 檔案轉換為 JSON 檔案")
    parser.add_argument("tsv_file", type=str, help="輸入的 TSV 檔案路徑")
    parser.add_argument("json_file", type=str, help="輸出的 JSON 檔案路徑")
    args = parser.parse_args()

    tsv_to_json(args.tsv_file, args.json_file)