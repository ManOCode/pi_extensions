import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getLogger } from "./behaviors/log-manager";
import { GetMemoryTool, ListMemoryTool } from "./behaviors/read-memory";
import { SaveMemoryTool } from "./behaviors/write-memory";
import { setMemoryDir } from "./config";

const logger = getLogger();

export const GetMemory = new GetMemoryTool();
export const ListMemory = new ListMemoryTool();
export const SaveMemory = new SaveMemoryTool();

export {
  GetMemory as getMemory,
  ListMemory as listMemory,
  SaveMemory as saveMemory,
  setMemoryDir
};

export default function (pi: ExtensionAPI) {
  logger.info("Loading Memory Extension");

  pi.registerTool(GetMemory.asTool());
  pi.registerTool(ListMemory.asTool());
  pi.registerTool(SaveMemory.asTool());
}
