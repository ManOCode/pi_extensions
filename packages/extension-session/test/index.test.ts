import { describe, it, expect, vi, beforeEach } from "vitest";
import extension from "../src/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const ROOT_DIR = path.join(os.homedir(), ".pi-extensions");
const SESSION_DIR = path.join(ROOT_DIR, "sessions");

describe("Session Capture Extension", () => {
  let piMock: any;
  let eventHandlers: Record<string, Function> = {};

  beforeEach(async () => {
    eventHandlers = {};
    piMock = {
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
    };
    
    // Clean up session files before each test
    try {
      await fs.rm(SESSION_DIR, { recursive: true, force: true });
    } catch {}

    process.env.PI_SESSION_ID = "test-session-123";
    extension(piMock);
  });

  it("should capture tool execution lifecycle and persist to file", async () => {
    const toolCallId = "call-1";
    const toolName = "read_file";
    const input = { path: "test.txt" };
    const content = [{ type: "text" as const, text: "hello world" }];
    const details = {};

    // Trigger tool_execution_start
    await eventHandlers["tool_execution_start"]({ toolCallId, toolName, args: input }, {});

    // Trigger tool_result
    await eventHandlers["tool_result"]({ toolCallId, content, details, input: {}, isError: false });

    // Trigger tool_execution_end
    await eventHandlers["tool_execution_end"]({ toolCallId, toolName, result: null, isError: false }, {});

    const filePath = path.join(SESSION_DIR, "test-session-123.jsonl");
    const contentStr = await fs.readFile(filePath, "utf8");
    const record = JSON.parse(contentStr.trim());

    expect(record.toolCallId).toBe(toolCallId);
    expect(record.toolName).toBe(toolName);
    expect(record.arguments).toEqual(input);
    expect(record.result).toEqual({
      content,
      details,
      isError: false,
    });
    expect(record.status).toBe("success");
    expect(record.durationMs).toBeDefined();
  });

  it("should capture tool execution errors", async () => {
    const toolCallId = "call-2";
    const toolName = "bad_tool";
    const input = {};
    const error = new Error("Execution failed");

    await eventHandlers["tool_execution_start"]({ toolCallId, toolName, args: input }, {});
    await eventHandlers["tool_execution_end"]({ toolCallId, toolName, result: error, isError: true }, {});

    const filePath = path.join(SESSION_DIR, "test-session-123.jsonl");
    const content = await fs.readFile(filePath, "utf8");
    const record = JSON.parse(content.trim());

    expect(record.status).toBe("error");
    expect(record.error).toBeDefined();
  });
});
