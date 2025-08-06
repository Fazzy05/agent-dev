const { spawn } = require('child_process');

async function askOllama(prompt, model = process.env.MODEL_NAME || 'llama3:8b-instruct-q4_K_M') {
  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['run', model]);

    let output = '';

    ollama.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text); 
      output += text;
    });

    ollama.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    });

    ollama.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Ollama process exited with code ${code}`));
      }
    });

    ollama.stdin.write(prompt + '\n');
    ollama.stdin.end();
  });
}

module.exports = { askOllama };
