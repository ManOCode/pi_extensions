import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_list = defineTool({
  name: "memory_list",
  label: "Memory List",
  description: "List stored memory files. Use 'path' to list a specific directory.",
  parameters: Type.Object({
    path: Type.Optional(Type.String({ description: "The directory to list (relative to memory root). Defaults to root." })),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const targetDir = params.path 
        ? path.join(MEMORY_DIR, params.path) 
        : MEMORY_DIR;
        
      const files = await fs.readdir(targetDir, { withFileTypes: true });
      
      const resultLines: string[] = [];
      for (const file of files) {
        if (file.isDirectory()) {
          resultLines.push(`[DIR] ${file.name}/`);
        } else if (file.name.endsWith(".md")) {
          resultLines.push(`[FILE] ${file.name.replace(".md", "")}`);
        }
      }

      const resultText = resultLines.length > 0 
        ? `Contents of ${params.path || "root"}:\n${resultLines.join("\n")}` 
        : `No memories found in ${params.path || "root"}.`;
        
      const result = {
        content: [{ type: "text" as const, text: resultText }],
        details: undefined,
      };
      await logToolExecution("memory_list", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: `Error listing memories in ${params.path || "root"}.` }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_list", params, result, err);
      return result;
    }
  },
});
