import { sessionManager } from "./session-manager.js";

export abstract class BaseTool {
  protected pi?: any;
  abstract name: string;
  abstract label: string;
  abstract description: string;
  abstract parameters: any;

  setPi(pi: any): void {
    this.pi = pi;
  }

  async execute(id: string, args: any): Promise<any> {
    try {
      return await this.run(id, args);
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      throw error;
    }
  }

  protected abstract run(id: string, args: any): Promise<any>;

}

/**
 * Base tool that automatically records its execution to the session logs.
 */
export abstract class SessionableBaseTool<TArgs = any, TResult = any> extends BaseTool {
  abstract readonly name: string;

  async execute(id: string, args: TArgs): Promise<TResult> {
    await sessionManager.recordStart(id, this.name, args);
    
    let isError = false;
    let errorDetails: any;
    
    try {
      const result = await this.run(id, args);
      await sessionManager.recordResult(id, result);
      return result;
    } catch (error: any) {
      isError = true;
      errorDetails = error;
      throw error;
    } finally {
      await sessionManager.recordEnd(id, isError, errorDetails);
    }
  }

  protected abstract run(id: string, args: TArgs): Promise<TResult>;
}
