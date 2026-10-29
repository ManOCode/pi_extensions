import { describe, it, expect, beforeEach } from "vitest";
import { sessionManager } from "../../src/index.js";
import { sessionClient } from "../../src/session/clients/session-client.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const ROOT_DIR = path.join(os.homedir(), ".pi-extensions");
const SESSION_DIR = path.join(ROOT_DIR, "sessions");

describe("Session Shared Utilities", () => {
  beforeEach(async () => {
    try {
      await fs.rm(SESSION_DIR, { recursive: true, force: true });
    } catch {}
    process.env.PI_SESSION_ID = "test-session-123";
  });

  it("should record tool start, result, and end via sessionManager", async () => {
    const toolCallId = "call-1";
    const toolName = "test_tool";
    const args = { foo: "bar" };
    const result = "success_result";

    await sessionManager.recordStart(toolCallId, toolName, args);
    await sessionManager.recordResult(toolCallId, result);
    await sessionManager.recordEnd(toolCallId, false);

    const filePath = path.join(SESSION_DIR, "test-session-123.jsonl");
    const contentStr = await fs.readFile(filePath, "utf8");
    const record = JSON.parse(contentStr.trim());

    expect(record.toolCallId).toBe(toolCallId);
    expect(record.toolName).toBe(toolName);
    expect(record.arguments).toEqual(args);
    expect(record.result).toBe(result);
    expect(record.status).toBe("success");
    expect(record.durationMs).toBeDefined();
  });

  it("should handle tool execution errors", async () => {
    const toolCallId = "call-2";
    const toolName = "error_tool";
    const error = new Error("Something went wrong");

    await sessionManager.recordStart(toolCallId, toolName, {});
    await sessionManager.recordEnd(toolCallId, true, error);

    const filePath = path.join(SESSION_DIR, "test-session-123.jsonl");
    const content = await fs.readFile(filePath, "utf8");
    const record = JSON.parse(content.trim());

    expect(record.status).toBe("error");
    expect(record.error).toBeDefined();
  });
});
