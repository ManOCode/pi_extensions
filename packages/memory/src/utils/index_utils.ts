import * as fs from "node:fs/promises";
import * as path from "node:path";
import { MEMORY_DIR } from "../constants/directory_constant.js";

/**
 * Automatically updates the _index.md file in the directory of the modified memory.
 * It attempts to extract a summary from the file and update the corresponding line in the index.
 */
export async function updateIndex(relativeName: string) {
  try {
    const filePath = path.join(MEMORY_DIR, `${relativeName}.md`);
    const dirPath = path.dirname(filePath);
    const indexFilePath = path.join(dirPath, "_index.md");

    // 1. Extract summary from the modified file
    const content = await fs.readFile(filePath, "utf8");
    if (!content) return; // Avoid crashes if file is empty or not found
    const lines = content.split("\n");
    
    // We'll take the first line as the title, and the first line that looks like 
    // "Key: Value" as the status summary.
    const title = lines[0].replace(/^#\s*/, "").trim();
    let summary = "";
    for (const line of lines) {
      if (line.includes(":") && !line.startsWith("#")) {
        summary = line.trim();
        break;
      }
    }
    if (!summary) summary = "No summary available";

    const summaryLine = `- [${title}](${relativeName}.md) | ${summary}`;

    // 2. Update the index file
    try {
      let indexContent = await fs.readFile(indexFilePath, "utf8");
      const indexLines = indexContent.split("\n");
      
      let found = false;
      const updatedIndexLines = indexLines.map(line => {
        if (line.includes(`[${title}](${relativeName}.md)`)) {
          found = true;
          return summaryLine;
        }
        return line;
      });

      if (found) {
        await fs.writeFile(indexFilePath, updatedIndexLines.join("\n"), "utf8");
      } else {
        // Append to the end of the "Content" or "Directory" section if it exists, otherwise just append
        if (indexContent.includes("## Content")) {
          indexContent = indexContent.replace("## Content", `## Content\n${summaryLine}`);
        } else if (indexContent.includes("## Directory")) {
          indexContent = indexContent.replace("## Directory", `## Directory\n${summaryLine}`);
        } else {
          indexContent += `\n${summaryLine}`;
        }
        await fs.writeFile(indexFilePath, indexContent, "utf8");
      }
    } catch (err) {
      // Index doesn't exist, create a basic one
      const newIndexContent = `# Index\n\n## Content\n${summaryLine}`;
      await fs.writeFile(indexFilePath, newIndexContent, "utf8");
    }
  } catch (error) {
    // Fail silently to avoid interrupting the main memory operation
    console.error(`Failed to update index for ${relativeName}:`, error);
  }
}
