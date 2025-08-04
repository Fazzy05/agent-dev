const fs = require('fs');
const path = require('path');

function extractCodeFromMarkdown(markdown) {
  const match = markdown.match(/```(?:js)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

function writeToFile(relativePath, content) {
  const fullPath = path.join(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Created: ${relativePath}`);
}

module.exports = function applyPlan(planText) {
  const code = extractCodeFromMarkdown(planText);
  if (!code) {
    console.warn('No code block found in response.');
    return;
  }

  // Simple heuristic: JWT login code => auth route
  const outputPath = 'routes/auth.js';
  writeToFile(outputPath, code);
};
