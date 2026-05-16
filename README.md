# 2026 東京自由行互動導覽

Vite + React 版互動行程頁，部署目標為 GitHub Pages：

https://kitehsieh-cloud.github.io/yyd/

## 本機開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

## GitHub Pages 部署

`.github/workflows/deploy.yml` 會在 `main` 分支 push 後自動建置並部署 `dist/`。

請在 GitHub repo 的 Pages 設定中選擇 **GitHub Actions** 作為部署來源。

## 相簿同步

- 照片上傳到 `photos/day1` 到 `photos/day7`。
- `photos/index.json` 是跨裝置同步索引。
- 頁面會讀取 `photos/index.json`，並掃描 repo tree 中 `photos/day1` 到 `photos/day7` 的圖片，合併後顯示相簿、照片數與小可愛解鎖狀態。
- 上傳照片需要在頁面輸入具備此 repo Contents 讀寫權限的 GitHub Fine-grained PAT。Token 只存在瀏覽器 `localStorage`，不會被提交到 repo。
