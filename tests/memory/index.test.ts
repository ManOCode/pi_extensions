import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import extension from "../../packages/memory/src/index";
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";

vi.mock("node:fs/promises");

describe("memory", () => {
  let piMock: ExtensionAPI;
  const registeredTools: any[] = [];

  beforeEach(() => {
    registeredTools.length = 0;
    piMock = {
      registerTool: vi.fn((tool) => registeredTools.push(tool)),
    } as any;
    vi.clearAllMocks();
  });

  it("should register all memory tools", () => {
    extension(piMock);
    expect(piMock.registerTool).toHaveBeenCalledTimes(6);
    const toolNames = registeredTools.map(t => t.name);
    expect(toolNames).toContain("memory_store");
    expect(toolNames).toContain("memory_fetch");
    expect(toolNames).toContain("memory_list");
    expect(toolNames).toContain("memory_delete");
    expect(toolNames).toContain("memory_search");
    expect(toolNames).toContain("memory_append");
  });

  it("memory_store should write a file", async () => {
    extension(piMock);
    const memoryStore = registeredTools.find(t => t.name === "memory_store");
    
    const name = "test-memory";
    const content = "# Test\nContent";
    
    await memoryStore.execute("test-id", { name, content }, undefined, undefined, {} as any);
    
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join(os.homedir(), ".pi-extensions", "memory", `${name}.md`)),
      content,
      "utf8"
    );
  });

  it("memory_fetch should read a file", async () => {
    extension(piMock);
    const memoryFetch = registeredTools.find(t => t.name === "memory_fetch");
    
    const name = "test-memory";
    const content = "# Test\nContent";
    (fs.readFile as any).mockResolvedValue(content);
    
    const result = await memoryFetch.execute("test-id", { name }, undefined, undefined, {} as any);
    expect(result.content[0].text).toBe(content);
    expect(fs.readFile).toHaveBeenCalled();
  });

  it("memory_list should return list of md files", async () => {
    extension(piMock);
    const memoryList = registeredTools.find(t => t.name === "memory_list");
    
    (fs.readdir as any).mockResolvedValue(["mem1.md", "mem2.md", "not-md.txt"]);
    
    const result = await memoryList.execute("test-id", {}, undefined, undefined, {} as any);
    expect(result.content[0].text).toBe("Stored memories: mem1, mem2");
  });

  it("memory_delete should remove a file", async () => {
    extension(piMock);
    const memoryDelete = registeredTools.find(t => t.name === "memory_delete");
    
    const name = "test-memory";
    await memoryDelete.execute("test-id", { name }, undefined, undefined, {} as any);
    
    expect(fs.unlink).toHaveBeenCalledWith(
      expect.stringContaining(path.join(os.homedir(), ".pi-extensions", "memory", `${name}.md`))
    );
  });

  it("memory_search should find matching lines", async () => {
    extension(piMock);
    const memorySearch = registeredTools.find(t => t.name === "memory_search");
    
    (fs.readdir as any).mockResolvedValue(["mem1.md", "mem2.md"]);
    (fs.readFile as any).mockImplementation((filePath: string) => {
      if (filePath.endsWith("mem1.md")) return Promise.resolve("Apple is red\nBanana is yellow");
      if (filePath.endsWith("mem2.md")) return Promise.resolve("Apple is a fruit\nCherry is red");
      return Promise.reject(new Error("File not found"));
    });
    
    const result = await memorySearch.execute("test-id", { query: "Apple" }, undefined, undefined, {} as any);
    expect(result.content[0].text).toContain("Found matches in 2 file(s)");
    expect(result.content[0].text).toContain("L1: Apple is red");
    expect(result.content[0].text).toContain("L1: Apple is a fruit");
  });

  it("memory_append should append to a file", async () => {
    extension(piMock);
    const memoryAppend = registeredTools.find(t => t.name === "memory_append");
    
    const name = "test-memory";
    const content = "Append this";
    
    await memoryAppend.execute("test-id", { name, content }, undefined, undefined, {} as any);
    
    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join(os.homedir(), ".pi-extensions", "memory", `${name}.md`)),
      `\n${content}`,
      "utf8"
    );
  });
});
