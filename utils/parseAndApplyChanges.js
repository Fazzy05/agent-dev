const fs = require('fs');
const path = require('path');

function parseAndApplyChanges(content, projectFolderPath) {
  const fileBlocks = [];
  const lines = content.split('\n');

  let currentFile = null;
  let currentContent = [];

  for (let line of lines) {
    // Match lines like: // file: index.js or ### index.js
    const fileMatch = line.match(/(?:\/\/|#|###)\s*file\s*:\s*(.+)/i);
    const markdownFileMatch = line.match(/^```[a-z]*\s*(.+\.js|.+\.ts|.+\.json)?/i);

    if (fileMatch) {
      if (currentFile) {
        fileBlocks.push({ fileName: currentFile, content: currentContent.join('\n') });
      }
      currentFile = fileMatch[1].trim();
      currentContent = [];
    } else if (markdownFileMatch && markdownFileMatch[1]) {
      if (currentFile) {
        fileBlocks.push({ fileName: currentFile, content: currentContent.join('\n') });
      }
      currentFile = markdownFileMatch[1].trim();
      currentContent = [];
    } else if (line.trim() === '```') {
      // End of code block
      if (currentFile) {
        fileBlocks.push({ fileName: currentFile, content: currentContent.join('\n') });
        currentFile = null;
        currentContent = [];
      }
    } else if (currentFile) {
      currentContent.push(line);
    }
  }

  // Final push if still something remaining
  if (currentFile && currentContent.length) {
    fileBlocks.push({ fileName: currentFile, content: currentContent.join('\n') });
  }

  // If nothing found, fallback to a default single file
  if (fileBlocks.length === 0) {
    fileBlocks.push({
      fileName: 'index.js',
      content: content
    });
  }

  // Write the files
  for (const { fileName, content } of fileBlocks) {
    const fullPath = path.join(projectFolderPath, fileName);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Created: ${fullPath}`);
  }
}

module.exports = { parseAndApplyChanges };
