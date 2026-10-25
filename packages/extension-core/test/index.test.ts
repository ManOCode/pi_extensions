import { describe, it, expect, vi } from "vitest";
import { BaseTool, PI_EXTENSIONS_ROOT, ensureDirectory } from "../src/index.js";
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

class MockTool extends BaseTool {
  name = "mock-tool";
  label = "Mock Tool";
  description = "A mock tool for testing";
  parameters = {};

  protected async run(id: string, args: any, pi: ExtensionAPI) {
    return `Hello ${args.name} (id: ${id})`;
  }
}

describe("BaseTool", () => {
  it("should execute the run method and return result", async () => {
    const tool = new MockTool();
    const pi = {} as ExtensionAPI;
    const result = await tool.execute("user123", { name: "World" }, pi);
    expect(result).toBe("Hello World (id: user123)");
  });

  it("should catch and log errors", async () => {
    class ErrorTool extends BaseTool {
      name = "error-tool";
      label = "Error Tool";
      description = "A tool that fails";
      parameters = {};
      protected async run() {
        throw new Error("Test Error");
      }
    }
    const tool = new ErrorTool();
    const pi = {} as ExtensionAPI;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    await expect(tool.execute("user123", {}, pi)).rejects.toThrow("Test Error");
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it("should convert to tool object", () => {
    const tool = new MockTool();
    const pi = {} as ExtensionAPI;
    tool.setPi(pi);
    const toolObj = tool.asTool();
    
    expect(toolObj.name).toBe("mock-tool");
    expect(toolObj.label).toBe("Mock Tool");
    expect(typeof toolObj.execute).toBe("function");
  });
});

describe("Core Utilities", () => {
  it("should export correct PI_EXTENSIONS_ROOT", () => {
    expect(PI_EXTENSIONS_ROOT).toBe(path.join(os.homedir(), ".pi-extensions"));
  });

  it("should ensure directory exists", async () => {
    const testDir = path.join(os.tmpdir(), "pi-ext-test-" + Date.now());
    await ensureDirectory(testDir);
    
    const stats = await fs.stat(testDir);
    expect(stats.isDirectory()).toBe(true);
    
    await fs.rm(testDir, { recursive: true, force: true });
  });
});
