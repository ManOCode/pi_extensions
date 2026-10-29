import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getLogger } from "./behaviors/log-manager";
export { getMemory, listMemory } from "./behaviors/read-memory";
export { saveMemory } from "./behaviors/write-memory";
export { setMemoryDir } from "./config";

const logger = getLogger();

export default function (pi: ExtensionAPI) {
  logger.info("Loading Memory Extension");
  pi.registerTool({
    name: getMemory.name,
    label: getMemory.label,
    description: getMemory.description,
    parameters: getMemory.parameters,
    execute: (id: string, args: any) => getMemory.execute(id, args)
  });
  pi.registerTool({
    name: listMemory.name,
    label: listMemory.label,
    description: listMemory.description,
    parameters: listMemory.parameters,
    execute: (id: string, args: any) => listMemory.execute(id, args)
  });
  pi.registerTool({
    name: saveMemory.name,
    label: saveMemory.label,
    description: saveMemory.description,
    parameters: saveMemory.parameters,
    execute: (id: string, args: any) => saveMemory.execute(id, args)
  });
}
