import { askLlama } from '../agents/llama.js';

const response = await askLlama("Summarize this code:\n\nfunction add(a, b) { return a + b; }");
console.log("LLaMA says:\n", response);
