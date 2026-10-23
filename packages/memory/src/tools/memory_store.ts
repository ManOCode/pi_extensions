import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import { ensureFilePath } from "../utils/path_utils.js";
import { updateIndex } from "../utils/index_utils.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_store = defineTool({
  name: "memory_store",
  label: "Memory Store",
  description: "Save information to a markdown file in the persistent memory store. Supports directories (e.g., 'home/tasks/dog-feeding').",
  parameters: Type.Object({
    name: Type.String({ description: "The path/name of the memory file (without extension)." }),
    content: Type.String({ description: "The markdown content to save." }),
  }),
  execute: async (_, params) => {
    try {
      const filePath = await ensureFilePath(params.name);
      await fs.writeFile(filePath, params.content, "utf8");
      
      // Auto-update the index
      await updateIndex(params.name);

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
