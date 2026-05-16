import { useEffect, useMemo, useState } from "react";

const HOTEL_A = { name: "飯店A｜Stay SAKURA Tokyo 新宿 百蔵", area: "新大久保／新宿北側" };
const HOTEL_B = { name: "飯店B｜Hostel DEN", area: "小傳馬町／日本橋東側" };

const TABS = {
  "0515": "Day1 新宿",
  "0516": "Day2 淺草‧晴空塔‧東京一番街",
  "0517": "Day3 池袋‧澀谷",
  "0518": "Day4 鎌倉‧湘南",
  "0519": "Day5 橫濱",
  "0520": "Day6 迪士尼",
  "0521": "Day7 回台當社畜",
};

const TRIP_YEAR = 2026;
const PHOTO_TARGETS = { "0515": 5, "0516": 30, "0517": 30, "0518": 30, "0519": 30, "0520": 30, "0521": 5 };
const DEFAULT_PHOTO_TARGET = 30;
const ASSET_BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const DEFAULT_COMMON_HEADER_BG = `${ASSET_BASE_URL}/Title.png`;
const PHOTO_ICON_URL = `${ASSET_BASE_URL}/photo.png`;
const OMAMORI_ICON_URL = `${ASSET_BASE_URL}/ess.png`;
const GITHUB_OWNER = "kitehsieh-cloud";
const GITHUB_REPO = "yyd";
const GITHUB_BRANCH = "main";
const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
const ALBUM_MANIFEST_PATH = "photos/index.json";
const UPLOAD_TEST_DELETE_DELAY_MS = 10 * 60 * 1000;
const PUBLIC_ALBUM_MANIFEST_URL = `${import.meta.env.BASE_URL}${ALBUM_MANIFEST_PATH}`;
const STORAGE_KEYS = {
  token: "tokyoTrip.githubToken",
  photosByDay: "tokyoTrip.photosByDay",
  lastSync: "tokyoTrip.lastSync",
};

function partnerImageUrl(dayNo) {
  return `${ASSET_BASE_URL}/g${dayNo}.png`;
}

const HEADER_COMPANION_LAYOUT = {
  0: { left: 50, top: 65, width: 27, label: "古本" },
  1: { left: 80, top: 72, width: 23, label: "小桃" },
  2: { left: 36, top: 82, width: 21, label: "吉依卡哇" },
  3: { left: 17, top: 67, width: 24, label: "大強" },
  4: { left: 50, top: 45, width: 25, label: "兔兔" },
  5: { left: 65, top: 82, width: 22, label: "小八" },
  6: { left: 70, top: 47, width: 20, label: "風獅爺" },
  7: { left: 31, top: 51, width: 20, label: "栗子饅頭" },
};

const HEADER_COMPANION_SCALE = 1.265;
const HEADER_COMPANION_POSITION_ADJUSTMENTS = {
  0: { top: 1 },
  1: { left: 2, top: 2 },
  2: { left: -1, top: 2 },
  3: { left: -2, top: 1 },
  4: { top: -2 },
  5: { left: 1, top: 2 },
  6: { left: 2, top: 1 },
  7: { left: -2 },
};

function adjustedHeaderCompanionPosition(dayNo, pos) {
  const adjust = HEADER_COMPANION_POSITION_ADJUSTMENTS[dayNo] || {};
  return {
    ...pos,
    left: pos.left + (adjust.left || 0),
    top: pos.top + (adjust.top || 0),
  };
}

const DEFAULT_DAY_BG = Object.fromEntries(Object.keys(TABS).map((id, index) => [id, `${ASSET_BASE_URL}/D${index + 1}.png`]));
const DEFAULT_FORTUNE_BG = Object.fromEntries(Object.keys(TABS).map((id) => [id, `${ASSET_BASE_URL}/7BG.png`]));
const DAY_MY_MAPS = {
  "0515": { mid: "1mXllVJOQAF4Zr7_w2EObnPUkJdFN6U8", ll: "35.729263744835286%2C140.04267550000003", z: 11 },
  "0516": { mid: "1ac7xSBnTigxiTyX1CmcTnhykGMZT47k", ll: "35.69673066958187%2C139.73806699999997", z: 13 },
  "0517": { mid: "1FonATPxsIeWv105sdN9yVqb0fwCsnjM", ll: "35.696405248315415%2C139.7091595", z: 13 },
  "0518": { mid: "1pU1QJUtYLlyUzta5DOwP4jWi0ZDUQjk", ll: "35.31110535595066%2C139.51683350000002", z: 14 },
  "0519": { mid: "1lWviPUOT3maXinwyej2l4-dtWmFcThI", ll: "35.45237511410088%2C139.63835600000004", z: 14 },
  "0520": { mid: "1Xc-YWVD-OcBs1oqdNjhVCP5RJgrMew4", ll: "35.6328959842015%2C139.88039399999997", z: 18 },
  "0521": { mid: "1R86HJ-6ArWZ8diQdUkBiAJMX41rQTWw", ll: "35.73290645758658%2C140.04109824999998", z: 11 },
};
const DAY_MAP_POINTS = {
  "0515": [
    { name: "成田國際機場", lat: 35.770178, lng: 140.3843215 },
    { name: "牛炸豬排Motomura", lat: 35.6899806, lng: 139.7038098 },
    { name: "新宿購物", lat: 35.688847, lng: 139.7010294 },
    { name: "唐吉訶德 新宿東南口店", lat: 35.6900987, lng: 139.7019999 },
  ],
  "0516": [
    { name: "淺草車站", lat: 35.7139657, lng: 139.7927248 },
    { name: "淺草寺 雷門", lat: 35.7111163, lng: 139.7963656 },
    { name: "浅草 新仲見世商店街", lat: 35.7121273, lng: 139.7944908 },
    { name: "東京晴空塔", lat: 35.7100627, lng: 139.8107004 },
    { name: "迴轉壽司 根室花丸", lat: 35.6795237, lng: 139.7649491 },
    { name: "東京動漫人物街", lat: 35.6820335, lng: 139.7686549 },
    { name: "萬喜-串燒居酒屋", lat: 35.7086166, lng: 139.6654565 },
    { name: "KTV-Karaoke Big Echo Nakano Dori", lat: 35.7072981, lng: 139.6654339 },
  ],
  "0517": [
    { name: "吉伊卡哇樂園10:30", lat: 35.7298877, lng: 139.7173039 },
    { name: "池袋PARCO 本館", lat: 35.7308568, lng: 139.7123844 },
    { name: "太陽城", lat: 35.7289709, lng: 139.7195415 },
    { name: "Denny's 親子餐廳", lat: 35.6630445, lng: 139.6994924 },
    { name: "澀谷區", lat: 35.6619707, lng: 139.703795 },
    { name: "澀谷PARCO", lat: 35.6620484, lng: 139.6987767 },
    { name: "原宿", lat: 35.671599, lng: 139.7029143 },
    { name: "哈利波特旗艦", lat: 35.6686494, lng: 139.7044101 },
    { name: "THE SLICE 和牛壽喜燒", lat: 35.665288, lng: 139.709951 },
    { name: "JR池袋站", lat: 35.7295028, lng: 139.7109001 },
  ],
  "0518": [
    { name: "JR鐮倉", lat: 35.3190156, lng: 139.5504157 },
    { name: "鎌倉小町通", lat: 35.3230716, lng: 139.553122 },
    { name: "鎌倉大佛殿高德院", lat: 35.3168145, lng: 139.5357442 },
    { name: "長谷寺", lat: 35.3124645, lng: 139.5330634 },
    { name: "七里濱", lat: 35.3043891, lng: 139.513901 },
    { name: "鐮倉高校前", lat: 35.3067242, lng: 139.5005569 },
    { name: "江之島", lat: 35.2991449, lng: 139.4809269 },
    { name: "海鮮 江之島小屋", lat: 35.3076745, lng: 139.4825353 },
    { name: "夏威夷漢堡飯ALOHA TABLE", lat: 35.3082011, lng: 139.482677 },
    { name: "海鮮丼 とびっちょ 本店", lat: 35.3013114, lng: 139.4822319 },
    { name: "章魚仙貝Asahi Honten", lat: 35.3009385, lng: 139.480545 },
    { name: "紀之國屋本店", lat: 35.301499, lng: 139.4806189 },
  ],
  "0519": [
    { name: "JR石川町", lat: 35.4387746, lng: 139.6430494 },
    { name: "港見丘公園", lat: 35.4403169, lng: 139.6546505 },
    { name: "山下公園", lat: 35.4457655, lng: 139.6497793 },
    { name: "橫濱中華街", lat: 35.4430883, lng: 139.6441001 },
    { name: "橫濱 COSMOWORLD", lat: 35.4551474, lng: 139.6369763 },
    { name: "橫濱紅磚倉庫1號館", lat: 35.4521384, lng: 139.6433961 },
    { name: "YOKOHAMA AIR CABIN Unga Park Station", lat: 35.453251, lng: 139.6383187 },
    { name: "JR横滨", lat: 35.4659811, lng: 139.622062 },
    { name: "JR橫濱", lat: 35.4656638, lng: 139.6229037 },
  ],
  "0520": [
    { name: "東京迪士尼樂園", lat: 35.6328964, lng: 139.8803943 },
  ],
  "0521": [
    { name: "牛舌檸檬 新宿", lat: 35.6961364, lng: 139.6978751 },
  ],
};
const AREA_RESTAURANT_RECOMMENDATIONS = [
  {
    match: ["橫濱中華街"],
    items: [
      { name: "萬珍樓 本店", type: "廣東料理／老字號", pick: "燒賣、叉燒、廣東點心", why: "橫濱中華街代表性老店，適合想坐下來吃正式中華餐的人" },
      { name: "重慶飯店 新館", type: "四川料理", pick: "麻婆豆腐、擔擔麵、四川套餐", why: "想吃辣味與重口味時的穩定選擇" },
      { name: "謝甜記 貮号店", type: "中式粥／輕食", pick: "海鮮粥、油條、梅味雞", why: "排隊名店，適合想吃不太油膩的一餐" },
      { name: "菜香新館", type: "飲茶／點心", pick: "蝦餃、燒賣、叉燒包", why: "點心選擇多，適合多人分食" },
      { name: "MeetFresh 鮮芋仙 横浜中華街店", type: "甜品", pick: "芋圓、仙草、豆花", why: "飯後甜點或下午休息很方便" },
    ],
  },
  {
    match: ["迪士尼園區內", "東京迪士尼樂園"],
    items: [
      { name: "Hungry Bear Restaurant", type: "咖哩／快速用餐", pick: "咖哩飯、兒童餐", why: "份量穩、翻桌快，適合避開尖峰快速補體力" },
      { name: "Queen of Hearts Banquet Hall", type: "主題餐廳", pick: "漢堡排、甜點、主題造型餐", why: "愛麗絲主題感強，適合拍照與坐下休息" },
      { name: "Center Street Coffeehouse", type: "西式套餐／咖啡廳", pick: "套餐、甜點、飲料", why: "比速食型餐廳更適合慢慢吃" },
      { name: "Pan Galactic Pizza Port", type: "披薩／輕食", pick: "披薩、甜點、飲料", why: "動線簡單，適合多人快速分散點餐" },
      { name: "Grandma Sara's Kitchen", type: "舒適餐／家庭餐", pick: "蛋包飯、焗烤、套餐", why: "室內座位感較舒服，適合晚餐或雨天" },
    ],
  },
  {
    match: ["鎌倉小町通"],
    items: [
      { name: "キャラウェイ Caraway", type: "咖哩", pick: "歐風咖哩", why: "小町通周邊人氣排隊店，適合想吃飽" },
      { name: "秋本", type: "日式定食／鎌倉蔬菜", pick: "鎌倉蔬菜、吻仔魚料理", why: "想吃在地感午餐時很合適" },
      { name: "鎌倉釜飯 かまかま", type: "釜飯", pick: "吻仔魚釜飯、海鮮釜飯", why: "鎌倉代表性食材，適合坐下慢吃" },
      { name: "もみじ茶屋 小町通り", type: "甜點／和風咖啡", pick: "抹茶甜點、蕨餅", why: "逛街中段休息點" },
      { name: "さくらの夢見屋", type: "糰子／小吃", pick: "彩色糰子", why: "適合邊走邊吃與拍照" },
    ],
  },
  {
    match: ["原宿", "表參道", "竹下通"],
    items: [
      { name: "AFURI 原宿", type: "拉麵", pick: "柚子鹽拉麵", why: "清爽型拉麵，逛街途中容易安排" },
      { name: "bills 表參道", type: "早午餐", pick: "鬆餅、蛋料理", why: "適合想坐下休息與吃甜鹹早午餐" },
      { name: "THE GREAT BURGER", type: "美式漢堡", pick: "漢堡、薯條", why: "份量夠，適合不想吃日式餐的人" },
      { name: "南国酒家 原宿本店", type: "中華料理", pick: "炒飯、點心、套餐", why: "多人分食友善" },
      { name: "Ralph's Coffee Omotesando", type: "咖啡／甜點", pick: "咖啡、蛋糕", why: "逛表參道時好用的休息點" },
    ],
  },
  {
    match: ["江之島"],
    items: [
      { name: "とびっちょ 本店", type: "海鮮丼", pick: "吻仔魚丼、海鮮丼", why: "江之島代表性海鮮人氣店" },
      { name: "江之島小屋", type: "海鮮定食", pick: "海鮮丼、魚料理", why: "想坐下吃正餐時適合" },
      { name: "ALOHA TABLE 湘南", type: "夏威夷料理", pick: "漢堡排、夏威夷飯", why: "海邊感強，適合不吃海鮮的人" },
      { name: "あさひ本店", type: "小吃", pick: "章魚仙貝", why: "江之島散策經典小吃" },
      { name: "紀の国屋本店", type: "甜點", pick: "冰淇淋最中", why: "散步收尾的甜點選擇" },
    ],
  },
];

