import path from "node:path";
import os from "node:os";

const PI_EXTENSIONS_ROOT = path.join(os.homedir(), ".pi-extensions");
export let MEMORY_DIR = path.join(PI_EXTENSIONS_ROOT, "memory");

export function setMemoryDir(dir: string) {
  MEMORY_DIR = dir;
}
