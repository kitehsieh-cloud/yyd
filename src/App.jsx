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

const PHOTO_TARGETS = { "0515": 10, "0516": 30, "0517": 30, "0518": 30, "0519": 30, "0520": 30, "0521": 10 };
const DEFAULT_PHOTO_TARGET = 30;
const ASSET_BASE_URL = "https://raw.githubusercontent.com/kitehsieh-cloud/yyd/refs/heads/main";
const DEFAULT_COMMON_HEADER_BG = `${ASSET_BASE_URL}/Title.png`;
const PHOTO_ICON_URL = `${ASSET_BASE_URL}/photo.png`;
const OMAMORI_ICON_URL = `${ASSET_BASE_URL}/ess.png`;
const GITHUB_OWNER = "kitehsieh-cloud";
const GITHUB_REPO = "yyd";
const GITHUB_BRANCH = "main";
const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
const ALBUM_MANIFEST_PATH = "photos/index.json";
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
  0: { left: 50, top: 65, width: 26, label: "古本" },
  1: { left: 80, top: 74, width: 22, label: "小桃" },
  2: { left: 36, top: 82, width: 19, label: "吉依卡哇" },
  3: { left: 17, top: 67, width: 22, label: "大強" },
  4: { left: 50, top: 45, width: 24, label: "兔兔" },
  5: { left: 65, top: 82, width: 21, label: "小八" },
  6: { left: 70, top: 47, width: 18, label: "風獅爺" },
  7: { left: 31, top: 51, width: 19, label: "栗子饅頭" },
};

