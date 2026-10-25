import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getLogger } from "@manocode/pi-extension-logger";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const ROOT_DIR = path.join(os.homedir(), ".pi-extensions");
let MEMORY_DIR = path.join(ROOT_DIR, "memory");

export function setMemoryDir(dir: string) {
  MEMORY_DIR = dir;
}

const logger = getLogger({
  logFile: path.join(ROOT_DIR, "logs", "memory.log"),
});


async function ensureMemoryDir() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (error) {
    logger.error("Failed to create memory directory", { MEMORY_DIR }, error as Error);
    throw error;
  }
}

export const saveMemory = {
  name: "saveMemory",
  label: "Save Memory",
  description: "Saves information to the long-term memory as a markdown file.",
  parameters: {
    type: "object",
    properties: {
      key: { type: "string", description: "A unique identifier for the memory entry (e.g., 'user_preferences')." },
      content: { type: "string", description: "The markdown content to save." },
    },
    required: ["key", "content"],
  },
  execute: async (id: string, { key, content }: { key: string; content: string }) => {
    logger.info("Saving memory", { key });
    try {
      await ensureMemoryDir();
      const filePath = path.join(MEMORY_DIR, `${key}.md`);
      await fs.writeFile(filePath, content, "utf8");
      logger.debug("Memory saved successfully", { filePath });
      return { content: [{ type: "text" as const, text: `Memory saved successfully under key: ${key}` }], details: {} };
    } catch (error) {
      logger.error("Error saving memory", { key }, error as Error);
      throw new Error(`Failed to save memory: ${error}`);
    }
  },
};

export const getMemory = {
  name: "getMemory",
  label: "Get Memory",
  description: "Retrieves information from the long-term memory by its key.",
  parameters: {
    type: "object",
    properties: {
      key: { type: "string", description: "The unique identifier of the memory entry to retrieve." },
    },
    required: ["key"],
  },
  execute: async (id: string, { key }: { key: string }) => {
    logger.info("Retrieving memory", { key });
    try {
      const filePath = path.join(MEMORY_DIR, `${key}.md`);
      const content = await fs.readFile(filePath, "utf8");
      logger.debug("Memory retrieved successfully", { key });
      return { content: [{ type: "text" as const, text: content }], details: {} };
    } catch (error: any) {
      if (error.code === "ENOENT") {
        logger.warn("Memory key not found", { key });
        return { content: [{ type: "text" as const, text: `No memory found for key: ${key}` }], details: {} };
      }
      logger.error("Error retrieving memory", { key }, error as Error);
      throw new Error(`Failed to retrieve memory: ${error}`);
    }
  },
};

export const listMemory = {
  name: "listMemory",
  label: "List Memory",
  description: "Lists all available memory keys.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (id: string) => {
    logger.info("Listing all memory keys");
    try {
      await ensureMemoryDir();
      const files = await fs.readdir(MEMORY_DIR);
      const keys = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.slice(0, -3));
      logger.debug("Listed memory keys", { keys });
      return { content: [{ type: "text" as const, text: keys.length > 0 ? `Available memory keys: ${keys.join(", ")}` : "No memories stored." }], details: {} };
    } catch (error) {
      logger.error("Error listing memory", {}, error as Error);
      throw new Error(`Failed to list memory: ${error}`);
    }
  },
};

export default function (pi: ExtensionAPI) {
  logger.info("Loading Memory Extension");
  pi.registerTool(saveMemory);
  pi.registerTool(getMemory);
  pi.registerTool(listMemory);
}
