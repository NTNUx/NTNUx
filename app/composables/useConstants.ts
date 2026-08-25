export const modeList: string[] = [
  // default
  "quick",
  // with dropdown filters
  "dept",
  "general",
  "program",
  // only advanced filters
  "pe",
  "nd",
  "interschool",
  "english3",
  "emi",
] as const;

export const modeMap: Record<string, string> = {
  quick: "快速搜尋",
  dept: "系所課程",
  general: "通識課程",
  program: "學程課程",
  pe: "普通體育",
  nd: "全民國防",
  interschool: "校際選課",
  english3: "英文三",
  emi: "EMI課程",
} as const;

export const classKindMap: Record<string, string> = {
  1: "甲班",
  2: "乙班",
  3: "丙班",
  4: "丁班",
  7: "大碩博合開",
  8: "大碩合開",
  9: "碩博合開",
} as const;

export const optionMap: Record<string, string> = {
  必: "必修",
  選: "選修",
  通: "通識",
} as const;

export const genderRestrictionMap: Record<string, string> = {
  M: "限男生修",
  F: "限女生修",
} as const;

export const generalCoreMap: Record<string, string> = {
  A1: "人文藝術",
  A2: "社會科學",
  A3: "自然科學",
  A4: "邏輯運算",
  B1: "學院共同課程",
  B2: "跨域專業探索課程",
  B3: "大學入門",
  C1: "專題探究",
  C2: "MOOCs",
} as const;

export const days: string[] = ["一", "二", "三", "四", "五", "六"] as const;

export const periods: string[] = [
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
] as const;

export const periodMap: Record<string, string> = {
  "0": "07:10-08:00",
  "1": "08:10-09:00",
  "2": "09:10-10:00",
  "3": "10:10-11:00",
  "4": "11:10-12:00",
  "5": "13:30-14:20",
  "6": "14:30-15:20",
  "7": "15:30-16:20",
  "8": "16:30-17:20",
  "9": "17:30-18:20",
  "10": "18:30-19:20",
  A: "19:30-20:20",
  B: "20:30-21:20",
  C: "21:30-22:20",
  D: "22:30-23:20",
} as const;

