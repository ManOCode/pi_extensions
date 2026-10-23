import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR } from "../constants/directory_constant.js";

export async function ensureFilePath(relativeName: string) {
  const filePath = path.join(MEMORY_DIR, `${relativeName}.md`);
  const dirPath = path.dirname(filePath);
  await fs.mkdir(dirPath, { recursive: true });
  return filePath;
}
