import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import { ensureFilePath } from "../utils/path_utils.js";
import { updateIndex } from "../utils/index_utils.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_append = defineTool({
  name: "memory_append",
  label: "Memory Append",
  description: "Append information to the end of a markdown file in the persistent memory store. Supports directories. If the file doesn't exist, it will be created.",
  parameters: Type.Object({
    name: Type.String({ description: "The path/name of the memory file (without extension)." }),
    content: Type.String({ description: "The markdown content to append." }),
  }),
  execute: async (_, params) => {
    try {
      const filePath = await ensureFilePath(params.name);
      
      // Ensure content starts on a new line
      const contentToAppend = `\n${params.content}`;
      
      await fs.appendFile(filePath, contentToAppend, "utf8");
      
      // Auto-update the index
      await updateIndex(params.name);

      const result = {
        content: [{ type: "text" as const, text: `Appended memory to ${params.name}.md` }],
        details: undefined,
      };
      await logToolExecution("memory_append", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: `Error appending to memory file ${params.name}.md` }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_append", params, result, err);
      return result;
    }
  },
});