// https://developers.google.com/maps/documentation/places/web-service/place-id?hl=zh-tw#find-id
export const locationMap: Record<string, string> = {
  "和平 體": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 大韻律教室": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 小韻律教室": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 金牌講堂": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 武術": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 重量訓練": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 桌球": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 體操": `query=${encodeURIComponent("臺灣師大體育館")}&query_place_id=ChIJYb4lRIWpQjQRL0xeKf3wU5s`,
  "和平 游泳": `query=${encodeURIComponent("師大校本部游泳池")}&query_place_id=ChIJ_RYYFoWpQjQRYXjFRZMdT74`,
  "和平 網球": `query=${encodeURIComponent("25°01'31.4\"N 121°31'29.8\"E")}`,
  "和平 操場": `query=${encodeURIComponent("師大田徑場")}&query_place_id=ChIJk-11piipQjQRIk2J3lFVzL0`,
  "和平 室外籃球": `query=${encodeURIComponent("師大室外籃球場")}&query_place_id=ChIJEU5FKwCpQjQRIGh7s2sNaD8`,

  "和平 教": `query=${encodeURIComponent("國立臺灣師範大學教育學院")}&query_place_id=ChIJOzXfQ4SpQjQRey1cq9keiHg`,
  "和平 綜": `query=${encodeURIComponent("師大綜合大樓")}&query_place_id=ChIJT7-wTYSpQjQR83hmnG7I66M`,
  "和平 美術": `query=${encodeURIComponent("師大美術館")}&query_place_id=ChIJ-242PoSpQjQRr1522e9jGkw`,
  "和平 美": `query=${encodeURIComponent("師大美術系館")}&query_place_id=ChIJU6HXsYWpQjQRsdxZ5f-XHos`,
  "和平 音": `query=${encodeURIComponent("師大音樂系館")}&query_place_id=ChIJpcsjPIWpQjQRP1yFgneOusQ`,
  "和平 特": `query=${encodeURIComponent("25°01'38.7\"N 121°31'43.4\"E")}&query_place_id=ChIJW6a6NYSpQjQRGOjP7FbQEdM`,
  "和平 誠": `query=${encodeURIComponent("25°01'29.7\"N 121°31'40.6\"E")}`,
  "和平 正": `query=${encodeURIComponent("25°01'30.4\"N 121°31'40.4\"E")}`,
  "和平 勤": `query=${encodeURIComponent("25°01'30.1\"N 121°31'36.5\"E")}`,
  "和平 樸": `query=${encodeURIComponent("25°01'30.8\"N 121°31'36.7\"E")}`,
  "和平 視聽教室": `query=${encodeURIComponent("25°01'38.7\"N 121°31'47.5\"E")}&query_place_id=ChIJXQ7ZBwCpQjQR4Y0WNA2RBiw`,

  "公館 中正": `query=${encodeURIComponent("國立臺灣師範大學中正堂")}&query_place_id=ChIJVVUVkfWpQjQR_9XOzks2Va0`,
  "公館 室外籃球": `query=${encodeURIComponent("師大公館籃球場")}&query_place_id=ChIJTTdD0tmpQjQR2SD1EZb2UBQ`,
  "公館 網球": `query=${encodeURIComponent("25°00'32.1\"N 121°32'12.6\"E")}`,
  "公館 Ｓ": `query=${encodeURIComponent("臺灣師範大學公館校區 研究大樓")}&query_place_id=ChIJ0_ApyvWpQjQRb80NTJPyiPY`,
  "公館 Ａ": `query=${encodeURIComponent("25°00'25.9\"N 121°32'04.3\"E")}`,
  "公館 Ｂ": `query=${encodeURIComponent("25°00'25.9\"N 121°32'08.3\"E")}`,
  "公館 Ｃ": `query=${encodeURIComponent("國立臺灣師範大學 理學院-C棟")}&query_place_id=ChIJ2df3ulmpQjQRcCbH2Sj1Yw8`,
  "公館 Ｄ": `query=${encodeURIComponent("國立臺灣師範大學 理學院-D棟")}&query_place_id=ChIJVY7c4PWpQjQR221R0RHEEFI`,
  "公館 Ｅ": `query=${encodeURIComponent("25°00'25.9\"N 121°32'04.3\"E")}`,
  "公館 Ｆ": `query=${encodeURIComponent("25°00'27.0\"N 121°32'04.5\"E")}`,
  "公館 理圖": `query=${encodeURIComponent("臺灣師範大學圖書館-公館分館")}&query_place_id=ChIJi3OrJx6qQjQRoKJGHofymIo`,
  "公館 數學": `query=${encodeURIComponent("25°00'26.9\"N 121°32'10.0\"E")}&query_place_id=ChIJ2cUs7PWpQjQRPDed3BxV8dM`,
  "公館 體育館": `query=${encodeURIComponent("25°00'31.3\"N 121°32'06.8\"E")}`,
  "公館 研": `query=${encodeURIComponent("25°00'31.3\"N 121°32'06.8\"E")}`,
} as const;

export const colorList: string[] = [
  // "#64748b33", // slate
  // "#6b728033", // gray
  // "#71717a33", // zinc
  // "#73737333", // neutral
  // "#78716c33", // stone
  // "#7c6d6733", // taupe
  // "#79697b33", // mauve
  // "#67787c33", // mist
  // "#7c7c6733", // olive

  // "#FFFFFF80", // White
  // "#FFFAFA80", // Snow
  // "#F0FFF080", // HoneyDew
  // "#F5FFFA80", // MintCream
  // "#F0FFFF80", // Azure
  // "#F0F8FF80", // AliceBlue
  // "#F8F8FF80", // GhostWhite
  // "#F5F5F580", // WhiteSmoke
  // "#FFF5EE80", // SeaShell
  // "#F5F5DC80", // Beige
  // "#FDF5E680", // OldLace
  // "#FFFAF080", // FloralWhite
  // "#FFFFF080", // Ivory
  // "#FAEBD780", // AntiqueWhite
  // "#FAF0E680", // Linen
  // "#FFF0F580", // LavenderBlush
  // "#FFE4E180", // MistyRose

  "#FF999950",
  "#FFCC9950",
  "#FFFF9950",
  "#FFFFCC50",
  "#CCFF9950",
  "#99FF9950",
  "#CCFFCC50",
  "#99CC9950",
  "#99FFCC50",
  "#99FFFF50",
  "#CCFFFF50",
  "#99CCCC50",
  "#99CCFF50",
  "#9999FF50",
  "#9999CC50",
  "#CCCCFF50",
  "#CC99FF50",
  "#CC99CC50",
  "#FF99FF50",
  "#FFCCFF50",
  "#FF99CC50",
  "#FFCCCC50",
  "#CC999950",
  "#CCCC9950",
  "#CCCCCC50",
] as const;

