import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const INPUT  = path.join(ROOT, "src/assets/images/badges.png");
const OUTPUT = path.join(ROOT, "src/assets/images/badges");

const COLS      = 5;
const ROWS      = 5;
const CELL_SIZE = 250; // 실제 셀 크기
const STRIDE    = 251; // 셀 250px + 1px 간격

fs.mkdirSync(OUTPUT, { recursive: true });

let index = 1;
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const filename = `badge_${String(index).padStart(2, "0")}.png`;
    await sharp(INPUT)
      .extract({
        left:   col * STRIDE,
        top:    row * STRIDE,
        width:  CELL_SIZE,
        height: CELL_SIZE,
      })
      .toFile(path.join(OUTPUT, filename));

    console.log(`✓ ${filename}`);
    index++;
  }
}

console.log(`\n완료: ${OUTPUT}`);
