/**
 * Base class for pi tools to provide common functionality
 * and standardized error handling.
 */
export abstract class BaseTool {
  abstract name: string;
  abstract label: string;
  abstract description: string;
  abstract parameters: any;

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