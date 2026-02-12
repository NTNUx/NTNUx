import os
import pandas as pd


def strip_course(courses_df: pd.DataFrame, output_dir: str):
    # === 輸出分段檔案 ===
    os.makedirs(output_dir, exist_ok=True)

    files = {f"{i}.tsv": pd.DataFrame() for i in range(0, 11)}
    for _, course in courses_df.iterrows():
        serial_no: str = course.get("serial_no")
        # e.g., '1234' -> '1.tsv', '8000' -> '8.tsv'
        if serial_no is not None and len(serial_no) == 4:
            try:
                file_key = f"{int(serial_no[0]) % 10}.tsv"
            except ValueError:
                file_key = "10.tsv"
        else:
            file_key = "10.tsv"

        if file_key not in files:
            files[file_key] = pd.DataFrame()

        files[file_key] = pd.concat(
            [files[file_key], course.to_frame().T], ignore_index=True)

    for file_key, data in files.items():
        path = os.path.join(output_dir, file_key)
        # 確保必要欄位存在
        for col in ["serial_no", "course_code", "course_group"]:
            if col not in data.columns:
                data[col] = pd.NA
        # 排序並輸出 TSV
        data = data.sort_values(
            by=["serial_no", "course_code", "course_group"],
            ascending=True,
            na_position="last"
        )
        data.to_csv(
            path, sep="\t", index=False, encoding="utf-8-sig"
        )
        print(f"✅ 完成輸出：{file_key} → {path}", flush=True)
