import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR } from "../constants/directory_constant.js";
import { ensureFilePath } from "../utils/path_utils.js";
import { updateIndex } from "../utils/index_utils.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_create = defineTool({
  name: "memory_create",
  label: "Memory Create",
  description: "Create a new memory record using a directory template (_template.md). Replaces {{key}} placeholders with provided data.",
  parameters: Type.Object({
    name: Type.String({ description: "The path/name of the memory file to create (without extension)." }),
    data: Type.Record(Type.String(), Type.String({ description: "Key-value pairs to fill into the template placeholders." })),
  }),
  execute: async (_, params) => {
    try {
      const filePath = await ensureFilePath(params.name);
      const dirPath = path.dirname(filePath);
      const templatePath = path.join(dirPath, "_template.md");

      let content = "";
      try {
        content = await fs.readFile(templatePath, "utf8");
        // Replace placeholders {{key}} with data values
        for (const [key, value] of Object.entries(params.data)) {
          content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
        }
        // Replace remaining placeholders with empty string or a default
        content = content.replace(/{{.*?}}/g, "");
      } catch (err) {
        // Template not found, create a simple record
        content = `# ${params.name}\n\n${Object.entries(params.data).map(([k, v]) => `${k}: ${v}`).join("\n")}`;
      }

      await fs.writeFile(filePath, content, "utf8");
      
      // Auto-update the index
      await updateIndex(params.name);

      const result = {
        content: [{ type: "text" as const, text: `Successfully created memory record from template: ${params.name}.md` }],
        details: undefined,
      };
      await logToolExecution("memory_create", params, result);
      return result;
    } catch (error) {
      await logToolExecution("memory_create", params, null, error);
      throw error;
    }
  },
});
