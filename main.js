require('dotenv').config();
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const askOllama  = require('./utils/askOllama');
const { parseAndApplyChanges } = require('./utils/parseAndApplyChanges');

const task = process.argv.slice(2).join(' ');
if (!task) {
  console.error('Please provide a task description.');
  process.exit(1);
}

// Generate a safe folder name for the project
const folderName = slugify(task, { lower: true, strict: true });
const projectDir = path.join(__dirname, 'projects', folderName);

// Create the project directory
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
  console.log(`Created project folder: ${projectDir}`);
}

(async () => {
  try {
    const prompt = `
        You are a coding assistant. When you return code, break it into proper files using the following format:

        // file: server.js
        \`\`\`js
        // your code here
        \`\`\`

        // file: routes/auth.js
        \`\`\`js
        // another file's code
        \`\`\`

        Only include code blocks in this format. Now complete this task step by step and generate actual working backend files:

        TASK: ${task}
        `;

    console.log('Planning your task...');
    const llmResponse = await askOllama(prompt);

    // Display raw response
    console.log('\n--- Agent Output ---\n');
    console.log(llmResponse);

    // Apply the code changes in project directory
    console.log('\n--- Applying Code ---\n');
    await parseAndApplyChanges(llmResponse, projectDir);

    console.log(`Task completed and files saved in: ${projectDir}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
