const fs = require('fs');
const path = require('path');
const askOllama = require('../utils/askOllama');

module.exports = async function planner(task) {
  const prompt = fs.readFileSync(path.join(__dirname, '../prompts/task_to_plan.md'), 'utf-8');
  const filledPrompt = prompt.replace('{{task}}', task);

  console.log("📝 Prompt sent to LLM:\n", filledPrompt); // Add this line for debugging

  const response = await askOllama(filledPrompt);
  return response;
};