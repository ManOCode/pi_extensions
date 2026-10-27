import { PI_EXTENSIONS_ROOT } from "@manocode/pi-extension-core";
import { getLogger } from "./log-manager";
import { SessionableBaseTool } from "@manocode/pi-extension-session";
import { MEMORY_DIR } from "../config";
import fs from "node:fs/promises";
import path from "node:path";

const logger = getLogger();

async function ensureMemoryDir() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (error) {
    logger.error("Failed to create memory directory", { MEMORY_DIR }, error as Error);
    throw error;
  }
}

export class GetMemoryTool extends SessionableBaseTool {
  name = "getMemory";
  label = "Get Memory";
  description = "Retrieves information from the long-term memory by its key.";
  parameters = {
    type: "object",
    properties: {
      key: { type: "string", description: "The unique identifier of the memory entry to retrieve." },
    },
    required: ["key"],
  };

  protected async run(id: string, { key }: { key: string }) {
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
  }
}

export class ListMemoryTool extends SessionableBaseTool {
  name = "listMemory";
  label = "List Memory";
  description = "Lists all available memory keys.";
  parameters = {
    type: "object",
    properties: {},
  };

  protected async run(id: string, args: any) {
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
  }
}