const DEFAULT_DAY_BG = Object.fromEntries(Object.keys(TABS).map((id, index) => [id, `${ASSET_BASE_URL}/D${index + 1}.png`]));
const DEFAULT_FORTUNE_BG = Object.fromEntries(Object.keys(TABS).map((id) => [id, `${ASSET_BASE_URL}/7BG.png`]));

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
      { id: "0515-r1", time: "17:40-19:30", type: "restaurant", title: "晚餐：牛炸豬排Motomura", stay: "110 分", detail: restaurant("常見 11:00-22:00", "牛かつ定食、麥飯、山藥泥、明太子搭配。", "約 ¥1,800-3,000／人", "90-120 分") },
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
      { id: "0516-a3", time: "10:30-12:00", type: "attraction", title: "東京晴空塔／東京ソラマチ", stay: "90 分", detail: attraction("多數商店 10:00-21:00", "不登塔則逛商場與拍外觀；登塔需額外時間。", "商場免費；展望台另計") },
      { id: "0516-r1", time: "12:45-14:15", type: "restaurant", title: "午餐：迴轉壽司 根室花丸", stay: "90 分", detail: restaurant("常見 11:00-22:00，可能需取號", "花咲蟹、炙燒系列、季節魚、湯品。", "約 ¥2,500-4,500／人") },
      { id: "0516-a4", time: "14:15-16:00", type: "attraction", title: "東京動漫人物街／東京車站一番街", stay: "105 分", detail: attraction("常見 10:00-20:30", "動漫、角色商品與伴手禮。本日時間壓力大，可刪減。", "免費，購物另計") },
      { id: "0516-r2", time: "18:30-20:30", type: "restaurant", title: "晚餐：萬喜-串燒居酒屋", stay: "120 分", detail: restaurant("晚間營業，以預約為準", "串燒、雞肉料理、小菜與飲料。", "約 ¥3,000-5,000／人") },
      { id: "0516-k1", time: "20:40-22:40", type: "restaurant", title: "KTV：Karaoke Big Echo Nakano Dori", stay: "120 分", detail: restaurant("夜間營業與方案依店鋪公告", "包廂唱歌、飲料方案。注意最短使用時間、延長費與末班車。", "約 ¥1,500-4,000／人") },
    ],
  },
  {
    id: "0517", dayNo: 3, date: "05/17", weekday: "日", title: "池袋‧澀谷", level: 2,
    meals: { lunch: "Denny's 親子餐廳／或原宿周邊", dinner: "[19:00] THE SLICE 和牛壽喜燒" },
    note: "上午分成自由團與吉伊卡哇團；[10:30] 吉伊卡哇樂園有定位，必須優先滿足。",
    items: [
      { id: "0517-a1", time: "10:30-12:00", type: "attraction", title: "吉伊卡哇團：[10:30] 吉伊卡哇樂園10:30", stay: "90 分", detail: attraction("依整理券／入場時間", "10:30 定位優先，不可壓縮。", "免費入店，購物另計") },
      { id: "0517-a2", time: "14:00-15:30", type: "attraction", title: "原宿／竹下通／表參道周邊", stay: "90 分", detail: attraction("多數店 10:00/11:00-19:00/20:00", "逛街、甜點、服飾與拍照。", "免費，購物另計") },
      { id: "0517-r2", time: "19:00-21:00", type: "restaurant", title: "晚餐：[19:00] THE SLICE 和牛壽喜燒 日式和牛火鍋", stay: "120 分", detail: restaurant("19:00 定位優先", "和牛壽喜燒、日式和牛火鍋套餐。", "約 ¥4,000-8,000／人以上") },
    ],
  },
  {
    id: "0518", dayNo: 4, date: "05/18", weekday: "一", title: "鎌倉‧湘南", level: 3,
    meals: { lunch: "鎌倉小町通", dinner: "江之島／藤澤，或回東京後吃" },
    note: "鎌倉取捨：大佛與長谷寺都深逛會壓縮海邊與江之島，建議擇一深逛。",
    items: [
      { id: "0518-a1", time: "09:00-10:30", type: "attraction", title: "鎌倉小町通／鶴岡八幡宮方向", stay: "90 分", detail: attraction("小町通店家多約 10:00 前後開", "上午走鎌倉站周邊最順。", "多數免費，購物另計") },
      { id: "0518-a2", time: "13:00-14:00", type: "attraction", title: "鎌倉大佛殿高德院", stay: "60 分", detail: attraction("約 8:00-17:30", "鎌倉代表景點。", "成人約 ¥300") },
      { id: "0518-a3", time: "14:00-15:00", type: "attraction", title: "長谷寺", stay: "60 分", detail: attraction("約 8:00-17:30", "庭園、觀音堂、海景平台。", "成人約 ¥400") },
      { id: "0518-a5", time: "17:45-18:45", type: "attraction", title: "江之島傍晚散策", stay: "60 分", detail: attraction("戶外可散步；設施另有時間", "傍晚收尾；完整上島需 2-3 小時。", "上島免費；設施另購") },
    ],
  },
  {
    id: "0519", dayNo: 5, date: "05/19", weekday: "二", title: "橫濱", level: 1,
    meals: { lunch: "橫濱中華街", dinner: "橫濱港區／中華街" },
    note: "橫濱預設步行＋IC 卡；雨天或腳累再考慮 Minato Burari Ticket Wide。",
    items: [
      { id: "0519-a0", time: "10:00-11:00", type: "attraction", title: "港見丘公園／山下公園散步", stay: "60 分", detail: attraction("戶外開放", "港區公園、海邊步道與拍照。", "免費") },
      { id: "0519-r1", time: "11:30-13:00", type: "restaurant", title: "午餐：橫濱中華街", stay: "90 分", detail: restaurant("多數餐廳約 11:00 起", "小籠包、燒賣、炒飯、擔擔麵、吃到飽或單點。", "約 ¥1,500-4,500／人") },
      { id: "0519-a2", time: "13:30-15:00", type: "attraction", title: "橫濱紅磚倉庫1號館", stay: "90 分", detail: attraction("多數店約 10:00/11:00-20:00", "購物、甜點、拍照與港區散步。", "免費入館，購物另計") },
      { id: "0519-a3", time: "15:00-17:30", type: "attraction", title: "橫濱 COSMOWORLD／港未來自由活動", stay: "150 分", detail: attraction("依日期，可能休園或天候調整", "摩天輪、遊樂設施與夜景區。", "入園免費；設施券另計") },
    ],
  },
  {
    id: "0520", dayNo: 6, date: "05/20", weekday: "三", title: "迪士尼", level: 3,
    meals: { lunch: "迪士尼園區內；芷馨為成田機場／機上", dinner: "迪士尼園區內；芷馨回台後自行安排" },
    splitNote: "芷馨不會與大家一起去迪士尼。這天直接分成迪士尼組與芷馨回程組。",
    note: "芷馨直接去成田最穩；迪士尼組需早到並先處理 App 與熱門設施。",
    items: [
      { id: "0520-a1", time: "09:00-21:00", type: "attraction", title: "東京迪士尼樂園", stay: "全天", detail: attraction("官方日曆顯示約 9:00-21:00", "先處理 App、熱門設施、Premier Access、Priority Pass、Mobile Order。", "成人票價依日期變動") },
      { id: "0520-r1", time: "12:00-13:00", type: "restaurant", title: "午餐：迪士尼園區內", stay: "60 分", detail: restaurant("依園區餐廳", "建議避開 12:00 尖峰或使用 Mobile Order。", "約 ¥1,500-3,500／人") },
    ],
  },
  {
    id: "0521", dayNo: 7, date: "05/21", weekday: "四", title: "回台當社畜", level: 3,
    meals: { lunch: "11:30 牛舌檸檬 新宿", dinner: "成田機場／機上" },
    note: "返程停損：牛舌檸檬若 11:30 未入店就改機場午餐，避免影響航班。",
    items: [
      { id: "0521-a1", time: "09:30-10:30", type: "attraction", title: "唐吉訶德 新大久保／新宿最後採買", stay: "60 分", detail: attraction("多數店長時間營業", "最後採買，注意托運限制。", "免費入店，購物另計") },
      { id: "0521-r1", time: "11:30-12:20", type: "restaurant", title: "午餐：[11:30] 牛舌檸檬 新宿", stay: "50 分", detail: restaurant("11:30 定位優先", "厚切牛舌、牛舌定食、檸檬風味搭配。", "約 ¥2,000-4,500／人") },
      { id: "0521-f1", time: "16:50-20:35", type: "flight", title: "團二／團一 成田 → 桃園", stay: "依航班", detail: { summary: "團二 16:50-19:40；團一 17:55-20:35。" } },
    ],
  },
];