// #FFCCCC #FFC0C0 #FF9999 #FF8080 #FF6666 #FF4040 #FF3333 #FF0000
// #FFE5CC #FFE0C0 #FFCC99 #FFC080 #FFB266 #FFA040 #FF9933 #FF8000
// #FFFFCC #FFFFC0 #FFFF99 #FFFF80 #FFFF66 #FFFF40 #FFFF33 #FFFF00
// #FFFFE5 #FFFFE0 #FFFFCC #FFFFC0 #FFFFB2 #FFFFA0 #FFFF99 #FFFF80
// #E5FFCC #E0FFC0 #CCFF99 #C0FFA0 #B2FF66 #A0FF40 #99FF33 #80FF00
// #CCFFCC #C0FFC0 #99FF99 #80FF80 #66FF66 #40FF40 #33FF33 #00FF00
// #E5FFE5 #E0FFE0 #CCFFCC #C0FFC0 #B2FFB2 #A0FFA0 #99FF99 #80FF80
// #CCE5CC #C0E0C0 #99CC99 #80C080 #66B266 #40A040 #339933 #008000
// #CCFFE5 #C0FFE0 #99FFCC #80FFC0 #66FFB2 #40FFA0 #33FF99 #00FF80
// #CCFFFF #C0FFFF #99FFFF #80FFFF #66FFFF #40FFFF #33FFFF #00FFFF
// #E5FFFF #E0FFFF #CCFFFF #C0FFFF #B2FFFF #A0FFFF #99FFFF #80FFFF
// #CCE5E5 #C0E0E0 #99CCCC #80C0C0 #66B2B2 #40A0A0 #339999 #008080
// #CCE5FF #C0E0FF #99CCFF #80C0FF #66B2FF #40A0FF #3399FF #0080FF
// #CCCCFF #C0C0FF #9999FF #8080FF #6666FF #4040FF #3333FF #0000FF
// #CCCCE5 #C0C0E0 #9999CC #8080C0 #6666B2 #4040A0 #333399 #000080
// #E5E5FF #E0E0FF #CCCCFF #C0C0FF #B2B2FF #A0A0FF #9999FF #8080FF
// #E5CCFF #E0C0FF #CC99FF #C080FF #B266FF #A040FF #9933FF #8000FF
// #E5CCE5 #E0C0E0 #CC99CC #C080C0 #B266B2 #A040A0 #993399 #800080
// #FFCCFF #FFC0FF #FF99FF #FF80FF #FF66FF #FF40FF #FF33FF #FF00FF
// #FFE5FF #FFE0FF #FFCCFF #FFC0FF #FFB2FF #FFA0FF #FF99FF #FF80FF
// #FFCCE5 #FFC0E0 #FF99CC #FF80C0 #FF66B2 #FF40A0 #FF3399 #FF0080
// #FFE5E5 #FFE0E0 #FFCCCC #FFC0C0 #FFB2B2 #FFA0A0 #FF9999 #FF8080
// #E5CCCC #E0C0C0 #CC9999 #C08080 #B26666 #A04040 #993333 #800000
// #E5E5CC #E0E0C0 #CCCC99 #C0C080 #B2B266 #A0A040 #999933 #808000
// #E5E5E5 #E0E0E0 #CCCCCC #C0C0C0 #B2B2B2 #A0A0A0 #999999 #808080
