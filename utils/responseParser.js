const fs = require('fs');
const path = require('path');

function parseLLMResponse(response) {
    const sections = response.split(/--- FILE: (.+?) ---/g).slice(1);
    const parsed = [];

    for(let i = 0; i < sections.length; i += 2) {
        const relativePath = sections[i].trim();
        const content = sections[i + 1] || '';
        parsed.push({
            relativePath,
            content: content.trim(),
        });
    }
    return parsed;
}

function saveParsedOutput(parsedFiles, basePath = './output/generated') {
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

  for (const file of parsedFiles) {
    const fullPath = path.join(basePath, file.relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, file.content, 'utf-8');
    console.log(`Saved: ${file.relativePath}`);
  }
}

module.exports = { parseLLMResponse, saveParsedOutput };