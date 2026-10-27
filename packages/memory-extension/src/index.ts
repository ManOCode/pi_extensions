import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getLogger } from "./behaviors/log-manager";
import { GetMemoryTool, ListMemoryTool } from "./behaviors/read-memory";
import { SaveMemoryTool } from "./behaviors/write-memory";

const logger = getLogger();

export default function (pi: ExtensionAPI) {
  logger.info("Loading Memory Extension");

  const GetMemory = new GetMemoryTool();
  pi.registerTool({
    name: GetMemory.name,
    label: GetMemory.label,
    description: GetMemory.description,
    parameters: GetMemory.parameters,
    execute: (id: string, args: any) => GetMemory.execute(id, args),
  });

  const ListMemory = new ListMemoryTool();
  pi.registerTool({
    name: ListMemory.name,
    label: ListMemory.label,
    description: ListMemory.description,
    parameters: ListMemory.parameters,
    execute: (id: string, args: any) => ListMemory.execute(id, args),
  });

  const SaveMemory = new SaveMemoryTool();
  pi.registerTool({
    name: SaveMemory.name,
    label: SaveMemory.label,
    description: SaveMemory.description,
    parameters: SaveMemory.parameters,
    execute: (id: string, args: any) => SaveMemory.execute(id, args),
  });
}