function attraction(hours, summary, ticket = "免費／無門票", stay = "60-90 分") { return { hours, summary, ticket, stay }; }
function restaurant(hours, recommended, avgCost, stay = "60-90 分") { return { hours, recommended, avgCost, stay }; }
function transfer(route, duration, fare, card = "Welcome Suica／PASMO／Mobile Suica") { return { route, duration, fare, card }; }

const DAYS = [
  {
    id: "0515", dayNo: 1, date: "05/15", weekday: "五", title: "新宿", level: 1,
    meals: { lunch: "機上／成田機場簡單吃", dinner: "牛炸豬排 Motomura" },
    note: "抵達日先晚餐再購物，買完直接回飯店整理。主要風險是出關、機場交通與牛かつ排隊。",
    items: [
      { id: "0515-f1", time: "08:55-13:15", type: "flight", title: "桃園 → 成田，團一航班", stay: "4 小時 20 分", detail: { summary: "使用者提供航班資訊。" } },
      { id: "0515-a1", time: "13:15-14:30", type: "airport", title: "成田出關、領行李、整理票券", stay: "60-75 分", detail: attraction("機場全天運作", "抵達後先處理入境、領行李、購買／啟用 IC 卡或機場交通票。", "無門票") },
      { id: "0515-t1", time: "14:30-16:15", type: "transfer", title: "成田機場 → 飯店", stay: "90-105 分", detail: transfer("成田機場 → 新宿／東京市區，再前往飯店A或飯店B。", "90-105 分", "N'EX 來回票約 ¥5,200；市區短程另計。") },
      { id: "0515-h1", time: "16:15-17:10", type: "hotel", title: "飯店 Check-in／放行李", stay: "55 分", detail: { summary: "飯店A Stay SAKURA Tokyo 新宿 百蔵、飯店B Hostel DEN 各自 Check-in。確認隔天集合方式與交通卡餘額。" } },
      { id: "0515-t2", time: "17:10-17:40", type: "transfer", title: "飯店 → 牛炸豬排Motomura", stay: "25-45 分", detail: transfer("飯店A／B 各自前往新宿南口方向；晚餐優先，避免購物後提著戰利品排隊。", "25-45 分", "IC 約 ¥150-300") },
      { id: "0515-r1", time: "17:40-19:30", type: "restaurant", title: "晚餐：牛炸豬排Motomura", stay: "110 分", detail: restaurant("常見 11:00-22:00", "牛かつ定食、麥飯、山藥泥、明太子搭配。", "約 ¥1,800-3,000／人", "90-120 分") },
      { id: "0515-t2b", time: "19:30-19:45", type: "transfer", title: "牛炸豬排Motomura → 新宿購物區", stay: "15 分", detail: transfer("晚餐後步行或短程移動到新宿東南口、唐吉訶德與新宿站周邊。", "10-20 分", "步行免費；短程電車另計") },
      { id: "0515-s1", time: "19:45-21:15", type: "attraction", title: "新宿購物｜唐吉訶德 新宿東南口店", stay: "90 分", detail: attraction("多為長時間營業；以現場為準", "首日補買旅用品、藥妝、零食與伴手禮。", "免費入店，購物另計", "60-90 分") },
      { id: "0515-t3", time: "21:15-22:00", type: "transfer", title: "新宿購物區 → 飯店", stay: "30-45 分", detail: transfer("購物後直接回飯店放戰利品、整理行李。", "30-45 分", "IC 約 ¥150-350") },
    ],
  },
  {
    id: "0516", dayNo: 2, date: "05/16", weekday: "六", title: "淺草‧晴空塔‧東京一番街", level: 3,
    meals: { lunch: "根室花まる KITTE 丸之內店", dinner: "萬喜-串燒居酒屋 18:30" },
    joinNote: "團二、團三 15:20 抵達成田，最可能在 18:00-18:30 直接接上中野『萬喜』晚餐。",
    note: "本日最緊湊。東京車站一番街是主要可刪減項目，晚餐後 KTV 需注意末班車。",
    items: [
      { id: "0516-t1", time: "07:30-08:15", type: "transfer", title: "飯店A／飯店B → 淺草車站", stay: "35-45 分", detail: transfer("兩組各自從飯店出發，到淺草站集合。", "飯店A 約 35-45 分；飯店B 約 20-30 分", "IC 約 ¥250-400") },
      { id: "0516-a1", time: "08:15-09:15", type: "attraction", title: "淺草寺、雷門", stay: "60 分", detail: attraction("本堂約 6:00-17:00", "早上人潮較少，適合作為第一站。", "免費") },
      { id: "0516-a2", time: "09:15-10:00", type: "attraction", title: "浅草 新仲見世商店街／仲見世周邊", stay: "45 分", detail: attraction("多數商店約 10:00 前後營業", "伴手禮、小吃、拍照與商店街散策；若店家尚未全開，可把時間挪給晴空塔。", "免費，購物另計") },
      { id: "0516-t2", time: "10:00-10:30", type: "transfer", title: "淺草 → 東京晴空塔", stay: "20-30 分", detail: transfer("可步行沿隅田川方向前往，或搭電車到押上／晴空塔。", "20-30 分", "步行免費；電車另計") },
      { id: "0516-a3", time: "10:30-12:00", type: "attraction", title: "東京晴空塔／東京ソラマチ", stay: "90 分", detail: attraction("多數商店 10:00-21:00", "不登塔則逛商場與拍外觀；登塔需額外時間。", "商場免費；展望台另計") },
      { id: "0516-t3", time: "12:00-12:45", type: "transfer", title: "晴空塔 → 東京站／KITTE", stay: "35-45 分", detail: transfer("押上／晴空塔站轉乘至東京站，午餐往 KITTE 丸之內。", "35-45 分", "IC 約 ¥250-400") },
      { id: "0516-r1", time: "12:45-14:15", type: "restaurant", title: "午餐：迴轉壽司 根室花丸", stay: "90 分", detail: restaurant("常見 11:00-22:00，可能需取號", "花咲蟹、炙燒系列、季節魚、湯品。", "約 ¥2,500-4,500／人") },
      { id: "0516-a4", time: "14:15-16:00", type: "attraction", title: "東京動漫人物街／東京車站一番街", stay: "105 分", detail: attraction("常見 10:00-20:30", "動漫、角色商品與伴手禮。本日時間壓力大，可刪減。", "免費，購物另計") },
      { id: "0516-t4", time: "16:00-16:40", type: "transfer", title: "東京站 → 中野『萬喜』", stay: "30-40 分", detail: transfer("JR 中央線快速到中野；團二、團三若從成田直接會合，晚餐地點作為集合點。", "30-40 分", "IC 約 ¥230-320") },
      { id: "0516-r2", time: "18:30-20:30", type: "restaurant", title: "晚餐：萬喜-串燒居酒屋", stay: "120 分", detail: restaurant("晚間營業，以預約為準", "串燒、雞肉料理、小菜與飲料。", "約 ¥3,000-5,000／人") },
      { id: "0516-w1", time: "20:30-20:40", type: "transfer", title: "萬喜 → Karaoke Big Echo Nakano Dori", stay: "10 分", detail: transfer("中野站周邊步行移動。", "5-10 分", "步行免費") },
      { id: "0516-k1", time: "20:40-22:40", type: "restaurant", title: "KTV：Karaoke Big Echo Nakano Dori", stay: "120 分", detail: restaurant("夜間營業與方案依店鋪公告", "包廂唱歌、飲料方案。注意最短使用時間、延長費與末班車。", "約 ¥1,500-4,000／人") },
      { id: "0516-t5", time: "22:40-23:40", type: "transfer", title: "中野 → 飯店", stay: "45-60 分", detail: transfer("飯店A 回新宿北側；飯店B 回小傳馬町／日本橋東側。", "45-60 分", "IC 約 ¥180-450") },
    ],
  },
  {
    id: "0517", dayNo: 3, date: "05/17", weekday: "日", title: "池袋‧澀谷", level: 2,
    meals: { lunch: "Denny's 親子餐廳／或原宿周邊", dinner: "[19:00] THE SLICE 和牛壽喜燒" },
    note: "上午 07:30 從飯店A／B 各自出發到 JR 池袋站，10:30 吉伊卡哇樂園為定位優先。自由團可留在池袋 PARCO／太陽城，之後再一起往原宿、表參道、澀谷推進。",
    items: [
      { id: "0517-t0", time: "07:30-10:10", type: "transfer", title: "飯店A／飯店B → JR池袋站", stay: "30-45 分", detail: transfer("飯店A 從新大久保／新宿北側出發；飯店B 從小傳馬町／日本橋東側出發，到 JR 池袋站集合或分流。", "30-45 分", "IC 約 ¥180-450") },
      { id: "0517-a1", time: "10:30-12:00", type: "attraction", title: "吉伊卡哇團：[10:30] 吉伊卡哇樂園10:30", stay: "90 分", detail: attraction("依整理券／入場時間", "10:30 定位優先，不可壓縮；購物與拍照都以入場時間為核心安排。", "免費入店，購物另計") },
      { id: "0517-a1b", time: "10:30-12:00", type: "attraction", title: "自由團：池袋PARCO 本館／太陽城", stay: "90 分", detail: attraction("多數店約 10:00/11:00 起營業", "自由團可逛池袋 PARCO、太陽城、角色商品、扭蛋與雜貨；12:00 前後再與吉伊卡哇團會合。", "免費入館，購物另計") },
      { id: "0517-t1", time: "12:00-12:40", type: "transfer", title: "池袋 → 原宿／Denny's 親子餐廳", stay: "30-40 分", detail: transfer("JR 山手線由池袋往原宿，午餐點以 Denny's Shibuya Koen-dori 或原宿周邊替代餐廳為主。", "30-40 分", "IC 約 ¥180-230") },
      { id: "0517-r1", time: "12:40-13:40", type: "restaurant", title: "午餐：Denny's 親子餐廳／原宿周邊", stay: "60 分", detail: restaurant("依分店公告", "家庭餐廳類：漢堡排、蛋包飯、兒童餐、甜點飲料；若排隊過長就改原宿周邊。", "約 ¥1,200-2,500／人") },
      { id: "0517-a2", time: "14:00-15:15", type: "attraction", title: "原宿／竹下通散策", stay: "75 分", detail: attraction("多數店 10:00/11:00-19:00/20:00", "竹下通甜點、服飾、拍照與小物店集中；人潮多，建議先訂集合點。", "免費，購物另計") },
      { id: "0517-a3", time: "15:15-16:00", type: "attraction", title: "表參道／哈利波特旗艦店", stay: "45 分", detail: attraction("依店鋪公告", "從原宿往表參道移動，哈利波特旗艦店以主題商品採買與拍照為主。", "免費入店，購物另計") },
      { id: "0517-t2", time: "16:00-16:30", type: "transfer", title: "原宿／表參道 → 澀谷區", stay: "15-30 分", detail: transfer("可步行往澀谷，或搭 JR 山手線一站；若腳累就直接搭車。", "15-30 分", "IC 約 ¥150-180；步行免費") },
      { id: "0517-a4", time: "16:30-18:00", type: "attraction", title: "澀谷PARCO／澀谷區周邊", stay: "90 分", detail: attraction("多數店約 11:00-21:00", "Nintendo、Pokemon、JUMP、Capcom 等角色商品集中；18:00 前要開始往晚餐移動。", "免費入館，購物另計") },
      { id: "0517-t3", time: "18:00-18:50", type: "transfer", title: "澀谷 → THE SLICE 和牛壽喜燒", stay: "40-60 分", detail: transfer("19:00 晚餐定位優先，建議 18:00 就離開澀谷購物區。", "40-60 分", "IC 約 ¥200-500") },
      { id: "0517-r2", time: "19:00-21:00", type: "restaurant", title: "晚餐：[19:00] THE SLICE 和牛壽喜燒 日式和牛火鍋", stay: "120 分", detail: restaurant("19:00 定位優先", "和牛壽喜燒、日式和牛火鍋套餐。", "約 ¥4,000-8,000／人以上") },
    ],
  },
  {
    id: "0518", dayNo: 4, date: "05/18", weekday: "一", title: "鎌倉‧湘南", level: 3,
    meals: { lunch: "鎌倉小町通", dinner: "江之島／藤澤，或回東京後吃" },
    note: "鎌倉取捨：大佛與長谷寺都深逛會壓縮海邊與江之島，建議擇一深逛。",
    items: [
      { id: "0518-t0", time: "07:30-09:00", type: "transfer", title: "飯店A／B → JR鐮倉", stay: "75-105 分", detail: transfer("飯店A 可走新宿系統；飯店B 可走東京／新橋轉橫須賀線，到 JR 鐮倉站集合。", "75-105 分", "IC 約 ¥950-1,200；周遊券另計") },
      { id: "0518-a1", time: "09:00-10:30", type: "attraction", title: "鎌倉小町通／鶴岡八幡宮方向", stay: "90 分", detail: attraction("小町通店家多約 10:00 前後開", "上午走鎌倉站周邊最順。", "多數免費，購物另計") },
      { id: "0518-r1", time: "11:30-12:30", type: "restaurant", title: "午餐：鎌倉小町通周邊", stay: "60 分", detail: restaurant("多數餐廳約 11:00 起", "鎌倉蔬菜、吻仔魚丼、咖哩、釜飯、街邊小吃。", "約 ¥1,500-3,000／人") },
      { id: "0518-t1", time: "12:30-13:00", type: "transfer", title: "鎌倉站 → 長谷站", stay: "20-30 分", detail: transfer("江之電移動到長谷站，依序安排大佛與長谷寺。", "20-30 分", "IC 約 ¥260") },
      { id: "0518-a2", time: "13:00-14:00", type: "attraction", title: "鎌倉大佛殿高德院", stay: "60 分", detail: attraction("約 8:00-17:30", "鎌倉代表景點。", "成人約 ¥300") },
      { id: "0518-a3", time: "14:00-15:00", type: "attraction", title: "長谷寺", stay: "60 分", detail: attraction("約 8:00-17:30", "庭園、觀音堂、海景平台。", "成人約 ¥400") },
      { id: "0518-t2", time: "15:00-15:40", type: "transfer", title: "長谷 → 七里濱／鐮倉高校前", stay: "30-40 分", detail: transfer("江之電往七里濱、鐮倉高校前；拍照時間視天氣與人潮調整。", "30-40 分", "IC 約 ¥260") },
      { id: "0518-a4", time: "15:40-17:00", type: "attraction", title: "七里濱／鐮倉高校前海邊拍照", stay: "80 分", detail: attraction("戶外開放", "海邊、平交道與湘南景色；請注意車流、人潮與安全。", "免費") },
      { id: "0518-t3", time: "17:00-17:45", type: "transfer", title: "七里濱／鐮倉高校前 → 江之島", stay: "30-45 分", detail: transfer("江之電至江之島站，再步行往江之島方向。", "30-45 分", "IC 約 ¥260") },
      { id: "0518-a5", time: "17:45-18:45", type: "attraction", title: "江之島傍晚散策／小吃候選", stay: "60 分", detail: attraction("戶外可散步；店家依現場營業", "可視體力選江之島小屋、ALOHA TABLE、とびっちょ、章魚仙貝、紀之國屋本店等點位。完整上島需 2-3 小時。", "上島免費；餐飲另計") },
      { id: "0518-t4", time: "19:00-21:00", type: "transfer", title: "江之島／藤澤 → 飯店", stay: "90-120 分", detail: transfer("JR 或小田急回東京市區；若體力不足可提早從藤澤回程。", "90-120 分", "約 ¥700-1,200") },
    ],
  },
  {
    id: "0519", dayNo: 5, date: "05/19", weekday: "二", title: "橫濱", level: 1,
    meals: { lunch: "橫濱中華街", dinner: "橫濱港區／中華街" },
    note: "橫濱預設步行＋IC 卡；雨天或腳累再考慮 Minato Burari Ticket Wide。",
    items: [
      { id: "0519-t0", time: "07:30-09:45", type: "transfer", title: "飯店A／B → JR石川町／橫濱", stay: "45-75 分", detail: transfer("兩組各自前往橫濱集合，上午以 JR 石川町較順，晚上可從 JR 橫濱回程。", "45-75 分", "IC 約 ¥550-750") },
      { id: "0519-a0", time: "10:00-11:00", type: "attraction", title: "港見丘公園／山下公園散步", stay: "60 分", detail: attraction("戶外開放", "先走港見丘公園，再往山下公園與海邊步道；拍照點多，雨天可縮短。", "免費") },
      { id: "0519-r1", time: "11:30-13:00", type: "restaurant", title: "午餐：橫濱中華街", stay: "90 分", detail: restaurant("多數餐廳約 11:00 起", "小籠包、燒賣、炒飯、擔擔麵、吃到飽或單點。", "約 ¥1,500-4,500／人") },
      { id: "0519-t1", time: "13:00-13:30", type: "transfer", title: "中華街 → 橫濱紅磚倉庫", stay: "20-30 分", detail: transfer("可步行經港區，或搭港未來線／公車縮短移動。", "20-30 分", "步行免費；電車/公車另計") },
      { id: "0519-a2", time: "13:30-15:00", type: "attraction", title: "橫濱紅磚倉庫1號館", stay: "90 分", detail: attraction("多數店約 10:00/11:00-20:00", "購物、甜點、拍照與港區散步。", "免費入館，購物另計") },
      { id: "0519-a3", time: "15:00-17:20", type: "attraction", title: "橫濱 COSMOWORLD／港未來自由活動", stay: "140 分", detail: attraction("依日期，可能休園或天候調整", "摩天輪、遊樂設施與夜景區；港未來可視體力自由散策。", "入園免費；設施券另計") },
      { id: "0519-a4", time: "17:20-18:00", type: "attraction", title: "空中纜車 YOKOHAMA AIR CABIN Unga Park Station", stay: "40 分", detail: attraction("依營業公告", "港未來移動體驗與夜景視角；若排隊太長可改步行。", "票價另計") },
      { id: "0519-r2", time: "18:00-19:30", type: "restaurant", title: "晚餐：港未來／中華街擇一", stay: "90 分", detail: restaurant("依餐廳", "中華街二刷、港區洋食、拉麵、甜點咖啡皆可；以回程動線決定。", "約 ¥1,500-4,000／人") },
      { id: "0519-t2", time: "20:00-21:30", type: "transfer", title: "JR橫濱／港未來 → 飯店", stay: "70-90 分", detail: transfer("從 JR 橫濱或港未來線回東京市區，飯店A／B 各自回程。", "70-90 分", "IC 約 ¥550-750") },
    ],
  },
  {
    id: "0520", dayNo: 6, date: "05/20", weekday: "三", title: "迪士尼", level: 3,
    meals: { lunch: "迪士尼園區內；芷馨為成田機場／機上", dinner: "迪士尼園區內；芷馨回台後自行安排" },
    splitNote: "芷馨不會與大家一起去迪士尼。這天直接分成迪士尼組與芷馨回程組。",
    note: "芷馨直接去成田最穩；迪士尼組需早到並先處理 App 與熱門設施。",
    items: [
      { id: "0520-t0", time: "07:00-08:15", type: "transfer", title: "迪士尼組：飯店 → 東京迪士尼樂園", stay: "60-75 分", detail: transfer("飯店A／B 各自前往舞濱，再步行或搭 Disney Resort Line 視當日入口安排。", "60-75 分", "IC 約 ¥450-650；園區交通另計") },
      { id: "0520-t0b", time: "07:00-09:15", type: "transfer", title: "芷馨：飯店 → 成田機場", stay: "90-135 分", detail: transfer("12:30 起飛建議 09:00-09:30 到機場，直接走成田最穩。", "90-135 分", "N'EX 或 Skyliner＋JR") },
      { id: "0520-a1", time: "09:00-21:00", type: "attraction", title: "東京迪士尼樂園", stay: "全天", detail: attraction("官方日曆顯示約 9:00-21:00", "先處理 App、熱門設施、Premier Access、Priority Pass、Mobile Order。", "成人票價依日期變動") },
      { id: "0520-r1", time: "12:00-13:00", type: "restaurant", title: "午餐：迪士尼園區內", stay: "60 分", detail: restaurant("依園區餐廳", "建議避開 12:00 尖峰或使用 Mobile Order。", "約 ¥1,500-3,500／人") },
      { id: "0520-r2", time: "17:00-18:00", type: "restaurant", title: "晚餐：迪士尼園區內", stay: "60 分", detail: restaurant("依園區餐廳", "建議 17:00 前後先吃，避開晚間遊行與閉園人潮。", "約 ¥1,500-4,000／人") },
      { id: "0520-t1", time: "21:00-22:30", type: "transfer", title: "迪士尼 → 飯店", stay: "75-90 分", detail: transfer("舞濱回東京市區；閉園後人潮多，回程要抓排隊與轉乘緩衝。", "75-90 分", "IC 約 ¥450-650") },
    ],
  },
  {
    id: "0521", dayNo: 7, date: "05/21", weekday: "四", title: "回台當社畜", level: 3,
    meals: { lunch: "11:30 牛舌檸檬 新宿", dinner: "成田機場／機上" },
    note: "返程停損：牛舌檸檬若 11:30 未入店就改機場午餐，避免影響航班。",
    items: [
      { id: "0521-h1", time: "07:00-09:30", type: "hotel", title: "整理行李、退房、寄放行李", stay: "150 分", detail: { summary: "確認飯店是否可寄放行李；整理護照、機票、現金、伴手禮與行李重量。" } },
      { id: "0521-a1", time: "09:30-10:30", type: "attraction", title: "唐吉訶德 新大久保／新宿最後採買", stay: "60 分", detail: attraction("多數店長時間營業", "最後採買，注意托運限制。", "免費入店，購物另計") },
      { id: "0521-t1", time: "10:30-11:15", type: "transfer", title: "飯店／新大久保 → 牛舌檸檬 新宿", stay: "30-45 分", detail: transfer("帶大行李需預留電梯、寄物與步行時間；11:30 定位不可壓縮。", "30-45 分", "IC 約 ¥150-180") },
      { id: "0521-r1", time: "11:30-12:20", type: "restaurant", title: "午餐：[11:30] 牛舌檸檬 新宿", stay: "50 分", detail: restaurant("11:30 定位優先", "厚切牛舌、牛舌定食、檸檬風味搭配。", "約 ¥2,000-4,500／人") },
      { id: "0521-t2", time: "12:30-14:00", type: "transfer", title: "新宿 → 成田機場", stay: "90 分", detail: transfer("推薦 N'EX 回成田；若 11:30 無法準時入店，午餐改機場避免影響航班。", "90-110 分", "N'EX 來回票或單程票") },
      { id: "0521-a2", time: "14:00-16:00", type: "airport", title: "成田機場報到、托運、安檢、採買", stay: "120 分", detail: attraction("機場依航班運作", "先報到托運再採買；注意液體、電池與伴手禮托運限制。", "無門票；購物餐飲另計") },
      { id: "0521-f1", time: "16:50-20:35", type: "flight", title: "團二／團一 成田 → 桃園", stay: "依航班", detail: { summary: "團二 16:50-19:40；團一 17:55-20:35。" } },
    ],
  },
];

