import os
import pandas as pd
from datetime import datetime
import argparse
import urllib.parse
import html

# 網站設定
BASE_URL = "https://ntnux.org"
# 資料來源目錄 (相對於 crawler 目錄)
DATA_DIR = "./original_data"
# 輸出位置 (放在 public 以便部署後能被訪問)
OUTPUT_DIR = "../public/sitemap"


def generate_sitemap(year: int, term: int):
    print(f"開始生成 Sitemap...")

    # XML header
    xml_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # read tsv file
    tsv_file = os.path.join(DATA_DIR, f"{year}-{term}", "data.tsv")
    if not os.path.exists(tsv_file):
        print(f"找不到課程資料檔案: {tsv_file}")
        return
    courses_df = pd.read_csv(tsv_file, sep="\t", dtype=str)
    course_count = 0

    for _, row in courses_df.iterrows():
        course_year = row.get('acadm_year')
        course_term = row.get('acadm_term')
        # course_serial = row.get(
        #     'serial_no') or f"{row.get('course_code')}-{row.get('course_group')}"
        if row.get('serial_no') and not pd.isna(row.get('serial_no')):
            course_serial = row.get('serial_no')
        else:
            course_serial = f"{row.get('course_code')}-{row.get('course_group') if not pd.isna(row.get('course_group')) else ''}"
        course_name = urllib.parse.quote(
            str(row.get('chn_name')).split('<')[0].strip(), safe='')

        # Query String: f"{BASE_URL}/year/term/id/course_name"
        url = f"{BASE_URL}/courses/{course_year}/{course_term}/{course_serial}/{course_name}"

        xml_content.append(f"""    <url>
        <loc>{html.escape(url)}</loc>
        <changefreq>weekly</changefreq>
        </url>""")
        course_count += 1

    # XML 結尾
    xml_content.append('</urlset>')

    # 寫入檔案
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(OUTPUT_DIR, f"sitemap-{year}-{term}.xml")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_content))

    print(f"✅ Sitemap 生成完畢！共包含 {course_count} 個課程連結。")
    print(f"📁 檔案位置: {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="抓取並儲存課程資料")
    parser.add_argument("-y", "--year", type=int, required=True,
                        help="民國學年度，如 113")
    parser.add_argument("-t", "--term", type=int, required=True,
                        help="學期：1 、 2 或 3")

    args = parser.parse_args()
    generate_sitemap(args.year, args.term)
