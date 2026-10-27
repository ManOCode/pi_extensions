import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export const PI_EXTENSIONS_ROOT = path.join(os.homedir(), ".pi-extensions");

/**
 * Ensures that a directory exists. Creates it recursively if it doesn't.
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`[extension-core] Failed to ensure directory: ${dirPath}`, error);
    throw error;
  }
}

/**
 * Base class for pi tools to provide common functionality
 * and standardized error handling.
 */
export abstract class BaseTool {
  abstract name: string;
  abstract label: string;
  abstract description: string;
  abstract parameters: any;

  async execute(id: string, args: any, pi: ExtensionAPI): Promise<any> {
    try {
      return await this.run(id, args, pi);
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      throw error;
    }
  }

  protected abstract run(id: string, args: any, pi: ExtensionAPI): Promise<any>;

  /**
   * Converts the class instance into a tool object compatible with pi.registerTool
   */
  asTool() {
    return {
      name: this.name,
      label: this.label,
      description: this.description,
      parameters: this.parameters,
      execute: (id: string, args: any) => this.execute(id, args, this.piInstance),
    };
  }

  private piInstance!: ExtensionAPI;

  setPi(pi: ExtensionAPI) {
    this.piInstance = pi;
  }
}

export { ExtensionAPI };