const ICON_LABELS = {
  attraction: "景點",
  restaurant: "用餐",
  shopping: "購物",
  amusement: "樂園",
  transfer: "移動",
  hotel: "住宿",
  flight: "航班",
  airport: "機場",
  album: "相簿",
  route: "路線",
  fortune: "大吉籤",
};

function emptyPhotosByDay() { return Object.fromEntries(DAYS.map((day) => [day.id, []])); }
function dayPhotoTarget(dayId) { return PHOTO_TARGETS[dayId] || DEFAULT_PHOTO_TARGET; }
function dayFortuneUnlocked(dayId, count) { return count >= dayPhotoTarget(dayId); }
function tokyoTodayValue() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const valueOf = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return valueOf("year") * 10000 + valueOf("month") * 100 + valueOf("day");
}
function dayDateValue(day) {
  return TRIP_YEAR * 10000 + Number(day.id);
}
function dayHasArrived(day) {
  return tokyoTodayValue() >= dayDateValue(day);
}
function defaultExpandedDayId() {
  const todayValue = tokyoTodayValue();
  return DAYS.find((day) => dayDateValue(day) === todayValue)?.id || DAYS[0].id;
}
function isReservedItem(item) {
  return /\[\d{1,2}:\d{2}\]/.test(item.title || "") || /\b\d{1,2}:\d{2}\b/.test(item.title || "");
}
function mapPointForItem(day, item) {
  const points = DAY_MAP_POINTS[day.id] || [];
  const normalizedTitle = String(item.title || "").replace(/\s/g, "");
  return points.find((point) => normalizedTitle.includes(point.name.replace(/\s/g, "").slice(0, 5)) || point.name.replace(/\s/g, "").includes(normalizedTitle.slice(0, 5))) || points[0] || null;
}
function restaurantRecommendationsFor(item) {
  const title = String(item.title || "");
  if (item.type !== "restaurant") return [];
  return AREA_RESTAURANT_RECOMMENDATIONS.find((group) => group.match.some((keyword) => title.includes(keyword)))?.items || [];
}
function totalPhotoCount(photosByDay) { return Object.values(photosByDay || {}).reduce((sum, photos) => sum + (Array.isArray(photos) ? photos.length : 0), 0); }
function sortPhotosNewestFirst(photos) { return [...(photos || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function encodePath(path) { return String(path || "").split("/").map(encodeURIComponent).join("/"); }
function safeFilePart(value) { return String(value || "photo").replace(/[\\/:*?"<>|#%{}~&]/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80); }
function isImageFileName(name) { return /\.(png|jpe?g|webp|gif)$/i.test(String(name || "")); }
function photoUrlFromGitHubPath(path) { return `${GITHUB_RAW_BASE_URL}/${encodePath(path)}?v=${Date.now()}`; }
function dayFromPhotoPath(path) { const match = String(path || "").toLowerCase().match(/^photos\/day([1-7])\//); return match ? DAYS.find((day) => day.dayNo === Number(match[1])) || null : null; }
function createdAtFromGitHubName(name) {
  const head = String(name || "").split("/").pop().slice(0, 14);
  return head.length === 14 && [...head].every((char) => char >= "0" && char <= "9")
    ? `${head.slice(0, 4)}-${head.slice(4, 6)}-${head.slice(6, 8)}T${head.slice(8, 10)}:${head.slice(10, 12)}:${head.slice(12, 14)}.000Z`
    : new Date(0).toISOString();
}
function loadObjectFromStorage(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; } }
function saveToStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("照片讀取失敗，請換一張照片再試。"));
    };
    image.src = url;
  });
}
async function compressPhotoForUpload(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const image = await loadImageFromFile(file);
  const maxSide = 1800;
  const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob || blob.size >= file.size) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: file.lastModified || Date.now() });
}
function encodeBase64Unicode(text) { return btoa(unescape(encodeURIComponent(text))); }
function decodeBase64Unicode(base64) { return decodeURIComponent(escape(atob(String(base64 || "").replace(/\s/g, "")))); }
function makePhoto(day, path, meta = {}) {
  const name = String(path || "").split("/").pop();
  return { id: meta.id || `github-${day.id}-${path}`, dayId: day.id, itemId: meta.itemId || "github", itemTitle: meta.itemTitle || "GitHub 相簿", type: meta.type || "github", name: meta.name || name, githubPath: path, url: photoUrlFromGitHubPath(path), createdAt: meta.createdAt || createdAtFromGitHubName(name) };
}
function mergePhotosById(a, b) {
  const result = emptyPhotosByDay();
  DAYS.forEach((day) => {
    const map = new Map();
    [...(a?.[day.id] || []), ...(b?.[day.id] || [])].forEach((photo) => { if (photo?.githubPath || photo?.id) map.set(photo.githubPath || photo.id, photo); });
    result[day.id] = sortPhotosNewestFirst([...map.values()]);
  });
  return result;
}
function photosWithoutPaths(photosByDay, paths) {
  const blocked = new Set(paths);
  return Object.fromEntries(DAYS.map((day) => [day.id, sortPhotosNewestFirst((photosByDay?.[day.id] || []).filter((photo) => !blocked.has(photo.githubPath)))]));
}
function reconcileManifestWithTree(manifestPhotosByDay, treePhotosByDay) {
  const result = emptyPhotosByDay();
  DAYS.forEach((day) => {
    const manifestByPath = new Map((manifestPhotosByDay?.[day.id] || []).filter((photo) => photo.githubPath).map((photo) => [photo.githubPath, photo]));
    result[day.id] = sortPhotosNewestFirst((treePhotosByDay?.[day.id] || []).map((treePhoto) => {
      const manifestPhoto = manifestByPath.get(treePhoto.githubPath);
      return manifestPhoto ? { ...treePhoto, ...manifestPhoto, url: treePhoto.url, dayId: day.id, githubPath: treePhoto.githubPath } : treePhoto;
    }));
  });
  return result;
}
function photosToManifestList(photosByDay) {
  return DAYS.flatMap((day) => (photosByDay?.[day.id] || []).map((photo) => ({
    id: photo.id, dayId: day.id, itemId: photo.itemId, itemTitle: photo.itemTitle, type: photo.type, name: photo.name, githubPath: photo.githubPath, createdAt: photo.createdAt,
  }))).filter((photo) => photo.githubPath);
}
function manifestSignature(photosByDay) {
  return JSON.stringify(photosToManifestList(photosByDay).map((photo) => ({
    dayId: photo.dayId,
    githubPath: photo.githubPath,
    itemId: photo.itemId,
    itemTitle: photo.itemTitle,
    name: photo.name,
    createdAt: photo.createdAt,
  })).sort((a, b) => a.githubPath.localeCompare(b.githubPath)));
}
function manifestListToPhotosByDay(list) {
  const result = emptyPhotosByDay();
  (Array.isArray(list) ? list : []).forEach((item) => {
    const day = DAYS.find((d) => d.id === item.dayId) || dayFromPhotoPath(item.githubPath);
    if (day && item.githubPath) result[day.id].push(makePhoto(day, item.githubPath, item));
  });
  DAYS.forEach((day) => { result[day.id] = sortPhotosNewestFirst(result[day.id]); });
  return result;
}
function buildGitHubPhotoPath(dayId, item, file, index) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const day = DAYS.find((d) => d.id === dayId);
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `photos/day${day?.dayNo || dayId}/${stamp}-${index + 1}-${randomPart}-${safeFilePart(item.title)}.${ext}`;
}
function githubHeaders(token, extra = {}) {
  const headers = { Accept: "application/vnd.github+json", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
async function githubFetch(url, token, options = {}) {
  let response;
  try {
    response = await fetch(url, { cache: "no-store", ...options, headers: githubHeaders(token, options.headers || {}) });
  } catch (error) {
    const origin = typeof window !== "undefined" ? window.location.origin : "目前網頁";
    throw new Error(`無法連線到 GitHub API：${error instanceof Error ? error.message : String(error)}。這通常不是照片檔案問題，而是 ${origin} 這個瀏覽器環境連不到 api.github.com，或被瀏覽器外掛、VPN、公司/學校網路、行動網路防護、CORS 預檢擋下。請改用正式 GitHub Pages 網址並用 Chrome/Safari 測試。`);
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const msg = typeof data === "object" && data?.message ? data.message : text;
    const error = new Error(`${response.status} ${msg}`);
    error.status = response.status;
    throw error;
  }
  return data;
}
async function testGitHubApiAccess(token) {
  if (!token) throw new Error("請先儲存可寫入 repo contents 的 GitHub Fine-grained PAT。");
  await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}?t=${Date.now()}`, token);
}
async function uploadFileToGitHub(path, file, token) {
  if (!token) throw new Error("請先填入可寫入 repo contents 的 GitHub Fine-grained PAT。");
  const content = await fileToBase64(file);
  await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?t=${Date.now()}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Upload trip photo ${path}`, content, branch: GITHUB_BRANCH }),
  });
  return photoUrlFromGitHubPath(path);
}
async function deleteFileFromGitHub(path, token) {
  if (!token) throw new Error("請先填入可寫入 repo contents 的 GitHub Fine-grained PAT。");
  let data = null;
  try {
    data = await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, token);
  } catch (error) {
    if (error.status === 404) return;
    throw error;
  }
  if (!data?.sha) return;
  await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?t=${Date.now()}`, token, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Delete trip photo ${path}`, sha: data.sha, branch: GITHUB_BRANCH }),
  });
}
async function deletePhotosFromGitHub(photos, token) {
  for (const photo of photos) {
    if (photo?.githubPath) await deleteFileFromGitHub(photo.githubPath, token);
  }
}
async function githubPathExists(path, token) {
  try {
    await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(path)}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, token);
    return true;
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}
function movedPhotoPath(photo, targetDay) {
  const name = String(photo.githubPath || photo.name || "photo.jpg").split("/").pop();
  return `photos/day${targetDay.dayNo}/${name}`;
}
function uploadSpeedTestPath(file, index) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `photos/_upload-test/${stamp}-${index + 1}-${randomPart}-${safeFilePart(file.name)}.${ext}`;
}
function uniqueMovePath(path) {
  const dot = path.lastIndexOf(".");
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return dot > -1 ? `${path.slice(0, dot)}-move-${stamp}${path.slice(dot)}` : `${path}-move-${stamp}`;
}
async function movePhotoFileToGitHub(photo, targetDay, token) {
  if (!token) throw new Error("請先填入可寫入 repo contents 的 GitHub Fine-grained PAT。");
  if (!photo?.githubPath) return null;
  const oldPath = photo.githubPath;
  let newPath = movedPhotoPath(photo, targetDay);
  if (oldPath === newPath) return { ...photo, dayId: targetDay.id };
  const data = await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(oldPath)}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, token);
  if (await githubPathExists(newPath, token)) newPath = uniqueMovePath(newPath);
  await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(newPath)}?t=${Date.now()}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Move trip photo ${oldPath} to ${newPath}`, content: String(data.content || "").replace(/\s/g, ""), branch: GITHUB_BRANCH }),
  });
  await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(oldPath)}?t=${Date.now()}`, token, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Remove moved trip photo ${oldPath}`, sha: data.sha, branch: GITHUB_BRANCH }),
  });
  return { ...photo, id: `github-${targetDay.id}-${newPath}`, dayId: targetDay.id, githubPath: newPath, url: photoUrlFromGitHubPath(newPath) };
}
async function movePhotosInGitHub(photos, targetDayId, token) {
  const targetDay = DAYS.find((day) => day.id === targetDayId);
  if (!targetDay) throw new Error("找不到目標相簿。");
  const moved = [];
  for (const photo of photos) {
    const nextPhoto = await movePhotoFileToGitHub(photo, targetDay, token);
    if (nextPhoto) moved.push(nextPhoto);
  }
  return moved;
}
async function readManifest(token) {
  try {
    const data = await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(ALBUM_MANIFEST_PATH)}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, token);
    const json = JSON.parse(decodeBase64Unicode(data.content));
    return { sha: data.sha || null, photosByDay: manifestListToPhotosByDay(json.photos || []) };
  } catch (error) {
    if (error.status === 404) return { sha: null, photosByDay: emptyPhotosByDay() };
    throw error;
  }
}
async function readPublicManifest() {
  let response;
  try {
    response = await fetch(`${PUBLIC_ALBUM_MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" });
  } catch {
    return { sha: null, photosByDay: emptyPhotosByDay() };
  }
  if (response.status === 404) return { sha: null, photosByDay: emptyPhotosByDay() };
  if (!response.ok) return { sha: null, photosByDay: emptyPhotosByDay() };
  const json = await response.json();
  return { sha: null, photosByDay: manifestListToPhotosByDay(json.photos || []) };
}
async function writeManifest(photosByDay, token, sha = null) {
  if (!token) throw new Error("請先填入可寫入 repo contents 的 GitHub Fine-grained PAT。");
  const body = {
    message: `Update trip album manifest ${new Date().toISOString()}`,
    content: encodeBase64Unicode(JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), photos: photosToManifestList(photosByDay) }, null, 2)),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  return githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodePath(ALBUM_MANIFEST_PATH)}?t=${Date.now()}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function fetchTreePhotos(token) {
  const data = await githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1&t=${Date.now()}`, token);
  const result = emptyPhotosByDay();
  (Array.isArray(data.tree) ? data.tree : []).filter((f) => f.type === "blob" && /^photos\/day[1-7]\//i.test(String(f.path || "")) && isImageFileName(f.path)).forEach((f) => {
    const day = dayFromPhotoPath(f.path);
    if (day) result[day.id].push(makePhoto(day, f.path));
  });
  DAYS.forEach((day) => { result[day.id] = sortPhotosNewestFirst(result[day.id]); });
  return result;
}
async function fetchSyncedAlbum(token) {
  if (!token) {
    const manifest = await readPublicManifest();
    return { photosByDay: manifest.photosByDay, manifestSha: null };
  }
  const manifest = await readManifest(token);
  const tree = await fetchTreePhotos(token);
  const reconciled = reconcileManifestWithTree(manifest.photosByDay, tree);
  if (manifestSignature(manifest.photosByDay) !== manifestSignature(reconciled)) {
    await writeManifest(reconciled, token, manifest.sha);
  }
  return { photosByDay: reconciled, manifestSha: manifest.sha };
}

function DetailRows({ item }) {
  const d = item.detail || {};
  if (item.type === "transfer") {
    return <div className="grid">
      <Info label="交通轉乘方式" value={d.route} />
      <Info label="使用票券" value={d.card} />
      <Info label="票價" value={d.fare} />
      <Info label="移動時間" value={d.duration || item.stay} />
    </div>;
  }
  return <div className="grid">
    {d.summary && <Info label="摘要" value={d.summary} />}
    {d.route && <Info label="轉乘資訊" value={d.route} />}
    {d.hours && <Info label="營業／開放時間" value={d.hours} />}
    {d.recommended && <Info label="推薦餐點" value={d.recommended} />}
    {d.avgCost && <Info label="平均消費" value={d.avgCost} />}
    {d.ticket && <Info label="門票／費用" value={d.ticket} />}
    <Info label="建議／估計停留" value={d.stay || item.stay} />
  </div>;
}
function Info({ label, value }) { return <div className="info"><b>{label}</b><div className="small muted">{value || "待確認"}</div></div>; }
function InfoList({ label, items }) {
  return <div className="info"><b>{label}</b><ul className="infoList">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
function RichDetailRows({ item, day }) {
  const d = item.detail || {};
  const rows = [];
  const title = item.title || "";
  const point = mapPointForItem(day, item);
  const reserved = isReservedItem(item);
  const restaurantRecommendations = restaurantRecommendationsFor(item);

  if (reserved) rows.push({ label: "定位／預約優先", items: ["標題中含有時間，表示此段有定位或指定入場時間。前後交通、購物與拍照都要讓位給這個時間。"] });
  if (title.includes("飯店A／飯店B") || title.includes("飯店A／B") || title.includes("飯店")) {
    rows.push({ label: "飯店出發規則", items: [`飯店A：${HOTEL_A.name}，出發時以新大久保／新宿北側動線估算。`, `飯店B：${HOTEL_B.name}，出發時以小傳馬町／日本橋東側動線估算。`, "每日早上預設兩組各自從 A、B 點出發；Day3 上午 07:30 左右出發，分成自由團與吉伊卡哇團。"] });
  }
  if (item.type === "transfer") {
    rows.push({ label: "集合點與交通", items: [`集合點建議抓在「${point?.name || item.title}」250 公尺範圍內，優先選車站出口、商場正門、雷門/地標招牌等顯眼位置。`, "飯店A、飯店B 前往時間以行程卡估算為主；實際出門前用 Google Maps 重新確認月台與步行出口。"] });
  }
  if (title.includes("購物") || title.includes("唐吉訶德") || title.includes("動漫")) {
    rows.push({ label: "購物重點", items: ["唐吉訶德適合補藥妝、零食、旅行用品與伴手禮；結帳前留意免稅排隊與包裝規定。", "角色商品街建議先鎖定必買清單，熱門店鋪容易因排隊與缺貨拉長時間。"] });
  }
  if (title.includes("散步") || title.includes("公園") || title.includes("小町通") || title.includes("原宿") || title.includes("江之島")) {
    rows.push({ label: "散步觀察點", items: ["以 250 公尺內容易辨識的入口、橋、鳥居、商店街拱門、海景平台作為集合或折返點。", "邊走邊拍時先定一個回合時間，避免小吃、拍照與排隊讓後段行程被吃掉。"] });
  }
  if (item.type === "restaurant") {
    rows.push({ label: "用餐提醒", items: ["營業時間與最後點餐以店鋪當日公告為準；熱門店請預留排隊、取號或入席緩衝。", d.recommended ? `推薦餐點：${d.recommended}` : "先確認招牌餐點、兒童/不吃生食選項與是否可分開結帳。", d.avgCost ? `消費估算：${d.avgCost}` : "消費規定以現場菜單、低消、服務費與付款方式為準。"] });
  }
  if (restaurantRecommendations.length > 0) {
    rows.push({
      label: "範圍內餐廳候選（5間不同類型）",
      items: restaurantRecommendations.map((restaurant) => `${restaurant.name}｜${restaurant.type}：${restaurant.why}。可優先看 ${restaurant.pick}。`),
    });
  }
  if (item.type === "attraction" || item.type === "airport") {
    rows.push({ label: "景點導覽", items: [d.summary || "以地圖標記點為核心，先完成必拍/必逛，再視體力延伸到周邊。", d.ticket ? `費用：${d.ticket}` : "戶外或商場型點位多為免費進入，消費另計。"] });
  }
  if (title.includes("迪士尼")) {
    rows.push({ label: "樂園攻略", items: ["入園後先用 Tokyo Disney Resort App 綁定全員票券，再處理 Disney Premier Access、40th Anniversary Priority Pass、Standby Pass、Entry Request 與 Mobile Order。", "熱門優先：美女與野獸、貝イマックス、Splash Mountain、遊行/城堡周邊卡位；實際營運與適用設施以官方 App 當天顯示為準。", "午晚餐避開 12:00 與遊行前後尖峰，能 Mobile Order 的餐廳優先使用。"] });
  }

  return <div className="grid richDetails">
    <DetailRows item={item} />
    {point && <div className="info landmarkCard">
      <b>250 公尺地標參考</b>
      <div className="small muted">以 KML 點位「{point.name}」為中心，建議找車站出口、正門、招牌或大型建築作為集合識別點。</div>
      <a className="mapPreview" href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`} target="_blank" rel="noreferrer">開啟地圖參考圖</a>
    </div>}
    {rows.map((row) => <InfoList key={row.label} label={row.label} items={row.items} />)}
  </div>;
}
function typeLabel(type) { return { attraction: "景點", restaurant: "餐廳", transfer: "移動", hotel: "住宿", flight: "航班", airport: "機場" }[type] || type; }
function itemIconType(item) {
  const title = String(item?.title || "");
  if (item?.type === "restaurant") return "restaurant";
  if (item?.type === "hotel") return "hotel";
  if (/迪士尼|樂園|COSMOWORLD|摩天輪|AIR CABIN|纜車/.test(title)) return "amusement";
  if (/購物|唐吉訶德|動漫|PARCO|太陽城|商店街|仲見世|竹下通|採買|旗艦店/.test(title)) return "shopping";
  return item?.type || "attraction";
}
function TravelIconSvg({ type }) {
  const stroke = "#4b2f1d";
  const common = { stroke, strokeWidth: 3.4, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "restaurant") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M16 9v13M11 9v10c0 3 2 5 5 5s5-2 5-5V9" fill="none" {...common} />
    <path d="M16 24v15" {...common} />
    <path d="M32 9c5 4 5 14 0 18v12" fill="#fda4af" {...common} />
    <path d="M13 14h6M30 14c2 3 2 6 0 9" stroke="#fff7ed" strokeWidth="2.4" strokeLinecap="round" />
  </svg>;
  if (type === "shopping") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 12h5l4 20h17l4-14H17" fill="#fef3c7" {...common} />
    <path d="M20 22h15" stroke="#fff7ed" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="21" cy="38" r="3" fill="#fda4af" {...common} />
    <circle cx="34" cy="38" r="3" fill="#bbf7d0" {...common} />
  </svg>;
  if (type === "amusement") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="20" r="13" fill="#e9d5ff" {...common} />
    <circle cx="24" cy="20" r="3" fill="#fef3c7" {...common} />
    <path d="M24 23l-8 17M24 23l8 17M15 40h18" fill="none" {...common} />
    <path d="M24 7v8M11 20h8M29 20h8M15 11l6 6M33 11l-6 6M15 29l6-6M33 29l-6-6" stroke="#fff7ed" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
  if (type === "transfer") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="11" y="9" width="26" height="29" rx="7" fill="#dbeafe" {...common} />
    <path d="M16 15h16" {...common} />
    <rect x="15" y="19" width="18" height="9" rx="3" fill="#fff7ed" {...common} />
    <circle cx="18" cy="33" r="2.4" fill="#4b2f1d" />
    <circle cx="30" cy="33" r="2.4" fill="#4b2f1d" />
    <path d="M17 41h14" {...common} />
  </svg>;
  if (type === "hotel") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M9 18v20" fill="none" {...common} />
    <path d="M9 28h30v10H9z" fill="#fef3c7" {...common} />
    <path d="M13 20h11a5 5 0 0 1 5 5v3H13z" fill="#bbf7d0" {...common} />
    <path d="M29 23h10v15" fill="none" {...common} />
    <path d="M14 32h20" stroke="#fff7ed" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
  if (type === "flight") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M8 27l31-16c2.6-1.3 4.8 1.9 2.7 4L31 26l4 12-5 2-8-10-10 3-4-6z" fill="#e0e7ff" {...common} />
    <path d="M18 25l-6-9 4-2 10 7" fill="#fda4af" {...common} />
    <path d="M31 26l-8-5" stroke="#fff7ed" strokeWidth="2.3" strokeLinecap="round" />
  </svg>;
  if (type === "airport") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="12" y="16" width="25" height="23" rx="5" fill="#c7d2fe" {...common} />
    <path d="M19 16v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="none" {...common} />
    <path d="M18 23h13M18 29h13" stroke="#fff7ed" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M17 42h3M29 42h3" {...common} />
  </svg>;
  if (type === "album") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="9" y="12" width="30" height="25" rx="5" fill="#e9d5ff" {...common} />
    <circle cx="30" cy="21" r="3" fill="#fda4af" {...common} />
    <path d="M13 33l8-8 6 6 4-4 5 6" fill="#bbf7d0" {...common} />
  </svg>;
  if (type === "route") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="16" fill="#dbeafe" {...common} />
    <path d="M28 13l-4 13-8 8 4-13z" fill="#fda4af" {...common} />
    <circle cx="24" cy="24" r="2" fill="#4b2f1d" />
  </svg>;
  if (type === "fortune") return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17 11h14l6 7-3 22H14l-3-22z" fill="#fda4af" {...common} />
    <path d="M19 11c0-4 10-4 10 0" fill="none" {...common} />
    <path d="M18 26h12M22 20h4M20 32h8" stroke="#fff7ed" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M37 9l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#fde68a" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
  </svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="9" y="16" width="30" height="22" rx="6" fill="#fef3c7" {...common} />
    <path d="M17 16l3-5h9l3 5" fill="#fda4af" {...common} />
    <circle cx="24" cy="27" r="7" fill="#c7d2fe" {...common} />
    <circle cx="24" cy="27" r="3" fill="#4b2f1d" />
    <path d="M14 21h7M31 22h3" stroke="#fff7ed" strokeWidth="2.3" strokeLinecap="round" />
  </svg>;
}

