import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR, ensureMemoryDir } from "../constants/directory_constant.js";
import { logToolExecution } from "../utils/logger.js";

export const memory_delete = defineTool({
  name: "memory_delete",
  label: "Memory delete",
  description: "Delete a memory file from the persistent memory store.",
  parameters: Type.Object({
    name: Type.String({ description: "The name of the memory file (without extension)." }),
  }),
  execute: async (_, params) => {
    try {
      await ensureMemoryDir();
      const filePath = path.join(MEMORY_DIR, `${params.name}.md`);
      await fs.unlink(filePath);
      const result = {
        content: [{ type: "text", text: `Deleted memory ${params.name}.md` }],
        details: undefined,
      };
      await logToolExecution("memory_delete", params, result);
      return result;
    } catch (err) {
      const result = {
        content: [{ type: "text", text: `Memory file ${params.name}.md not found.` }],
        isError: true,
        details: undefined,
      };
      await logToolExecution("memory_delete", params, result, err);
      return result;
    }
  },
});
