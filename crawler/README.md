# NTNUx Crawler

本資料夾負責爬取 NTNU 課程網資料，並將其儲存為 tsv 檔案。

## 🚀 使用方式

```bash
# python main.py -y {year} -t {term} [-o {output_file_dir}]
uv run main.py -y {year} -t {term} [-o {output_file_dir}]
```

- `year`: 民國學年，例如 114
- `term`: 學期，1 為上學期、2 為下學期、3 為暑期
- `output_file_dir`: 輸出檔案的目錄，預設為 `../public/data/{year}-{term}`，如果不存在則會自動建立。

## 📦 套件安裝

```bash
# pip install -e .
uv sync
```