function mark(type) {
  return <span className={`icon icon-${type}`} role="img" aria-label={ICON_LABELS[type] || "項目"}><TravelIconSvg type={type} /></span>;
}
function isTokenError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return error?.status === 401 || error?.status === 403 || /bad credentials|requires authentication|resource not accessible|fine-grained pat|token/i.test(message);
}
function buildFortune(day) {
  const next = DAYS[DAYS.findIndex((item) => item.id === day.id) + 1];
  return {
    title: { "0515": "出發大吉", "0516": "購物不手軟大吉", "0517": "腿力尚存大吉", "0518": "海風吹到剛好大吉", "0519": "排隊變短大吉", "0520": "行李沒爆大吉", "0521": "社畜復歸大吉" }[day.id] || "大吉",
    target: next ? TABS[next.id] : "旅程結束",
    main: next ? `明日是「${TABS[next.id]}」，願排隊縮短、轉乘順利、照片都剛好對焦。` : "旅程圓滿收尾，願照片都變成故事，帳單晚點再想。",
  };
}

function companionPreviewMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("companions") === "1";
}

function MainHeader({ photosByDay }) {
  const unlocked = DAYS.filter((day) => dayFortuneUnlocked(day.id, (photosByDay[day.id] || []).length)).map((day) => day.dayNo);
  const previewMode = companionPreviewMode();
  const companionIds = previewMode ? Object.keys(HEADER_COMPANION_LAYOUT).map(Number) : [0, ...unlocked];
  return <header className={`hero card${previewMode ? " companionPreview" : ""}`}>
    <div style={{ position: "relative" }}>
      <img src={DEFAULT_COMMON_HEADER_BG} alt="2026 東京自由行" />
      {[...new Set(companionIds)].map((dayNo) => {
        const basePos = HEADER_COMPANION_LAYOUT[dayNo];
        const pos = basePos ? adjustedHeaderCompanionPosition(dayNo, basePos) : null;
        return pos ? <span key={dayNo} className={`heroCompanion heroCompanion-${dayNo}`} style={{ left: `${pos.left}%`, top: `${pos.top}%`, width: `${pos.width * HEADER_COMPANION_SCALE}%` }}><img src={partnerImageUrl(dayNo)} alt={pos.label} /></span> : null;
      })}
    </div>
  </header>;
}

