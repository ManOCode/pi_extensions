import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_append = defineTool({
  name: "memory_append",
  label: "Memory Append",
  description: "Append information to the end of a markdown file in the persistent memory store. If the file doesn't exist, it will be created.",
  parameters: Type.Object({
    name: Type.String({ description: "The name of the memory file (without extension)." }),
    content: Type.String({ description: "The markdown content to append." }),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const filePath = path.join(MEMORY_DIR, `${params.name}.md`);
      
      // Ensure content starts on a new line
      const contentToAppend = `\n${params.content}`;
      
      await fs.appendFile(filePath, contentToAppend, "utf8");
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
