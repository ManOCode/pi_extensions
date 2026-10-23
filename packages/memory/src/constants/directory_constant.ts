import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

export const MEMORY_DIR = path.join(os.homedir(), ".pi-extensions", "memory");
export const LOG_DIR = path.join(os.homedir(), ".pi-extensions", "log");

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
