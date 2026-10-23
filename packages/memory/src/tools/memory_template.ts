import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_template = defineTool({
  name: "memory_template",
  label: "Memory Template",
  description: "Generates or updates a markdown template based on the structure of memory files in a directory. It analyzes common headers across files to determine a standard template.",
  parameters: Type.Object({
    templatePath: Type.String({ description: "The path to the template markdown file to create or update." }),
    memoryDir: Type.Optional(Type.String({ description: "The directory containing memory markdown files. Defaults to the system memory directory." })),
  }),
  execute: async (_, params) => {
    try {
      const memoryDir = params.memoryDir || MEMORY_DIR;
      const resolvedMemoryDir = path.resolve(memoryDir);
      const files = await fs.readdir(resolvedMemoryDir);
      const mdFiles = files.filter(f => f.endsWith(".md"));

      if (mdFiles.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No markdown files found in the memory directory to generate a template from." }],
          details: undefined,
        };
      }

      const headerFrequency: Map<string, number> = new Map();

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(resolvedMemoryDir, file), "utf-8");
        const lines = content.split("\n");
        const seenHeadersInFile: Set<string> = new Set();

        for (const line of lines) {
          const match = line.match(/^(#+)\s+(.*)$/);
          if (match) {
            const header = line.trim();
            if (!seenHeadersInFile.has(header)) {
              headerFrequency.set(header, (headerFrequency.get(header) || 0) + 1);
              seenHeadersInFile.add(header);
            }
          }
        }
      }

      // Sort headers by frequency
      const sortedHeaders = Array.from(headerFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([header]) => header);

      // Determine which headers are common enough (e.g., in at least 30% of files)
      const threshold = Math.ceil(mdFiles.length * 0.3);
      const commonHeaders = sortedHeaders.filter(header => {
        return (headerFrequency.get(header) || 0) >= threshold;
      });

      if (commonHeaders.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No common headers found across memory files." }],
          details: undefined,
        };
      }

      let finalHeaders = commonHeaders;

      // If template exists, merge
      try {
        const resolvedTemplatePath = path.resolve(params.templatePath);
        const existingTemplate = await fs.readFile(resolvedTemplatePath, "utf-8");
        const existingLines = existingTemplate.split("\n");
        const existingHeaders: Set<string> = new Set();
        for (const line of existingLines) {
          if (line.startsWith("#")) {
            existingHeaders.add(line.trim());
          }
        }
        
        // Merge common headers into existing ones if they aren't there
        const merged = Array.from(existingHeaders);
        for (const h of commonHeaders) {
          if (!existingHeaders.has(h)) {
            merged.push(h);
          }
        }
        finalHeaders = merged;
      } catch (err) {
        // Template doesn't exist, use commonHeaders
      }

      const resolvedTemplatePath = path.resolve(params.templatePath);
      const templateContent = finalHeaders.join("\n") + "\n";
      await fs.mkdir(path.dirname(resolvedTemplatePath), { recursive: true });
      await fs.writeFile(resolvedTemplatePath, templateContent, "utf-8");

      const result = {
        content: [{ type: "text" as const, text: `Memory template at ${resolvedTemplatePath} updated/generated successfully with ${finalHeaders.length} headers.` }],
        details: undefined,
      };
      await logToolExecution("memory_template", params, result);
      return result;
    } catch (error: any) {
      const result = {
        content: [{ type: "text" as const, text: `Error generating memory template: ${error.message}` }],
        details: undefined,
      };
      await logToolExecution("memory_template", params, null, error);
      return result;
    }
  },
});
