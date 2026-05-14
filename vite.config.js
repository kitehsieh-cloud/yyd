import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const rootStaticFiles = [
  "7BG.png",
  "D1.png",
  "D2.png",
  "D3.png",
  "D4.png",
  "D5.png",
  "D6.png",
  "D7.png",
  "Title.png",
  "ess.png",
  "photo.png",
  "g0.png",
  "g1.png",
  "g2.png",
  "g3.png",
  "g3-removebg-preview.png",
  "g4.png",
  "g5.png",
  "g6.png",
  "g7.png",
];

function copyIfExists(source, target) {
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, target, { recursive: true, force: true });
}

function copyTripAssets() {
  return {
    name: "copy-trip-assets",
    closeBundle() {
      const outDir = path.resolve("dist");
      fs.mkdirSync(outDir, { recursive: true });

      rootStaticFiles.forEach((fileName) => {
        copyIfExists(path.resolve(fileName), path.join(outDir, fileName));
      });

      copyIfExists(path.resolve("photos"), path.join(outDir, "photos"));
    },
  };
}

export default defineConfig({
  base: "/yyd/",
  plugins: [react(), copyTripAssets()],
});
