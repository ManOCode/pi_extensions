import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export const PI_EXTENSIONS_ROOT = path.join(os.homedir(), ".pi-extensions");

export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
