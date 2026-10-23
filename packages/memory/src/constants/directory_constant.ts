import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

export const ROOT_DIR = path.join(os.homedir(), ".pi-extensions");
export const MEMORY_DIR = path.join(ROOT_DIR, "memory");
export const LOG_DIR = path.join(ROOT_DIR, "log");

export async function ensureMemoryDir() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create memory directory:", err);
  }
}

export async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create log directory:", err);
  }
}
