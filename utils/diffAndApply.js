const fs = require('fs');
const path = require('path');
const diff = require('diff');
const readline = require('readline');
const chalk = require('chalk');

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim().toLowerCase());
  }));
}

async function showDiffAndApply(filePath, newContent) {
  const fullPath = path.resolve(filePath);

  let oldContent = '';
  if (fs.existsSync(fullPath)) {
    oldContent = fs.readFileSync(fullPath, 'utf8');
  }

  const patch = diff.diffLines(oldContent, newContent);

  console.log(chalk.yellow('\n--- Proposed changes to ' + filePath + ' ---'));
  patch.forEach(part => {
    const color = part.added ? 'green' :
                  part.removed ? 'red' : 'gray';
    process.stdout.write(chalk[color](part.value));
  });

  const confirmation = await askQuestion('\nApply these changes? (yes/no): ');
  if (confirmation === 'yes') {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(chalk.green(`Changes applied to ${filePath}`));
  } else {
    console.log(chalk.red(`Changes discarded for ${filePath}`));
  }
}

module.exports = showDiffAndApply;