const ICON = { attraction: "📍", restaurant: "🍽️", transfer: "🚃", hotel: "🏨", flight: "✈️", airport: "🛄", album: "🖼️", route: "🧭", fortune: "🌟" };

function emptyPhotosByDay() { return Object.fromEntries(DAYS.map((day) => [day.id, []])); }
function dayPhotoTarget(dayId) { return PHOTO_TARGETS[dayId] || DEFAULT_PHOTO_TARGET; }
function dayFortuneUnlocked(dayId, count) { return count >= dayPhotoTarget(dayId); }
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
function photosToManifestList(photosByDay) {
  return DAYS.flatMap((day) => (photosByDay?.[day.id] || []).map((photo) => ({
    id: photo.id, dayId: day.id, itemId: photo.itemId, itemTitle: photo.itemTitle, type: photo.type, name: photo.name, githubPath: photo.githubPath, createdAt: photo.createdAt,
  }))).filter((photo) => photo.githubPath);
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
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Cache-Control": "no-cache", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
async function githubFetch(url, token, options = {}) {
  let response;
  try {
    response = await fetch(url, { cache: "no-store", ...options, headers: githubHeaders(token, options.headers || {}) });
  } catch (error) {
    throw new Error(`無法連線到 GitHub API：${error instanceof Error ? error.message : String(error)}`);
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
  const merged = mergePhotosById(manifest.photosByDay, tree);
  return { photosByDay: merged, manifestSha: manifest.sha };
}

function DetailRows({ item }) {
  const d = item.detail || {};
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
function typeLabel(type) { return { attraction: "景點", restaurant: "餐廳", transfer: "移動", hotel: "住宿", flight: "航班", airport: "機場" }[type] || type; }
function mark(type) { return <span className="icon">{ICON[type] || "•"}</span>; }
function buildFortune(day) {
  const next = DAYS[DAYS.findIndex((item) => item.id === day.id) + 1];
  return {
    title: { "0515": "出發大吉", "0516": "購物不手軟大吉", "0517": "腿力尚存大吉", "0518": "海風吹到剛好大吉", "0519": "排隊變短大吉", "0520": "行李沒爆大吉", "0521": "社畜復歸大吉" }[day.id] || "大吉",
    target: next ? TABS[next.id] : "旅程結束",
    main: next ? `明日是「${TABS[next.id]}」，願排隊縮短、轉乘順利、照片都剛好對焦。` : "旅程圓滿收尾，願照片都變成故事，帳單晚點再想。",
  };
}

function MainHeader({ photosByDay }) {
  const unlocked = DAYS.filter((day) => dayFortuneUnlocked(day.id, (photosByDay[day.id] || []).length)).map((day) => day.dayNo);
  return <header className="hero card">
    <div style={{ position: "relative" }}>
      <img src={DEFAULT_COMMON_HEADER_BG} alt="2026 東京自由行" />
      {[0, ...unlocked].map((dayNo) => {
        const pos = HEADER_COMPANION_LAYOUT[dayNo];
        return pos ? <img key={dayNo} src={partnerImageUrl(dayNo)} alt={pos.label} style={{ position: "absolute", left: `${pos.left}%`, top: `${pos.top}%`, width: `${pos.width}%`, transform: "translate(-50%, -50%)", filter: "drop-shadow(0 12px 18px #0004)" }} /> : null;
      })}
    </div>
  </header>;
}

function Settings({ token, setToken }) {
  return <section className="card section">
    <h2>GitHub 相簿同步設定</h2>
    <p className="small muted">請填入只具備此 repo Contents 讀寫權限的 Fine-grained PAT。Token 只存在你的瀏覽器，不會被 commit 到 GitHub Pages 程式碼。</p>
    <label className="field">
      <span className="small">GitHub PAT</span>
      <input type="password" value={token} onChange={(event) => setToken(event.target.value.trim())} placeholder="github_pat_..." />
    </label>
  </section>;
}

function DayCard({ day, open, onToggle, onItemClick, photoCount, onOpenFortune, onOpenPhotoTool }) {
  const unlocked = dayFortuneUnlocked(day.id, photoCount);
  return <section className="day card">
    <div className="dayHero" style={{ backgroundImage: `url(${DEFAULT_DAY_BG[day.id]})` }}>
      <div className="dayBadge">Day.{day.dayNo}<br />{day.date}({day.weekday})</div>
      <button className="photoButton" type="button" onClick={() => unlocked ? onOpenFortune(day) : onOpenPhotoTool(day)} title={unlocked ? "查看大吉籤" : "上傳照片"}>
        <img src={unlocked ? OMAMORI_ICON_URL : PHOTO_ICON_URL} alt={unlocked ? "御守" : "相機"} />
      </button>
      <button className="dayToggle" type="button" onClick={onToggle}>{open ? "▲收合詳細行程▲" : `▼${day.title}▼`}</button>
    </div>
    {open && <div className="dayBody">
      <div className="note"><b>行程摘要</b><br />{day.note}</div>
      {(day.joinNote || day.splitNote) && <p className="note">{day.joinNote || day.splitNote}</p>}
      {day.items.map((item) => <button key={item.id} type="button" className="item" onClick={() => onItemClick(day, item)}>
        <b>{item.time}</b>{mark(item.type)}<span><b>{item.title}</b><br /><span className="small muted">{typeLabel(item.type)}｜{item.stay}</span></span>
      </button>)}
    </div>}
  </section>;
}

function AlbumSection({ photosByDay, loading, onRefresh }) {
  const total = totalPhotoCount(photosByDay);
  return <section className="card section">
    <div className="modalTop">
      <div><h2>{mark("album")} 旅程相簿總集</h2><p className="small muted">跨裝置資料來源：GitHub `photos/index.json`。</p></div>
      <button className="button primary" type="button" onClick={onRefresh} disabled={loading}>{loading ? "同步中..." : "同步 GitHub 相簿"}</button>
    </div>
    <p><b>總照片：</b>{total} 張</p>
    <div className="grid seven">
      {DAYS.map((day) => {
        const photos = photosByDay[day.id] || [];
        const target = dayPhotoTarget(day.id);
        return <div className="info" key={day.id}>
          <b>Day{day.dayNo}</b><div className="small muted">{TABS[day.id]}</div>
          <div className="progress"><div className="bar" style={{ width: `${Math.min(100, Math.round((photos.length / target) * 100))}%` }} /></div>
          <div className="small">{photos.length}/{target}{photos.length >= target ? " 大吉簽" : ""}</div>
          <div className="thumbs">{sortPhotosNewestFirst(photos).slice(0, 6).map((photo) => <div className="thumb" key={photo.id}><img src={photo.url} alt={photo.name} /></div>)}</div>
        </div>;
      })}
    </div>
  </section>;
}

function PhotoModal({ day, photos, onUpload, onClose, uploading, uploadStatus }) {
  const [itemId, setItemId] = useState(day.items[0]?.id || "");
  const item = day.items.find((candidate) => candidate.id === itemId) || day.items[0];
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modalTop"><div><h2>Day{day.dayNo}｜照片蒐集</h2><p className="small muted">{photos.length}/{dayPhotoTarget(day.id)} 張</p></div><button className="button" onClick={onClose}>關閉</button></div>
      <div className="grid two">
        <label className="field"><span>選擇行程點</span><select value={item?.id || ""} onChange={(event) => setItemId(event.target.value)}>{day.items.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.time}｜{candidate.title}</option>)}</select></label>
        <label className="field"><span>上傳照片</span><input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { const files = Array.from(event.target.files || []); if (item && files.length) onUpload(day.id, item, files); event.target.value = ""; }} /></label>
      </div>
      {uploadStatus && <p className={`status ${uploadStatus.startsWith("失敗") ? "error" : ""}`}>{uploadStatus}</p>}
      <div className="photos">{sortPhotosNewestFirst(photos).map((photo) => <figure className="photoFigure" key={photo.id}><img src={photo.url} alt={photo.name} /><figcaption><b>{photo.itemTitle}</b><br />{photo.name}</figcaption></figure>)}</div>
    </div>
  </div>;
}

