import { PI_EXTENSIONS_ROOT } from "@manocode/pi-extension-core";
import path from "node:path";

export let MEMORY_DIR = path.join(PI_EXTENSIONS_ROOT, "memory");

export function setMemoryDir(dir: string) {
  MEMORY_DIR = dir;
}