function Settings({ token, forceOpen, onSaveToken, onClearToken }) {
  const [open, setOpen] = useState(forceOpen || !token);
  const [draftToken, setDraftToken] = useState("");

  useEffect(() => {
    setOpen(forceOpen || !token);
    setDraftToken("");
  }, [forceOpen, token]);

  if (token && !open) {
    return <section className="card section settingsStatus">
      <div>
        <h2>GitHub 相簿同步已設定</h2>
        <p className="small muted">Token 已儲存在這台裝置的瀏覽器。只有上傳照片或同步失敗時才需要重新設定。</p>
      </div>
      <div className="settingActions">
        <button className="button" type="button" onClick={() => setOpen(true)}>更換 token</button>
        <button className="button" type="button" onClick={onClearToken}>移除</button>
      </div>
    </section>;
  }

  return <section className="card section">
    <h2>GitHub 相簿同步設定</h2>
    <p className="small muted">請填入只具備此 repo Contents 讀寫權限的 Fine-grained PAT。按下儲存後，這個設定區會自動隱藏。</p>
    <label className="field">
      <span className="small">GitHub PAT</span>
      <input type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} placeholder="github_pat_..." autoComplete="off" />
    </label>
    <div className="settingActions">
      <button className="button primary" type="button" disabled={!draftToken.trim()} onClick={() => onSaveToken(draftToken.trim())}>儲存 token</button>
      {token && <button className="button" type="button" onClick={() => setOpen(false)}>取消</button>}
    </div>
  </section>;
}