function DetailModal({ item, day, onClose }) {
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modalTop"><div><p className="small muted">{day.date}｜{item.time}</p><h2>{item.title}</h2></div><button className="button" onClick={onClose}>關閉</button></div>
      <DetailRows item={item} />
    </div>
  </div>;
}

function FortuneModal({ day, onClose }) {
  const fortune = buildFortune(day);
  return <div className="modal" onMouseDown={onClose}>
    <div className="modalCard card" style={{ backgroundImage: `url(${DEFAULT_FORTUNE_BG[day.id]})`, backgroundSize: "cover" }} onMouseDown={(event) => event.stopPropagation()}>
      <div style={{ textAlign: "center" }}><img src={partnerImageUrl(day.dayNo)} alt="" style={{ width: 150 }} /><h2>{fortune.title}</h2><p>{fortune.target}</p></div>
      <Info label="籤文" value={fortune.main} />
      <button className="button primary" style={{ width: "100%", marginTop: 14 }} onClick={onClose}>收下大吉簽</button>
    </div>
  </div>;
}

function getDefaultExpanded() {
  return Object.fromEntries(DAYS.map((day, index) => [day.id, index === 0]));
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
  const [uploadStatus, setUploadStatus] = useState("");
  const [syncError, setSyncError] = useState("");
  const [showAlbum, setShowAlbum] = useState(false);

  const unlocked = useMemo(() => DAYS.filter((day) => dayFortuneUnlocked(day.id, (photosByDay[day.id] || []).length)).length, [photosByDay]);

  function setToken(value) {
    setTokenState(value);
    localStorage.setItem(STORAGE_KEYS.token, value);
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
      return null;
    } finally {
      setAlbumLoading(false);
    }
  }

  useEffect(() => { refreshGitHubAlbum(); }, []);

  async function uploadPhotos(dayId, item, files) {
    if (!files.length) return;
    setUploading(true);
    setSyncError("");
    try {
      const uploaded = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const path = buildGitHubPhotoPath(dayId, item, file, index);
        setUploadStatus(`正在上傳第 ${index + 1}/${files.length} 張：${file.name}\n${path}`);
        await uploadFileToGitHub(path, file, token);
        uploaded.push({ file, path });
      }

      const newPhotos = uploaded.map(({ file, path }) => ({
        id: `github-${dayId}-${path}`,
        dayId,
        itemId: item.id,
        itemTitle: item.title,
        type: item.type,
        name: file.name,
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
    } finally {
      setUploading(false);
    }
  }

  return <div className="app">
    <MainHeader photosByDay={photosByDay} />
    <Settings token={token} setToken={setToken} />
    {syncError && <p className="status error">同步錯誤：{syncError}</p>}
    <div className="toolbar">
      <button className="tab active" type="button">行程</button>
      <button className="tab" type="button" onClick={() => { setShowAlbum((value) => !value); refreshGitHubAlbum(); }}>相簿 {totalPhotoCount(photosByDay)} 張</button>
      <span className="tab">已解鎖 {unlocked}/7</span>
    </div>
    {showAlbum && <AlbumSection photosByDay={photosByDay} loading={albumLoading} onRefresh={refreshGitHubAlbum} />}
    {DAYS.map((day) => <DayCard key={day.id} day={day} open={expanded[day.id]} onToggle={() => setExpanded((prev) => ({ ...prev, [day.id]: !prev[day.id] }))} onItemClick={(selectedDay, item) => { setActiveDay(selectedDay); setActiveItem(item); }} photoCount={(photosByDay[day.id] || []).length} onOpenFortune={setFortuneDay} onOpenPhotoTool={setPhotoToolDay} />)}
    {activeDay && activeItem && <DetailModal day={activeDay} item={activeItem} onClose={() => { setActiveDay(null); setActiveItem(null); }} />}
    {photoToolDay && <PhotoModal day={photoToolDay} photos={photosByDay[photoToolDay.id] || []} onUpload={uploadPhotos} uploading={uploading} uploadStatus={uploadStatus} onClose={() => setPhotoToolDay(null)} />}
    {fortuneDay && <FortuneModal day={fortuneDay} onClose={() => setFortuneDay(null)} />}
  </div>;
}
