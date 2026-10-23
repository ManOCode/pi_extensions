import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { memory_store } from "./tools/memory_store.js";
import { memory_fetch } from "./tools/memory_fetch.js";
import { memory_list } from "./tools/memory_list.js";
import { memory_delete } from "./tools/memory_delete.js";
import { memory_search } from "./tools/memory_search.js";
import { memory_append } from "./tools/memory_append.js";

export default function (pi: ExtensionAPI) {
  pi.registerTool(memory_store);
  pi.registerTool(memory_fetch);
  pi.registerTool(memory_list);
  pi.registerTool(memory_delete);
  pi.registerTool(memory_search);
  pi.registerTool(memory_append);
}