function DayCard({ day, open, onToggle, onItemClick, photoCount, onOpenFortune, onOpenPhotoTool }) {
  const unlocked = dayFortuneUnlocked(day.id, photoCount);
  const available = dayHasArrived(day);
  const photoButtonTitle = available ? (unlocked ? "查看大吉籤" : "上傳照片") : "尚未到來，當天才可上傳照片";
  return <section className="day card">
    <div className="dayHero" style={{ backgroundImage: `url(${DEFAULT_DAY_BG[day.id]})` }}>
      <div className="dayBadge">Day.{day.dayNo}<br />{day.date}({day.weekday})</div>
      <button className={`photoButton${available ? "" : " isFuture"}${available && !unlocked ? " isReady" : ""}`} type="button" aria-disabled={!available} onClick={() => available ? (unlocked ? onOpenFortune(day) : onOpenPhotoTool(day)) : window.alert(`${TABS[day.id]} 尚未開放照片上傳。開放條件：日本時間 ${TRIP_YEAR}/${day.date} 當天起才可上傳。`)} title={photoButtonTitle}>
        <img src={unlocked ? OMAMORI_ICON_URL : PHOTO_ICON_URL} alt={unlocked ? "御守" : "相機"} />
      </button>
      <button className="dayToggle" type="button" onClick={onToggle}>{open ? "▲收合詳細行程▲" : `▼${day.title}▼`}</button>
    </div>
    {open && <div className="dayBody">
      <div className="note"><b>行程摘要</b><br />{day.note}</div>
      {(day.joinNote || day.splitNote) && <p className="note">{day.joinNote || day.splitNote}</p>}
      {day.items.map((item) => <button key={item.id} type="button" className="item" onClick={() => onItemClick(day, item)}>
        <b>{item.time}</b>{mark(itemIconType(item))}<span><b>{item.title}</b><br /><span className="small muted">{typeLabel(item.type)}｜{item.stay}</span></span>
      </button>)}
      <DayMap day={day} />
    </div>}
  </section>;
}

