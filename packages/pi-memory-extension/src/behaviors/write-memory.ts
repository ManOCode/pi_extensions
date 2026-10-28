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

class SaveMemoryTool extends SessionableBaseTool {
  name = "saveMemory";
  label = "Save Memory";
  description = "Saves information to the long-term memory as a markdown file.";
  parameters = {
    type: "object",
    properties: {
      key: { type: "string", description: "A unique identifier for the memory entry (e.g., 'user_preferences')." },
      content: { type: "string", description: "The markdown content to save." },
    },
    required: ["key", "content"],
  };

  protected async run(id: string, { key, content }: { key: string; content: string }) {
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
  }
}

export const saveMemory = new SaveMemoryTool();
