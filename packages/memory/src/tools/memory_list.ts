import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_list = defineTool({
  name: "memory_list",
  label: "Memory List",
  description: "List all stored memory files.",
  parameters: Type.Object({}),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const files = await fs.readdir(MEMORY_DIR);
      const mdFiles = files.filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
      const resultText = mdFiles.length > 0 
        ? `Stored memories: ${mdFiles.join(", ")}` 
        : "No memories stored.";
      const result = {
        content: [{ type: "text" as const, text: resultText }],
        details: undefined,
      };
      await logToolExecution("memory_list", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: "Error listing memories." }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_list", params, result, err);
      return result;
    }
  },
});
