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
    expect(piMock.registerTool).toHaveBeenCalledTimes(7);
    const toolNames = registeredTools.map(t => t.name);
    expect(toolNames).toContain("memory_store");
    expect(toolNames).toContain("memory_fetch");
    expect(toolNames).toContain("memory_list");
    expect(toolNames).toContain("memory_delete");
    expect(toolNames).toContain("memory_search");
    expect(toolNames).toContain("memory_append");
    expect(toolNames).toContain("memory_edit");
  });

  it("memory_store should write a file and create directories", async () => {
    extension(piMock);
    const memoryStore = registeredTools.find(t => t.name === "memory_store");
    
    const name = "home/tasks/test-memory";
    const content = "# Test\nContent";
    
    await memoryStore.execute("test-id", { name, content }, undefined, undefined, {} as any);
    
    expect(fs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining(path.join(os.homedir(), ".pi-extensions", "memory", "home", "tasks")),
      { recursive: true }
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join(os.homedir(), ".pi-extensions", "memory", "home", "tasks", "test-memory.md")),
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

  it("memory_list should return list of files and dirs in specific path", async () => {
    extension(piMock);
    const memoryList = registeredTools.find(t => t.name === "memory_list");
    
    (fs.readdir as any).mockResolvedValue([
      { name: "mem1.md", isDirectory: () => false },
      { name: "folder1", isDirectory: () => true },
    ]);
    
    const result = await memoryList.execute("test-id", { path: "home" }, undefined, undefined, {} as any);
    expect(result.content[0].text).toContain("Contents of home:");
    expect(result.content[0].text).toContain("[FILE] mem1");
    expect(result.content[0].text).toContain("[DIR] folder1/");
  });

  it("memory_edit should replace text in file", async () => {
    extension(piMock);
    const memoryEdit = registeredTools.find(t => t.name === "memory_edit");
    
    (fs.readFile as any).mockResolvedValue("Status: Pending\nPriority: High");
    
    const result = await memoryEdit.execute("test-id", { 
      name: "test-memory", 
      oldText: "Status: Pending", 
      newText: "Status: Done" 
    }, undefined, undefined, {} as any);
    
    expect(result.content[0].text).toContain("Successfully updated");
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      "Status: Done\nPriority: High",
      "utf8"
    );
  });

  it("memory_edit should fail if text not found", async () => {
    extension(piMock);
    const memoryEdit = registeredTools.find(t => t.name === "memory_edit");
    
    (fs.readFile as any).mockResolvedValue("Status: Pending");
    
    const result = await memoryEdit.execute("test-id", { 
      name: "test-memory", 
      oldText: "Status: Done", 
      newText: "Status: Active" 
    }, undefined, undefined, {} as any);
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Could not find the exact text");
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

  it("memory_search should find matching lines recursively", async () => {
    extension(piMock);
    const memorySearch = registeredTools.find(t => t.name === "memory_search");
    
    (fs.readdir as any).mockImplementation((dir: string) => {
      if (dir.endsWith("memory")) return Promise.resolve([{ name: "home", isDirectory: () => true }]);
      if (dir.endsWith("home")) return Promise.resolve([{ name: "mem1.md", isDirectory: () => false }]);
      return Promise.resolve([]);
    });
    
    (fs.readFile as any).mockResolvedValue("Apple is red");
    
    const result = await memorySearch.execute("test-id", { query: "Apple" }, undefined, undefined, {} as any);
    expect(result.content[0].text).toContain(`Path: ${path.join("home", "mem1")}`);
    expect(result.content[0].text).toContain("L1: Apple is red");
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
