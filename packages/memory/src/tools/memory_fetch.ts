import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_fetch = defineTool({
  name: "memory_fetch",
  label: "Memory Fetch",
  description: "Retrieve information from a markdown file in the persistent memory store.",
  parameters: Type.Object({
    name: Type.String({ description: "The name of the memory file (without extension)." }),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const filePath = path.join(MEMORY_DIR, `${params.name}.md`);
      const content = await fs.readFile(filePath, "utf8");
      const result = {
        content: [{ type: "text" as const, text: content }],
        details: undefined,
      };
      await logToolExecution("memory_fetch", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: `Memory file ${params.name}.md not found.` }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_fetch", params, result, err);
      return result;
    }
  },
});
