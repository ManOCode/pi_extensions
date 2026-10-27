/**
 * Base class for pi tools to provide common functionality
 * and standardized error handling.
 */
export abstract class BaseTool {
  protected pi?: any;
  abstract name: string;
  abstract label: string;
  abstract description: string;
  abstract parameters: any;

  setPi(pi: any): void {
    this.pi = pi;
  }

  asTool() {
    return {
      name: this.name,
      label: this.label,
      description: this.description,
      parameters: this.parameters,
      execute: (id: string, args: any) => this.execute(id, args),
    };
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