function DayMap({ day }) {
  const map = DAY_MY_MAPS[day.id];
  const points = DAY_MAP_POINTS[day.id] || [];
  const embedUrl = map ? `https://www.google.com/maps/d/u/4/embed?mid=${map.mid}&ll=${map.ll}&z=${map.z}&ehbc=2E312F` : "";
  const viewerUrl = map ? `https://www.google.com/maps/d/u/4/viewer?mid=${map.mid}&ll=${map.ll}&z=${map.z}` : "";
  return <section className="dayMap">
    <div className="dayMapHeader">
      <div>
        <h3>本日地圖｜{TABS[day.id]}</h3>
        <p className="small muted">載入當日專用 Google My Maps，只顯示該日圖層中的點位。</p>
      </div>
      {viewerUrl && <a className="button" href={viewerUrl} target="_blank" rel="noreferrer">開啟大地圖</a>}
    </div>
    <div className="mapFrame">
      {embedUrl ? <iframe
        src={embedUrl}
        title={`Day${day.dayNo} ${day.title} My Maps`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      /> : <div className="mapFallback">尚未設定本日地圖</div>}
    </div>
    <div className="mapPlaces">
      {points.map((point, index) => <span key={`${point.name}-${index}`}>{index + 1}. {point.name}</span>)}
    </div>
  </section>;
}

function AlbumSection({ photosByDay, loading, onRefresh, onOpenPhotoTool, onDeletePhotos, deleting, onMovePhotos, moving }) {
  const total = totalPhotoCount(photosByDay);
  const firstPhotoDay = DAYS.find((day) => (photosByDay[day.id] || []).length > 0) || DAYS[0];
  const [selectedDayId, setSelectedDayId] = useState(firstPhotoDay.id);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [moveTargetDayId, setMoveTargetDayId] = useState("");
  const selectedDay = DAYS.find((day) => day.id === selectedDayId) || firstPhotoDay;
  const selectedPhotos = sortPhotosNewestFirst(photosByDay[selectedDay.id] || []);
  const unlockedCount = DAYS.filter((day) => dayFortuneUnlocked(day.id, (photosByDay[day.id] || []).length)).length;
  const target = dayPhotoTarget(selectedDay.id);
  const progress = Math.min(100, Math.round((selectedPhotos.length / target) * 100));
  const selectedAvailable = dayHasArrived(selectedDay);
  function openSelectedUpload() {
    if (selectedAvailable) {
      onOpenPhotoTool(selectedDay);
      return;
    }
    window.alert(`${TABS[selectedDay.id]} 尚未開放照片上傳。開放條件：日本時間 ${TRIP_YEAR}/${selectedDay.date} 當天起才可上傳。`);
  }
  function togglePhoto(photoId) {
    setSelectedPhotoIds((prev) => prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]);
  }
  function handlePhotoClick(photo) {
    if (deleteMode) {
      togglePhoto(photo.id);
      return;
    }
    setViewerPhoto(photo);
  }
  async function requestDeleteSelected() {
    const photos = selectedPhotos.filter((photo) => selectedPhotoIds.includes(photo.id));
    if (photos.length === 0) return;
    const password = window.prompt(`即將刪除 ${photos.length} 張照片。請輸入管理密碼：`);
    if (password !== "0508") {
      window.alert("管理密碼錯誤，已取消刪除。");
      return;
    }
    await onDeletePhotos(photos);
    setSelectedPhotoIds([]);
  }
  async function requestMoveSelected() {
    const photos = selectedPhotos.filter((photo) => selectedPhotoIds.includes(photo.id));
    const targetDayId = moveTargetDayId || DAYS.find((day) => day.id !== selectedDay.id)?.id || "";
    const targetDay = DAYS.find((day) => day.id === targetDayId);
    if (photos.length === 0 || !targetDay) return;
    if (targetDay.id === selectedDay.id) {
      window.alert("請選擇不同的目標相簿。");
      return;
    }
    if (!window.confirm(`要把 ${photos.length} 張照片移動到 Day${targetDay.dayNo}｜${targetDay.title} 嗎？`)) return;
    await onMovePhotos(photos, targetDay.id);
    setSelectedPhotoIds([]);
  }

  useEffect(() => {
    setSelectedPhotoIds([]);
    setDeleteMode(false);
    setMoveTargetDayId(DAYS.find((day) => day.id !== selectedDayId)?.id || "");
  }, [selectedDayId]);

  return <section className="albumShowcase card section">
    <div className="albumTabs" role="tablist" aria-label="每日相簿頁籤">
      {DAYS.map((day) => {
        const photos = sortPhotosNewestFirst(photosByDay[day.id] || []);
        return <button className={`albumTab${day.id === selectedDay.id ? " active" : ""}`} type="button" role="tab" aria-selected={day.id === selectedDay.id} key={day.id} onClick={() => setSelectedDayId(day.id)}>
          <b>Day{day.dayNo}</b>
          <span>{day.title}</span>
          <small>{photos.length} 張</small>
        </button>;
      })}
    </div>

    <div className="albumPage" role="tabpanel" aria-label={`Day${selectedDay.dayNo} ${selectedDay.title}`}>
      <div className="albumPageHero">
        <div className="albumCover">
          <img src={DEFAULT_DAY_BG[selectedDay.id]} alt={`Day${selectedDay.dayNo} ${selectedDay.title}`} />
          <div className="albumCoverBadge">Day{selectedDay.dayNo}｜{selectedDay.title}</div>
        </div>
        <div>
          <h3>Day{selectedDay.dayNo}｜{TABS[selectedDay.id]}</h3>
          <p className="small muted">{selectedDay.date}({selectedDay.weekday})｜{selectedPhotos.length} 張照片，目標 {target} 張</p>
          <div className="progress albumPageProgress"><div className="bar" style={{ width: `${progress}%` }} /></div>
          <div className="albumPageMeta">
            <span>{selectedPhotos.length}/{target}</span>
            <span>{dayFortuneUnlocked(selectedDay.id, selectedPhotos.length) ? "大吉籤已解鎖" : "照片蒐集中"}</span>
            <button className="albumUploadButton" type="button" aria-disabled={!selectedAvailable} onClick={openSelectedUpload}>上傳照片</button>
            {selectedPhotos.length > 0 && <button className={`albumManageButton${deleteMode ? " active" : ""}`} type="button" onClick={() => { setDeleteMode((value) => !value); setSelectedPhotoIds([]); }}>{deleteMode ? "結束管理" : "管理照片"}</button>}
          </div>
        </div>
      </div>

      {selectedPhotos.length === 0 ? <div className="albumEmpty">
        <img src={partnerImageUrl(selectedDay.dayNo)} alt={`Day${selectedDay.dayNo} 小可愛`} />
        <b>這一天還沒有照片</b>
        <p>從每日相機按鈕上傳照片後，這一整頁會切換成當天的回憶內容。</p>
      </div> : <div className={`albumGrid${deleteMode ? " deleteMode" : ""}`}>
        {selectedPhotos.map((photo, index) => <figure className={`${index === 0 ? "albumPhoto featured" : "albumPhoto"}${selectedPhotoIds.includes(photo.id) ? " selected" : ""}`} key={photo.id} onClick={() => handlePhotoClick(photo)}>
          {deleteMode && <label className="photoSelect" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedPhotoIds.includes(photo.id)} onChange={() => togglePhoto(photo.id)} />選取</label>}
          <img src={photo.url} alt={photo.name} />
        </figure>)}
      </div>}
    </div>
    {deleteMode && selectedPhotoIds.length > 0 && <div className="albumMoveBar">
      <span>已選 {selectedPhotoIds.length} 張</span>
      <select value={moveTargetDayId || DAYS.find((day) => day.id !== selectedDay.id)?.id || ""} onChange={(event) => setMoveTargetDayId(event.target.value)}>
        {DAYS.filter((day) => day.id !== selectedDay.id).map((day) => <option key={day.id} value={day.id}>Day{day.dayNo}｜{day.title}</option>)}
      </select>
      <button className="albumMoveButton" type="button" disabled={moving} onClick={requestMoveSelected}>{moving ? "移動中..." : "移動到此相簿"}</button>
    </div>}
    {viewerPhoto && <PhotoViewerModal photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />}
    {deleteMode && selectedPhotoIds.length > 0 && <button className="floatingDeleteButton" type="button" disabled={deleting} onClick={requestDeleteSelected}>
      <span>{deleting ? "刪" : selectedPhotoIds.length}</span>
      <small>{deleting ? "除中" : "刪除"}</small>
    </button>}
    <div className="albumFooterActions">
      <div className="albumFooterStats"><b>{total}</b> 張照片｜<b>{unlockedCount}</b>/7 大吉籤</div>
      <button className="button primary albumSync" type="button" onClick={onRefresh} disabled={loading}>{loading ? "同步中..." : "同步相簿"}</button>
    </div>
  </section>;
}

function isMobilePhotoViewer() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
}

function PhotoViewerModal({ photo, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [landscape, setLandscape] = useState(false);
  const mobileViewer = useMemo(isMobilePhotoViewer, []);
  const imageTransform = mobileViewer ? (landscape ? "rotate(90deg)" : "none") : `scale(${zoom})`;
  useEffect(() => {
    setZoom(1);
    setLandscape(false);
  }, [photo?.id]);
  return <div className={`photoViewer${mobileViewer ? " mobile" : ""}${mobileViewer && landscape ? " landscape" : ""}`} onMouseDown={onClose}>
    <div className="photoViewerTop" onMouseDown={(event) => event.stopPropagation()}>
      <div>
        <b>{photo.itemTitle}</b>
        <span>{photo.name}</span>
      </div>
      <button className="button" type="button" onClick={onClose}>關閉</button>
    </div>
    <div className="photoViewerStage" onMouseDown={(event) => event.stopPropagation()}>
      <img src={photo.url} alt={photo.name} style={{ transform: imageTransform }} onLoad={(event) => setLandscape(event.currentTarget.naturalWidth > event.currentTarget.naturalHeight)} onClick={(event) => { if (mobileViewer) { event.stopPropagation(); onClose(); } }} />
    </div>
    {!mobileViewer && <div className="photoViewerControls" onMouseDown={(event) => event.stopPropagation()}>
      <button className="button" type="button" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}>-</button>
      <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="照片縮放" />
      <button className="button" type="button" onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}>+</button>
      <button className="button" type="button" onClick={() => setZoom(1)}>1x</button>
    </div>}
  </div>;
}

function PhotoModal({ day, photos, onUpload, onClose, uploading, uploadStatus }) {
  const uploadItem = { id: `${day.id}-album`, title: `Day${day.dayNo}｜${day.title}`, type: "album" };
  const target = dayPhotoTarget(day.id);
  const progress = Math.min(100, Math.round((photos.length / target) * 100));
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modalTop"><div><h2>Day{day.dayNo}｜照片蒐集</h2><p className="small muted">{photos.length}/{dayPhotoTarget(day.id)} 張</p></div><button className="button" onClick={onClose}>關閉</button></div>
      <div className="silhouettePanel">
        <img src={partnerImageUrl(day.dayNo)} alt={`Day${day.dayNo} 小可愛剪影`} />
        <strong>?</strong>
        <p>小可愛等待照片能量喚醒</p>
        <div className="photoGoal">
          <div className="photoGoalTop"><span>任務目標</span><b>{photos.length}/{target}</b></div>
          <div className="progress"><div className="bar" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>
      <label className={`uploadCta${uploading ? " disabled" : ""}`}>
        <input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length) onUpload(day.id, uploadItem, files); event.target.value = ""; }} />
        <span className="uploadCtaIcon">{mark("album")}</span>
        <span><b>{uploading ? "照片上傳中..." : "選擇照片上傳"}</b><small>會自動存進 Day{day.dayNo} 相簿</small></span>
      </label>
      {uploadStatus && <p className={`status ${uploadStatus.startsWith("失敗") ? "error" : ""}`}>{uploadStatus}</p>}
      <div className="photos">{sortPhotosNewestFirst(photos).map((photo) => <figure className="photoFigure" key={photo.id}><img src={photo.url} alt={photo.name} /></figure>)}</div>
    </div>
  </div>;
}

function uploadTestMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("uploadTest") === "1";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function UploadSpeedTest({ token }) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const cleanupTimers = useMemo(() => new Map(), []);

  function scheduleTestCleanup(path) {
    if (!path || cleanupTimers.has(path)) return;
    const timer = window.setTimeout(async () => {
      cleanupTimers.delete(path);
      try {
        await deleteFileFromGitHub(path, token);
        setResults((prev) => prev.map((row) => row.path === path ? { ...row, deleted: true } : row));
      } catch (error) {
        setResults((prev) => prev.map((row) => row.path === path ? { ...row, cleanupError: error instanceof Error ? error.message : String(error) } : row));
      }
    }, UPLOAD_TEST_DELETE_DELAY_MS);
    cleanupTimers.set(path, timer);
  }

  useEffect(() => () => {
    cleanupTimers.forEach((timer) => window.clearTimeout(timer));
    cleanupTimers.clear();
  }, [cleanupTimers]);

  async function runTest(files) {
    if (!files.length) return;
    setTesting(true);
    setResults([]);
    setMessage("測試中：會暫存到 photos/_upload-test/，不會進入正式相簿；上傳完成後保留 10 分鐘再自動刪除。");
    try {
      await testGitHubApiAccess(token);
      const rows = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const compressStart = performance.now();
        const uploadFile = await compressPhotoForUpload(file);
        const compressMs = Math.round(performance.now() - compressStart);
        const path = uploadSpeedTestPath(uploadFile, index);
        const uploadStart = performance.now();
        await uploadFileToGitHub(path, uploadFile, token);
        const uploadMs = Math.round(performance.now() - uploadStart);
        const url = photoUrlFromGitHubPath(path);
        rows.push({
          name: file.name,
          originalSize: file.size,
          uploadSize: uploadFile.size,
          compressMs,
          uploadMs,
          path,
          url,
          deleted: false,
          cleanupError: "",
        });
        setResults([...rows]);
        scheduleTestCleanup(path);
      }
      setMessage("測試完成。測試照片會保留 10 分鐘讓你檢查畫質，之後自動刪除；正式相簿沒有被寫入。");
    } catch (error) {
      setMessage(`測試失敗：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTesting(false);
    }
  }

  return <section className="uploadTest card section">
    <div>
      <h2>相片上傳速度測試</h2>
      <p className="small muted">只測試 GitHub API 上傳速度，不寫入 photos/index.json；測試照片保留 10 分鐘後自動刪除。</p>
    </div>
    <label className={`uploadCta${testing ? " disabled" : ""}`}>
      <input type="file" accept="image/*" multiple disabled={testing || !token} onChange={(event) => { const files = Array.from(event.target.files || []); runTest(files); event.target.value = ""; }} />
      <span className="uploadCtaIcon">{mark("album")}</span>
        <span><b>{token ? (testing ? "測試上傳中..." : "選擇照片測試") : "請先到最下方儲存 GitHub PAT"}</b><small>可查看壓縮後畫質，10 分鐘後刪除</small></span>
    </label>
    {message && <p className={`status ${message.startsWith("測試失敗") ? "error" : ""}`}>{message}</p>}
    {results.length > 0 && <div className="uploadTestResults">
      {results.map((row) => <div className="uploadTestRow" key={row.path}>
        <img src={row.url} alt={row.name} />
        <div>
          <b>{row.name}</b>
          <span>原始 {formatBytes(row.originalSize)} → 上傳 {formatBytes(row.uploadSize)}</span>
          <span>壓縮 {row.compressMs}ms｜上傳 {row.uploadMs}ms</span>
          <span>{row.deleted ? "暫存檔已刪除" : "暫存檔保留 10 分鐘"}{row.cleanupError ? `｜刪除失敗：${row.cleanupError}` : ""}</span>
        </div>
      </div>)}
    </div>}
  </section>;
}

function DetailModal({ item, day, onClose }) {
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modalTop"><div><p className="small muted">{day.date}｜{item.time}</p><h2>{item.title}</h2></div><button className="button" onClick={onClose}>關閉</button></div>
      <RichDetailRows item={item} day={day} />
    </div>
  </div>;
}

function FortuneModal({ day, onClose }) {
  const fortune = buildFortune(day);
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" style={{ backgroundImage: `url(${DEFAULT_FORTUNE_BG[day.id]})`, backgroundSize: "cover" }} onMouseDown={(event) => event.stopPropagation()}>
      <div className="fortuneMascot"><img src={partnerImageUrl(day.dayNo)} alt={`Day${day.dayNo} 小可愛`} /><h2>{fortune.title}</h2><p>{fortune.target}</p></div>
      <Info label="籤文" value={fortune.main} />
      <button className="button primary" style={{ width: "100%", marginTop: 14 }} onClick={onClose}>收下大吉簽</button>
    </div>
  </div>;
}

function getDefaultExpanded() {
  const todayId = defaultExpandedDayId();
  return Object.fromEntries(DAYS.map((day) => [day.id, day.id === todayId]));
}

export default function App() {
  const [expanded, setExpanded] = useState(getDefaultExpanded);
  const [activeDay, setActiveDay] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [photoToolDay, setPhotoToolDay] = useState(null);
  const [fortuneDay, setFortuneDay] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || "");
  const [photosByDay, setPhotosByDay] = useState(() => loadObjectFromStorage(STORAGE_KEYS.photosByDay, emptyPhotosByDay()));
  const [albumLoading, setAlbumLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotos, setDeletingPhotos] = useState(false);
  const [movingPhotos, setMovingPhotos] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [syncError, setSyncError] = useState("");
  const [viewMode, setViewMode] = useState("itinerary");
  const [tokenSettingsOpen, setTokenSettingsOpen] = useState(() => !localStorage.getItem(STORAGE_KEYS.token));
  const showUploadTest = uploadTestMode();

  const unlocked = useMemo(() => DAYS.filter((day) => dayFortuneUnlocked(day.id, (photosByDay[day.id] || []).length)).length, [photosByDay]);

  function saveToken(value) {
    setTokenState(value);
    localStorage.setItem(STORAGE_KEYS.token, value);
    setTokenSettingsOpen(false);
    setSyncError("");
  }

  function clearToken() {
    setTokenState("");
    localStorage.removeItem(STORAGE_KEYS.token);
    setTokenSettingsOpen(true);
  }

  async function refreshGitHubAlbum() {
    setAlbumLoading(true);
    setSyncError("");
    try {
      const synced = await fetchSyncedAlbum(token);
      setPhotosByDay(synced.photosByDay);
      saveToStorage(STORAGE_KEYS.photosByDay, synced.photosByDay);
      localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
      return synced.photosByDay;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setSyncError(token ? msg : "");
      if (token && isTokenError(error)) setTokenSettingsOpen(true);
      return null;
    } finally {
      setAlbumLoading(false);
    }
  }

  useEffect(() => { refreshGitHubAlbum(); }, []);
  useEffect(() => {
    if (viewMode === "album") refreshGitHubAlbum();
  }, [viewMode]);

  async function deleteAlbumPhotos(photos) {
    if (!photos.length) return;
    setDeletingPhotos(true);
    setSyncError("");
    try {
      await testGitHubApiAccess(token);
      await deletePhotosFromGitHub(photos, token);
      await refreshGitHubAlbum();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setSyncError(msg);
      if (isTokenError(error)) setTokenSettingsOpen(true);
      window.alert(`刪除照片失敗：${msg}`);
    } finally {
      setDeletingPhotos(false);
    }
  }

  async function moveAlbumPhotos(photos, targetDayId) {
    if (!photos.length) return;
    setMovingPhotos(true);
    setSyncError("");
    try {
      await testGitHubApiAccess(token);
      const movedPhotos = await movePhotosInGitHub(photos, targetDayId, token);
      const oldPaths = photos.map((photo) => photo.githubPath).filter(Boolean);
      const withoutMoved = photosWithoutPaths(photosByDay, oldPaths);
      const optimistic = mergePhotosById(withoutMoved, { ...emptyPhotosByDay(), [targetDayId]: movedPhotos });
      setPhotosByDay(optimistic);
      saveToStorage(STORAGE_KEYS.photosByDay, optimistic);

      let remote = await readManifest(token);
      const remoteWithoutMoved = photosWithoutPaths(remote.photosByDay, oldPaths);
      let merged = mergePhotosById(remoteWithoutMoved, optimistic);
      try {
        await writeManifest(merged, token, remote.sha);
      } catch (error) {
        if (error.status !== 409 && error.status !== 422) throw error;
        remote = await readManifest(token);
        merged = mergePhotosById(photosWithoutPaths(remote.photosByDay, oldPaths), merged);
        await writeManifest(merged, token, remote.sha);
      }
      await refreshGitHubAlbum();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setSyncError(msg);
      if (isTokenError(error)) setTokenSettingsOpen(true);
      window.alert(`移動照片失敗：${msg}`);
    } finally {
      setMovingPhotos(false);
    }
  }

  async function uploadPhotos(dayId, item, files) {
    if (!files.length) return;
    setUploading(true);
    setSyncError("");
    try {
      setUploadStatus("正在檢查 GitHub API 連線與 token 權限...");
      await testGitHubApiAccess(token);

      const uploaded = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setUploadStatus(`正在處理第 ${index + 1}/${files.length} 張照片：${file.name}`);
        const uploadFile = await compressPhotoForUpload(file);
        const path = buildGitHubPhotoPath(dayId, item, uploadFile, index);
        setUploadStatus(`正在上傳第 ${index + 1}/${files.length} 張：${file.name}\n${path}`);
        await uploadFileToGitHub(path, uploadFile, token);
        uploaded.push({ file, uploadFile, path });
      }

      const newPhotos = uploaded.map(({ file, uploadFile, path }) => ({
        id: `github-${dayId}-${path}`,
        dayId,
        itemId: item.id,
        itemTitle: item.title,
        type: item.type,
        name: uploadFile.name || file.name,
        githubPath: path,
        url: photoUrlFromGitHubPath(path),
        createdAt: createdAtFromGitHubName(path),
      }));

      const optimistic = mergePhotosById(photosByDay, { ...emptyPhotosByDay(), [dayId]: newPhotos });
      setPhotosByDay(optimistic);
      saveToStorage(STORAGE_KEYS.photosByDay, optimistic);

      setUploadStatus("正在合併並寫入 photos/index.json...");
      let remote = await readManifest(token);
      let merged = mergePhotosById(remote.photosByDay, optimistic);
      try {
        await writeManifest(merged, token, remote.sha);
      } catch (error) {
        if (error.status !== 409 && error.status !== 422) throw error;
        remote = await readManifest(token);
        merged = mergePhotosById(remote.photosByDay, merged);
        await writeManifest(merged, token, remote.sha);
      }

      setUploadStatus("完成，正在重新同步相簿...");
      const synced = await refreshGitHubAlbum();
      const finalCount = (synced?.[dayId] || merged[dayId] || []).length;
      if (dayFortuneUnlocked(dayId, finalCount)) setFortuneDay(DAYS.find((day) => day.id === dayId) || null);
      setUploadStatus(`完成：Day${DAYS.find((day) => day.id === dayId)?.dayNo} 目前 ${finalCount}/${dayPhotoTarget(dayId)} 張。`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setUploadStatus(`失敗：${msg}`);
      setSyncError(msg);
      if (isTokenError(error)) setTokenSettingsOpen(true);
    } finally {
      setUploading(false);
    }
  }

  return <div className="app">
    <MainHeader photosByDay={photosByDay} />
    <div className="toolbar">
      <button className={`tab${viewMode === "itinerary" ? " active" : ""}`} type="button" onClick={() => setViewMode("itinerary")}>行程</button>
      <button className={`tab${viewMode === "album" ? " active" : ""}`} type="button" onClick={() => setViewMode("album")}>相簿 {totalPhotoCount(photosByDay)} 張</button>
      <span className="tab">已解鎖 {unlocked}/7</span>
    </div>
    {showUploadTest && <UploadSpeedTest token={token} />}
    {viewMode === "album" ? <AlbumSection photosByDay={photosByDay} loading={albumLoading} onRefresh={refreshGitHubAlbum} onOpenPhotoTool={setPhotoToolDay} onDeletePhotos={deleteAlbumPhotos} deleting={deletingPhotos} onMovePhotos={moveAlbumPhotos} moving={movingPhotos} /> : DAYS.map((day) => <DayCard key={day.id} day={day} open={expanded[day.id]} onToggle={() => setExpanded((prev) => Object.fromEntries(DAYS.map((candidate) => [candidate.id, candidate.id === day.id ? !prev[day.id] : false])))} onItemClick={(selectedDay, item) => { setActiveDay(selectedDay); setActiveItem(item); }} photoCount={(photosByDay[day.id] || []).length} onOpenFortune={setFortuneDay} onOpenPhotoTool={setPhotoToolDay} />)}
    {syncError && <p className="status error">同步錯誤：{syncError}</p>}
    <Settings token={token} forceOpen={tokenSettingsOpen} onSaveToken={saveToken} onClearToken={clearToken} />
    {activeDay && activeItem && <DetailModal day={activeDay} item={activeItem} onClose={() => { setActiveDay(null); setActiveItem(null); }} />}
    {photoToolDay && <PhotoModal day={photoToolDay} photos={photosByDay[photoToolDay.id] || []} onUpload={uploadPhotos} uploading={uploading} uploadStatus={uploadStatus} onClose={() => setPhotoToolDay(null)} />}
    {fortuneDay && <FortuneModal day={fortuneDay} onClose={() => setFortuneDay(null)} />}
  </div>;
}
