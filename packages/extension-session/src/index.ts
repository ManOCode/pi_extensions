export interface SessionData {
  [key: string]: any;
}

export class ExtensionSession {
  private data: SessionData = {};

  set(key: string, value: any): void {
    this.data[key] = value;
  }

  get(key: string): any {
    return this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  getAll(): SessionData {
    return { ...this.data };
  }
}
