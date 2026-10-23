import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { MEMORY_DIR } from "../../packages/memory/src/constants/directory_constant";
import extension from "../../packages/memory/src/index";
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";

vi.mock("node:fs/promises");

describe("memory", () => {
  let piMock: ExtensionAPI;
  const registeredTools: any[] = [];
  const mockFileSystem = new Map<string, string>();

  beforeEach(() => {
    registeredTools.length = 0;
    mockFileSystem.clear();
    piMock = {
      registerTool: vi.fn((tool) => registeredTools.push(tool)),
    } as any;
    vi.clearAllMocks();

    // Setup global mocks for fs
    (fs.readFile as any).mockImplementation(async (filePath: string) => {
      const content = mockFileSystem.get(filePath);
      if (content === undefined) throw new Error("File not found");
      return content;
    });

    (fs.writeFile as any).mockImplementation(async (filePath: string, content: string) => {
      mockFileSystem.set(filePath, content);
      return Promise.resolve();
    });

    (fs.appendFile as any).mockImplementation(async (filePath: string, content: string) => {
      const current = mockFileSystem.get(filePath) || "";
      mockFileSystem.set(filePath, current + content);
      return Promise.resolve();
    });
    
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.unlink as any).mockImplementation(async (filePath: string) => {
      mockFileSystem.delete(filePath);
      return Promise.resolve();
    });
  });

  it("should register all memory tools", () => {
    extension(piMock);
    expect(piMock.registerTool).toHaveBeenCalledTimes(8);
    const toolNames = registeredTools.map(t => t.name);
    expect(toolNames).toContain("memory_store");
    expect(toolNames).toContain("memory_fetch");
    expect(toolNames).toContain("memory_list");
    expect(toolNames).toContain("memory_delete");
    expect(toolNames).toContain("memory_search");
    expect(toolNames).toContain("memory_append");
    expect(toolNames).toContain("memory_edit");
    expect(toolNames).toContain("memory_create");
  });

  it("memory_store should write a file, create directories, and update index", async () => {
    extension(piMock);
    const memoryStore = registeredTools.find(t => t.name === "memory_store");
    
    const name = "home/tasks/test-memory";
    const content = "# Test Memory\nStatus: Active\nContent";
    
    await memoryStore.execute("test-id", { name, content }, undefined, undefined, {} as any);
    
    const filePath = path.join(MEMORY_DIR, `${name}.md`);
    const indexFilePath = path.join(path.dirname(filePath), "_index.md");
    
    expect(mockFileSystem.get(filePath)).toBe(content);
    expect(mockFileSystem.get(indexFilePath)).toContain(`- [Test Memory](${name}.md) | Status: Active`);
  });

  it("memory_create should create a record using a template", async () => {
    extension(piMock);
    const memoryCreate = registeredTools.find(t => t.name === "memory_create");
    
    const name = "home/tasks/new-task";
    const data = { priority: "High", status: "Pending" };
    const templateContent = "# {{title}}\n- Priority: {{priority}}\n- Status: {{status}}";
    
    const dirPath = path.join(MEMORY_DIR, "home", "tasks");
    await fs.mkdir(dirPath, { recursive: true });
    mockFileSystem.set(path.join(dirPath, "_template.md"), templateContent);
    
    await memoryCreate.execute("test-id", { name, data }, undefined, undefined, {} as any);
    
    const filePath = path.join(MEMORY_DIR, `${name}.md`);
    expect(mockFileSystem.get(filePath)).toContain("- Priority: High\n- Status: Pending");
  });

  it("memory_append should append to a file and update index", async () => {
    extension(piMock);
    const memoryAppend = registeredTools.find(t => t.name === "memory_append");
    
    const name = "test-memory";
    const content = "Append this";
    const filePath = path.join(MEMORY_DIR, `${name}.md`);
    mockFileSystem.set(filePath, "# Test Memory\nStatus: Active");
    
    await memoryAppend.execute("test-id", { name, content }, undefined, undefined, {} as any);
    
    expect(mockFileSystem.get(filePath)).toContain(`\n${content}`);
    
    const indexFilePath = path.join(MEMORY_DIR, "_index.md");
    expect(mockFileSystem.get(indexFilePath)).toContain("- [Test Memory](test-memory.md) | Status: Active");
  });

  it("memory_edit should replace text in file and update index", async () => {
    extension(piMock);
    const memoryEdit = registeredTools.find(t => t.name === "memory_edit");
    
    const name = "test-memory";
    const filePath = path.join(MEMORY_DIR, `${name}.md`);
    mockFileSystem.set(filePath, "# Test Memory\nStatus: Pending\nPriority: High");
    
    const result = await memoryEdit.execute("test-id", { 
      name, 
      oldText: "Status: Pending", 
      newText: "Status: Done" 
    }, undefined, undefined, {} as any);
    
    expect(result.content[0].text).toContain("Successfully updated");
    expect(mockFileSystem.get(filePath)).toContain("Status: Done");
    
    const indexFilePath = path.join(MEMORY_DIR, "_index.md");
    expect(mockFileSystem.get(indexFilePath)).toContain("- [Test Memory](test-memory.md) | Status: Done");
  });

  it("memory_fetch should read a file", async () => {
    extension(piMock);
    const memoryFetch = registeredTools.find(t => t.name === "memory_fetch");
    
    const name = "test-memory";
    const content = "# Test\nContent";
    mockFileSystem.set(path.join(MEMORY_DIR, `${name}.md`), content);
    
    const result = await memoryFetch.execute("test-id", { name }, undefined, undefined, {} as any);
    expect(result.content[0].text).toBe(content);
  });

  it("memory_list should return list of files and dirs in specific path", async () => {
    extension(piMock);
    const memoryList = registeredTools.find(t => t.name === "memory_list");
    
    // Setup a virtual directory in mockFileSystem
    const dirPath = path.join(MEMORY_DIR, "home");
    mockFileSystem.set(path.join(dirPath, "mem1.md"), "content");
    mockFileSystem.set(path.join(dirPath, "folder1"), "dir"); // Note: readdir mock needs manual override
    
    (fs.readdir as any).mockResolvedValueOnce([
      { name: "mem1.md", isDirectory: () => false },
      { name: "folder1", isDirectory: () => true },
    ]);
    
    const result = await memoryList.execute("test-id", { path: "home" }, undefined, undefined, {} as any);
    expect(result.content[0].text).toContain("Contents of home:");
    expect(result.content[0].text).toContain("[FILE] mem1");
    expect(result.content[0].text).toContain("[DIR] folder1/");
  });

  it("memory_delete should remove a file", async () => {
    extension(piMock);
    const memoryDelete = registeredTools.find(t => t.name === "memory_delete");
    
    const name = "test-memory";
    const filePath = path.join(MEMORY_DIR, `${name}.md`);
    mockFileSystem.set(filePath, "content");
    
    await memoryDelete.execute("test-id", { name }, undefined, undefined, {} as any);
    
    expect(mockFileSystem.has(filePath)).toBe(false);
  });

  it("memory_search should find matching lines recursively", async () => {
    extension(piMock);
    const memorySearch = registeredTools.find(t => t.name === "memory_search");
    
    (fs.readdir as any).mockImplementation((dir: string) => {
      if (dir === MEMORY_DIR) return Promise.resolve([{ name: "home", isDirectory: () => true }]);
      if (dir === path.join(MEMORY_DIR, "home")) return Promise.resolve([{ name: "mem1.md", isDirectory: () => false }]);
      return Promise.resolve([]);
    });
    
    (fs.readFile as any).mockResolvedValue("Apple is red");
    
    const result = await memorySearch.execute("test-id", { query: "Apple" }, undefined, undefined, {} as any);
    expect(result.content[0].text).toContain(`Path: ${path.join("home", "mem1")}`);
    expect(result.content[0].text).toContain("L1: Apple is red");
  });
});
