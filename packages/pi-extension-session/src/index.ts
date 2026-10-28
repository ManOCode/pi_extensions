import { BaseTool } from "@manocode/pi-extension-core";
import { sessionManager } from "./behaviors/session-manager.js";

/**
 * Base tool that automatically records its execution to the session logs.
 */
export abstract class SessionableBaseTool<TArgs = unknown, TResult = unknown> extends BaseTool {
  async execute(id: string, args: TArgs): Promise<TResult> {
    await sessionManager.recordStart(id, this.name, args);
    
    let isError = false;
    let errorDetails: unknown;
    
    try {
      const result = await this.run(id, args);
      await sessionManager.recordResult(id, result);
      return result;
    } catch (error: unknown) {
      isError = true;
      errorDetails = error;
      throw error;
    } finally {
      await sessionManager.recordEnd(id, isError, errorDetails);
    }
  }

  protected abstract run(id: string, args: TArgs): Promise<TResult>;
}
