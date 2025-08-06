const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const { askOllama } = require('../utils/askOllama');
const { askOpenAI } = require('../utils/askOpenAI');
const { scanProjects } = require('../utils/projectScanner');
const { parseAndApplyChanges } = require('../utils/parseAndApplyChanges');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../desktop/build')));

// Store active sessions and their contexts
const sessions = new Map();

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await scanProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/select', (req, res) => {
  const { projectPath, sessionId } = req.body;
  
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], context: {} });
  }
  
  const session = sessions.get(sessionId);
  session.context.projectPath = projectPath;
  session.context.projectName = path.basename(projectPath);
  
  res.json({ success: true, project: session.context });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Initialize session
  if (!sessions.has(socket.id)) {
    sessions.set(socket.id, { 
      messages: [], 
      context: { projectPath: null, projectName: null }
    });
  }

  socket.on('message', async (data) => {
    const { message, useInternet = false } = data;
    const session = sessions.get(socket.id);
    
    // Add user message to session
    session.messages.push({ role: 'user', content: message, timestamp: new Date() });
    
    try {
      let response;
      let source = 'local';
      
      if (!useInternet) {
        try {
          // Try local LLM first
          response = await askOllama(buildContextualPrompt(message, session.context));
          source = 'local';
        } catch (localError) {
          console.log('Local LLM failed, trying internet...', localError.message);
          // Fallback to internet-based LLM
          response = await askOpenAI(buildContextualPrompt(message, session.context));
          source = 'internet';
        }
      } else {
        // User explicitly requested internet
        response = await askOpenAI(buildContextualPrompt(message, session.context));
        source = 'internet';
      }
      
      // Add assistant response to session
      session.messages.push({ 
        role: 'assistant', 
        content: response, 
        source,
        timestamp: new Date() 
      });
      
      socket.emit('response', { 
        message: response, 
        source,
        context: session.context 
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { 
        message: 'Failed to process your request. Please try again.',
        error: error.message 
      });
    }
  });

  socket.on('apply-changes', async (data) => {
    const { code, filePath } = data;
    const session = sessions.get(socket.id);
    
    try {
      if (session.context.projectPath) {
        await parseAndApplyChanges(code, session.context.projectPath);
        socket.emit('changes-applied', { 
          success: true, 
          message: 'Changes applied successfully!' 
        });
      } else {
        socket.emit('changes-applied', { 
          success: false, 
          message: 'No project selected. Please select a project first.' 
        });
      }
    } catch (error) {
      socket.emit('changes-applied', { 
        success: false, 
        message: `Failed to apply changes: ${error.message}` 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Optionally clean up session after some time
  });
});

function buildContextualPrompt(message, context) {
  let prompt = '';
  
  if (context.projectPath) {
    prompt += `You are working on project "${context.projectName}" located at: ${context.projectPath}\n\n`;
    prompt += `When providing code solutions, consider the project structure and existing files.\n\n`;
  }
  
  prompt += `User request: ${message}\n\n`;
  prompt += `Provide helpful, accurate responses. If you're generating code, format it properly with file paths when relevant.`;
  
  return prompt;
}

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../desktop/build/index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Agent-Dev server running on http://localhost:${PORT}`);
  console.log(`📁 Serving desktop app from /desktop/build`);
  console.log(`🤖 LLM services ready`);
});

module.exports = { app, server, io };
