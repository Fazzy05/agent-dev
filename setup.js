#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Agent-Dev Setup & Startup');
console.log('================================\n');

async function checkRequirements() {
  console.log('📋 Checking requirements...\n');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js: ${nodeVersion}`);
  
  // Check if Ollama is available
  return new Promise((resolve) => {
    exec('ollama --version', (error, stdout) => {
      if (error) {
        console.log('❌ Ollama: Not installed or not in PATH');
        console.log('   Please install Ollama from: https://ollama.ai/');
        console.log('   Or the app will use internet-based LLM as fallback\n');
      } else {
        console.log(`✅ Ollama: ${stdout.trim()}`);
      }
      resolve();
    });
  });
}

async function installDependencies() {
  console.log('📦 Installing dependencies...\n');
  
  // Install main dependencies
  console.log('Installing main project dependencies...');
  await runCommand('npm', ['install']);
  
  // Install desktop app dependencies
  console.log('Installing desktop app dependencies...');
  await runCommand('npm', ['install'], { cwd: path.join(__dirname, 'desktop') });
  
  console.log('✅ All dependencies installed!\n');
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      stdio: 'inherit',
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const defaultEnv = `# Local LLM Configuration
MODEL_NAME=llama3:8b-instruct-q4_K_M

# OpenAI Configuration (optional, for internet fallback)
# OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001

# Application Settings
MY_ENV_VAR=hello-agent
`;
    
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created .env file with default configuration\n');
  }
}

async function startApplication() {
  console.log('🚀 Starting Agent-Dev...\n');
  console.log('The application will be available at:');
  console.log('  - Desktop UI: http://localhost:3000');
  console.log('  - Server API: http://localhost:3001');
  console.log('\nPress Ctrl+C to stop the application\n');
  
  // Start both server and desktop app
  await runCommand('npm', ['start']);
}

async function main() {
  try {
    await checkRequirements();
    
    // Check if dependencies are installed
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      await installDependencies();
    }
    
    if (!fs.existsSync(path.join(__dirname, 'desktop', 'node_modules'))) {
      console.log('Installing missing desktop dependencies...');
      await runCommand('npm', ['install'], { cwd: path.join(__dirname, 'desktop') });
    }
    
    await createEnvFile();
    await startApplication();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
