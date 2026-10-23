import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

async function searchDirRecursive(dir: string, query: string, results: string[]) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await searchDirRecursive(fullPath, query, results);
    } else if (file.name.endsWith(".md")) {
      const content = await fs.readFile(fullPath, "utf8");
      if (content.toLowerCase().includes(query.toLowerCase())) {
        const relativePath = path.relative(MEMORY_DIR, fullPath).replace(".md", "");
        const lines = content.split("\n");
        const matchingLines = lines
          .map((line, index) => (line.toLowerCase().includes(query.toLowerCase()) ? `L${index + 1}: ${line}` : null))
          .filter((line): line is string => line !== null);
        
        results.push(`Path: ${relativePath}\n${matchingLines.join("\n")}`);
      }
    }
  }
}

export const memory_search = defineTool({
  name: "memory_search",
  label: "Memory Search",
  description: "Search for a query string recursively across all stored memories and return matching files and snippets.",
  parameters: Type.Object({
    query: Type.String({ description: "The text to search for." }),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const results: string[] = [];
      await searchDirRecursive(MEMORY_DIR, params.query, results);

      const finalResultText = results.length > 0 
        ? `Found matches in ${results.length} file(s):\n\n${results.join("\n\n---\n\n")}` 
        : "No matching memories found.";

      const result = {
        content: [{ type: "text" as const, text: finalResultText }],
        details: undefined,
      };
      await logToolExecution("memory_search", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: "Error searching memories." }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_search", params, result, err);
      return result;
    }
  },
});
