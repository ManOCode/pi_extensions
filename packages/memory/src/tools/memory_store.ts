import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_store = defineTool({
  name: "memory_store",
  label: "Memory Store",
  description: "Save information to a markdown file in the persistent memory store.",
  parameters: Type.Object({
    name: Type.String({ description: "The name of the memory file (without extension)." }),
    content: Type.String({ description: "The markdown content to save." }),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const filePath = path.join(MEMORY_DIR, `${params.name}.md`);
      await fs.writeFile(filePath, params.content, "utf8");
      const result = {
        content: [{ type: "text" as const, text: `Saved memory to ${params.name}.md` }],
        details: undefined,
      };
      await logToolExecution("memory_store", params, result);
      return result;
    } catch (error) {
      await logToolExecution("memory_store", params, null, error);
      throw error;
    }
  },
});
