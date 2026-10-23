import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_edit = defineTool({
  name: "memory_edit",
  label: "Memory Edit",
  description: "Precisely edit a memory file by replacing a specific piece of text. Useful for updating status, dates, or small details without rewriting the whole file.",
  parameters: Type.Object({
    name: Type.String({ description: "The path/name of the memory file (without extension)." }),
    oldText: Type.String({ description: "The exact text to be replaced." }),
    newText: Type.String({ description: "The replacement text." }),
  }),
  execute: async (_, params) => {
    try {
      const filePath = path.join(MEMORY_DIR, `${params.name}.md`);
      let content = await fs.readFile(filePath, "utf8");
      
      if (!content.includes(params.oldText)) {
        const result = {
          content: [{ type: "text" as const, text: `Could not find the exact text to replace in ${params.name}.md` }],
          isError: true,
          details: undefined,
        };
        await logToolExecution("memory_edit", params, result);
        return result;
      }
      
      const updatedContent = content.replace(params.oldText, params.newText);
      await fs.writeFile(filePath, updatedContent, "utf8");
      
      const result = {
        content: [{ type: "text" as const, text: `Successfully updated memory in ${params.name}.md` }],
        details: undefined,
      };
      await logToolExecution("memory_edit", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text" as const, text: `Error editing memory file ${params.name}.md` }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_edit", params, result, err);
      return result;
    }
  },
});
