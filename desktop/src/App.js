import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Send, 
  FolderOpen, 
  Settings, 
  Globe, 
  Cpu, 
  MessageCircle,
  Code,
  AlertCircle
} from 'lucide-react';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 8px;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
`;

const ProjectSection = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProjectList = styled.div`
  padding: 16px;
`;

const ProjectItem = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid ${props => props.selected ? '#238636' : 'transparent'};
  background: ${props => props.selected ? '#0d4429' : 'transparent'};
  
  &:hover {
    background: #21262d;
  }
  
  .project-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .project-type {
    font-size: 12px;
    color: #7d8590;
  }
  
  .project-path {
    font-size: 11px;
    color: #6e7681;
    margin-top: 4px;
    word-break: break-all;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: between;
  align-items: center;
  
  .project-info {
    flex: 1;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: #f0f6fc;
    }
    
    p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #7d8590;
    }
  }
  
  .controls {
    display: flex;
    gap: 8px;
  }
`;

const ToggleButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: ${props => props.active ? '#238636' : '#21262d'};
  color: ${props => props.active ? '#ffffff' : '#c9d1d9'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.active ? '#2ea043' : '#30363d'};
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #161b22;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

const Message = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.isUser ? '#238636' : '#1f6feb'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .sender {
        font-weight: 600;
        color: #f0f6fc;
      }
      
      .source {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 3px;
        background: ${props => props.source === 'local' ? '#0d4429' : '#0c2d6b'};
        color: ${props => props.source === 'local' ? '#238636' : '#58a6ff'};
        border: 1px solid ${props => props.source === 'local' ? '#238636' : '#1f6feb'};
      }
      
      .timestamp {
        font-size: 12px;
        color: #7d8590;
      }
    }
    
    .message-text {
      line-height: 1.6;
      
      pre {
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        margin: 12px 0;
      }
      
      code:not(pre code) {
        background: #161b22;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 14px;
      }
      
      blockquote {
        border-left: 4px solid #30363d;
        margin: 12px 0;
        padding-left: 16px;
        color: #7d8590;
      }
    }
  }
`;

const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid #30363d;
  background: #0d1117;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: end;
  
  .input-wrapper {
    flex: 1;
    position: relative;
  }
  
  textarea {
    width: 100%;
    min-height: 44px;
    max-height: 120px;
    padding: 12px;
    border: 1px solid #30363d;
    border-radius: 6px;
    background: #0d1117;
    color: #c9d1d9;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    outline: none;
    
    &:focus {
      border-color: #1f6feb;
      box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.3);
    }
    
    &::placeholder {
      color: #6e7681;
    }
  }
`;

const SendButton = styled.button`
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #238636;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: #2ea043;
  }
  
  &:disabled {
    background: #30363d;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7d8590;
    animation: loading 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes loading {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

function App() {
  const [socket, setSocket] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useInternet, setUseInternet] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('response', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        isUser: false,
        source: data.source,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    });

    newSocket.on('error', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Error: ${data.message}`,
        isUser: false,
        source: 'error',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    });

    // Load projects
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to load projects:', err));

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    
    // Clear chat and send project selection to server
    setMessages([{
      id: Date.now(),
      text: `Selected project: **${project.name}** (${project.type})\\n\\nPath: \`${project.path}\`\\n\\nYou can now ask questions or request changes for this project.`,
      isUser: false,
      source: 'system',
      timestamp: new Date()
    }]);

    fetch('/api/projects/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        projectPath: project.path, 
        sessionId: socket?.id 
      })
    });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading || !socket) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    socket.emit('message', {
      message: inputValue,
      useInternet: useInternet
    });

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppContainer>
      <Sidebar>
        <SidebarHeader>
          <FolderOpen size={20} />
          <h2>Projects</h2>
        </SidebarHeader>
        
        <ProjectSection>
          <ProjectList>
            {projects.map((project, index) => (
              <ProjectItem
                key={index}
                selected={selectedProject?.path === project.path}
                onClick={() => handleProjectSelect(project)}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-type">{project.type}</div>
                <div className="project-path">{project.path}</div>
              </ProjectItem>
            ))}
            
            {projects.length === 0 && (
              <div style={{ color: '#7d8590', textAlign: 'center', padding: '32px 0' }}>
                <FolderOpen size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>No projects found</p>
                <p style={{ fontSize: '12px' }}>Make sure you have projects in common directories</p>
              </div>
            )}
          </ProjectList>
        </ProjectSection>
      </Sidebar>

      <MainContent>
        <ChatHeader>
          <div className="project-info">
            {selectedProject ? (
              <>
                <h3>{selectedProject.name}</h3>
                <p>{selectedProject.path}</p>
              </>
            ) : (
              <>
                <h3>Agent Dev Assistant</h3>
                <p>Select a project to get started</p>
              </>
            )}
          </div>
          
          <div className="controls">
            <ToggleButton
              active={!useInternet}
              onClick={() => setUseInternet(false)}
            >
              <Cpu size={16} />
              Local
            </ToggleButton>
            <ToggleButton
              active={useInternet}
              onClick={() => setUseInternet(true)}
            >
              <Globe size={16} />
              Internet
            </ToggleButton>
          </div>
        </ChatHeader>

        <ChatMessages>
          {messages.map((message) => (
            <Message
              key={message.id}
              isUser={message.isUser}
              source={message.source}
            >
              <div className="avatar">
                {message.isUser ? (
                  <MessageCircle size={16} />
                ) : message.source === 'system' ? (
                  <Settings size={16} />
                ) : message.source === 'error' ? (
                  <AlertCircle size={16} />
                ) : (
                  <Code size={16} />
                )}
              </div>
              
              <div className="content">
                <div className="header">
                  <span className="sender">
                    {message.isUser ? 'You' : 'Assistant'}
                  </span>
                  {!message.isUser && message.source && message.source !== 'system' && (
                    <span className="source">
                      {message.source === 'local' ? 'Local LLM' : 'Internet'}
                    </span>
                  )}
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="message-text">
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </Message>
          ))}
          
          {isLoading && (
            <Message isUser={false}>
              <div className="avatar">
                <Code size={16} />
              </div>
              <div className="content">
                <div className="header">
                  <span className="sender">Assistant</span>
                  <span className="source">
                    {useInternet ? 'Internet' : 'Local LLM'}
                  </span>
                </div>
                <div className="message-text">
                  <LoadingDots>
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </LoadingDots>
                </div>
              </div>
            </Message>
          )}
          
          <div ref={messagesEndRef} />
        </ChatMessages>

        <InputArea>
          <InputContainer>
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedProject ? 
                  `Ask about ${selectedProject.name} or request changes...` : 
                  'Select a project first...'
                }
                disabled={!selectedProject || isLoading}
              />
            </div>
            
            <SendButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !selectedProject}
            >
              <Send size={16} />
            </SendButton>
          </InputContainer>
        </InputArea>
      </MainContent>
    </AppContainer>
  );
}

export default App;
