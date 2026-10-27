export interface ToolExecutionRecord {
  toolCallId: string;
  toolName: string;
  arguments: any;
  result?: any;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "pending" | "success" | "error";
  error?: any;
}