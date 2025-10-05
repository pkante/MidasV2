import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const className = 'chat-shell';
    const root = document.getElementById('root');

    document.body.classList.add(className);
    root?.classList.add(className);

    return () => {
      document.body.classList.remove(className);
      root?.classList.remove(className);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = () => {
    window.electronAPI?.closeChat();
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = input.trim();
      
      // Add user message with unique ID
      const userMessageId = Date.now();
      setMessages(prev => [...prev, { 
        id: userMessageId, 
        text: userMessage, 
        sender: 'user' 
      }]);
      setInput('');
      setIsLoading(true);

      // Create a new streaming message with unique ID
      const streamingMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        thinking: '',
        text: '',
        sender: 'ai',
        isStreaming: true,
        thinkingComplete: false,
        timestamp: new Date().toISOString(),
      }]);

      try {
        console.log('🚀 Starting streaming to Gemini...');
        
        const cleanup = window.electronAPI.sendToGeminiStream(userMessage, (chunk) => {
          console.log('📥 Received chunk:', chunk.type);
          
          if (chunk.type === 'thinking') {
            // Append to thinking
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, thinking: msg.thinking + chunk.content }
                : msg
            ));
          } else if (chunk.type === 'thinking_complete') {
            // Mark thinking as complete
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, thinkingComplete: true }
                : msg
            ));
          } else if (chunk.type === 'answer') {
            // Append to answer
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, text: msg.text + chunk.content }
                : msg
            ));
          } else if (chunk.type === 'done') {
            // Mark streaming as complete
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, isStreaming: false }
                : msg
            ));
            setIsLoading(false);
            cleanup();
          } else if (chunk.type === 'error') {
            // Handle error
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { 
                    ...msg, 
                    text: `❌ Error: ${chunk.error}`, 
                    isError: true, 
                    isStreaming: false 
                  }
                : msg
            ));
            setIsLoading(false);
            cleanup();
          }
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId 
            ? { 
                ...msg, 
                text: '❌ Failed to send message. Please try again.', 
                isError: true, 
                isStreaming: false 
              }
            : msg
        ));
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full bg-black/70 rounded-3xl shadow-glass-lg border-gradient flex flex-col relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 glass-noise pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div
        className="relative px-6 py-4 border-b glass-border flex items-center justify-between z-10"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <h2 className="text-white text-lg font-medium tracking-glass text-glass">Midas</h2>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="relative flex-1 overflow-y-auto p-6 space-y-4 glass-scrollbar z-10 isolate">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-center text-sm tracking-glass">Start a conversation with Midas</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-panel px-4 py-3 rounded-2xl border glass-border shadow-glass-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative p-4 border-t glass-border z-10">
        <div className="flex items-center space-x-2">
          {/* Image Upload Button */}
          <button
            className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            title="Upload Image (Coming Soon)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Voice Input Button */}
          <button
            className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            title="Voice Input (Coming Soon)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 glass-panel text-white px-4 py-3 rounded-xl glass-border focus:outline-none focus:border-white/30 placeholder-white/40 transition-all tracking-glass text-glass"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`glass-panel-strong border-gradient p-3 rounded-xl transition-all duration-200 shadow-glass hover:shadow-glass-lg hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component with Markdown and Collapsible CoT
function MessageBubble({ message }) {
  const [showThinking, setShowThinking] = useState(false);

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="message-bubble-user border-gradient shadow-glass px-4 py-3 rounded-2xl max-w-[80%] text-white font-normal tracking-glass">
          {message.text}
        </div>
      </div>
    );
  }

  // AI message with markdown rendering and collapsible thinking
  return (
    <div className="flex justify-start">
      <div className="message-bubble text-white/90 glass-border shadow-glass-sm px-4 py-3 rounded-2xl max-w-[80%]">
        {message.isError ? (
          <p className="text-red-400">{message.text}</p>
        ) : (
          <>
            {/* Answer Section */}
            {message.text && (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg text-sm"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm border glass-border" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-1"></span>
                )}
              </div>
            )}

            {/* Chain of Thought Reasoning - Collapsible Dropdown */}
            {message.thinking && (
              <div className="mt-3 pt-3 border-t glass-border">
                <button
                  onClick={() => setShowThinking(!showThinking)}
                  className="flex items-center space-x-2 text-white/50 hover:text-white text-sm transition-colors w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${showThinking ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>🧠 {showThinking ? 'Hide' : 'Show'} Reasoning</span>
                  {message.isStreaming && !message.thinkingComplete && (
                    <span className="inline-block w-1 h-3 bg-white/60 animate-pulse ml-2"></span>
                  )}
                </button>
                
                {showThinking && (
                  <div className="mt-3 p-3 bg-black/20 rounded-lg text-sm text-white/70 italic font-light border glass-border">
                    <pre className="whitespace-pre-wrap font-sans overflow-auto max-h-96">{message.thinking}</pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
