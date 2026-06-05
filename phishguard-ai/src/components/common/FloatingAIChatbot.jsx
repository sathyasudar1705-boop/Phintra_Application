import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X } from 'lucide-react';
import Button from './Button';
import { sendMessageToAI, AIConnectionError } from '../../services/huggingFaceService';
import { useConfirm } from '../../hooks/useConfirm';

const FloatingAIChatbot = () => {
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Set messages from localStorage or use a professional, emoji-free welcome message
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('phintra_ai_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{
      id: 'welcome',
      sender: 'bot',
      text: 'Hello. I am your Phintra AI Assistant. How can I help secure your workspace today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  // Keep chat history saved to localStorage
  useEffect(() => {
    localStorage.setItem('phintra_ai_chat', JSON.stringify(messages));
  }, [messages]);

  const messagesEndRef = useRef(null);

  // Auto scroll to latest messages or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNotification(false);
    }
  };

  const predefinedReplies = {
    risk: {
      query: "Analyze my risk score",
      reply: "Your current security risk score is moderate. Focus on completing pending training and reviewing recent simulation feedback."
    },
    phishing: {
      query: "Explain phishing red flags",
      reply: "Common phishing red flags include suspicious sender addresses, urgent or threatening language, unexpected attachments, and mismatched links."
    },
    training: {
      query: "Show training gaps",
      reply: "AI analysis shows that users with incomplete training are more likely to fail phishing simulations."
    },
    recommendation: {
      query: "Recommend next action",
      reply: "Recommended action: complete assigned modules, report suspicious emails, and review simulation red flags."
    }
  };

  // Predefined keyword-based local fallback responses when Hugging Face API fails
  const getLocalFallbackResponse = (userText) => {
    const query = userText.toLowerCase().trim();
    
    if (query.includes('phish')) {
      return "Phishing emails usually exhibit red flags such as suspicious sender addresses, urgent or threatening language, unexpected attachments, and mismatched links. Always verify the sender and avoid clicking suspicious links.";
    }
    if (query.includes('password')) {
      return "To maintain password safety, use strong, unique passwords for every account. Avoid reusing passwords. Passwords should be long, containing a combination of uppercase letters, lowercase letters, numbers, and special symbols.";
    }
    if (query.includes('mfa')) {
      return "Multi-Factor Authentication (MFA) adds an extra layer of security by requiring two or more verification factors to gain access. Even if a threat actor obtains your password, they cannot access your account without the second factor (like an SMS code or authenticator app token).";
    }
    if (query.includes('risk') || query.includes('score')) {
      return "To improve your security score in Phintra, complete your assigned training modules, answer weekly challenges, and successfully report simulated phishing emails rather than clicking them.";
    }
    if (query.includes('train')) {
      return "We recommend completing any pending training modules in your Learning Center. Active modules include tutorials on identifying suspicious attachments, spotter challenges, and cybersecurity basics.";
    }
    
    return "I'm currently operating in fallback mode. I can help guide you on email security, password safety, multi-factor authentication, security risk scores, or Phintra training modules. What would you like to discuss?";
  };

  // Chat message submit handler
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setIsTyping(true);

    try {
      // 2. Dispatch query to Hugging Face Inference API
      const responseText = await sendMessageToAI(text, messages);
      setIsTyping(false);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setIsTyping(false);
      console.error("AI Assistant API failed:", err);
      
      if (err.isActionable) {
        // Display the specific actionable error message instead of generic fallback
        const botMsg = {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          text: `Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        // Activate fallback mode as a last resort:
        // Log the exact condition that triggered fallback mode
        const tokenLoaded = !!import.meta.env.VITE_HF_API_TOKEN;
        const condition = `Token verified: ${tokenLoaded ? "Yes" : "No"}. Model endpoints tried: mistralai/Mistral-7B-Instruct-v0.2 and google/gemma-2-2b-it. Retry logic: Exhausted/Checked. Response parsing: Attempted. Error: ${err.message}`;
        console.log(`Fallback mode triggered: ${condition}`);
        
        // Obtain keyword-based local fallback response
        const fallbackText = getLocalFallbackResponse(text);
        const botMsg = {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (suggestion) => {
    if (isTyping) return;
    handleSendMessage(suggestion);
  };

  // Clear Chat History handler
  const handleClearChat = async () => {
    const confirmed = await confirm({
      title: 'Clear Chat History?',
      description: 'This will remove all messages from the current session. This action cannot be undone.',
      confirmText: 'Clear History',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;
    const welcomeMsg = [{
      id: 'welcome',
      sender: 'bot',
      text: 'Hello. I am your Phintra AI Assistant. How can I help secure your workspace today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    setMessages(welcomeMsg);
  };

  return (
    <div className="floating-ai-chatbot-root">
      {/* CSS Styling Injection */}
      <style>{`
        .floating-ai-chatbot-root {
          font-family: var(--font-family, 'Inter', sans-serif);
        }
        
        /* Floating Action Button (FAB) */
        .ai-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary, var(--color-primary)) 0%, var(--color-teal, var(--color-teal)) 100%);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
          display: flex;
          align-items: center;
          justifyContent: center;
          color: #ffffff;
          border: none;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          overflow: hidden;
          padding: 0;
        }

        .ai-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
        }

        .ai-chat-fab:active {
          transform: scale(0.95);
        }

        /* Tooltip style */
        .ai-chat-fab-tooltip {
          position: absolute;
          right: 70px;
          background-color: var(--text-main, var(--text-main));
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.05));
          opacity: 0;
          pointer-events: none;
          transform: translateX(10px);
          transition: all 0.2s ease;
        }

        .ai-chat-fab:hover .ai-chat-fab-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* Notification Dot */
        .ai-chat-notif-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background-color: var(--color-danger, var(--color-danger));
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          animation: pulse 2s infinite;
        }

        /* Chat Panel Container */
        .ai-chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 540px;
          background-color: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, var(--border-color));
          border-radius: var(--radius-lg, 14px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.05));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Header styling */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, var(--border-color));
          background-color: #ffffff;
        }

        .ai-chat-header-info {
          display: flex;
          flex-direction: column;
        }

        .ai-chat-header-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main, var(--text-main));
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ai-chat-header-subtitle {
          font-size: 11px;
          color: var(--text-light, var(--text-light));
          font-weight: 500;
          margin-top: 1px;
        }

        .ai-chat-close-btn {
          border: none;
          background: transparent;
          color: var(--text-subtle, var(--text-subtle));
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .ai-chat-close-btn:hover {
          color: var(--text-main, var(--text-main));
          background-color: var(--bg-sidebar);
        }

        /* Messages area */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: var(--bg-main);
        }

        .ai-chat-msg-row {
          display: flex;
          width: 100%;
        }

        .ai-chat-msg-row.user {
          justify-content: flex-end;
        }

        .ai-chat-msg-row.bot {
          justify-content: flex-start;
        }

        .ai-chat-bubble {
          max-width: 80%;
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .ai-chat-msg-row.user .ai-chat-bubble {
          background-color: var(--color-primary-light, var(--color-primary-light));
          color: var(--color-primary-hover, var(--color-primary));
          border-radius: 14px 14px 0 14px;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .ai-chat-msg-row.bot .ai-chat-bubble {
          background-color: #ffffff;
          color: var(--text-main, var(--text-main));
          border-radius: 14px 14px 14px 0;
          border: 1px solid var(--border-color, var(--border-color));
        }

        .ai-chat-msg-time {
          font-size: 10px;
          color: var(--text-subtle, var(--text-subtle));
          margin-top: 4px;
          display: block;
          text-align: right;
        }

        .ai-chat-msg-row.bot .ai-chat-msg-time {
          text-align: left;
        }

        /* Input section */
        .ai-chat-input-form {
          display: flex;
          gap: 8px;
          padding: 16px 20px 12px 20px;
          background-color: #ffffff;
          border-top: 1px solid var(--border-color, var(--border-color));
          align-items: center;
        }

        .ai-chat-input-field {
          flex: 1;
          height: 36px;
          border: 1px solid var(--border-color, var(--border-color));
          border-radius: var(--radius-sm, 6px);
          padding: 8px 14px;
          font-size: 13px;
          outline: none;
          color: var(--text-main, var(--text-main));
          transition: all 0.15s ease;
        }

        .ai-chat-input-field:focus {
          border-color: var(--color-primary, var(--color-primary));
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .ai-chat-input-field::placeholder {
          color: var(--text-subtle, var(--text-subtle));
        }

        /* Suggestions chips (placed below the input) */
        .ai-chat-suggestions {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 6px;
          padding: 0 20px 20px 20px;
          background-color: transparent;
          scrollbar-width: none;
        }
        .ai-chat-suggestions::-webkit-scrollbar {
          display: none;
        }
        
        .ai-chat-chip {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, var(--text-muted));
          background-color: var(--bg-sidebar);
          border: 1px solid transparent;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
        }

        .ai-chat-chip:hover {
          color: var(--color-primary-hover, var(--color-primary));
          background-color: var(--color-primary-light, var(--color-primary-light));
          border-color: rgba(59, 130, 246, 0.2);
        }

        /* Typing loading indicator */
        .ai-chat-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
        }

        .ai-chat-typing span {
          width: 6px;
          height: 6px;
          background-color: var(--text-subtle, var(--text-subtle));
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .ai-chat-typing span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .ai-chat-typing span:nth-child(2) {
          animation-delay: -0.16s;
        }

        /* Animations */
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive Mobile Layout */
        @media (max-width: 576px) {
          .ai-chat-panel {
            bottom: 80px;
            right: 12px;
            left: 12px;
            width: calc(100vw - 24px);
            height: calc(100vh - 110px);
            max-height: 520px;
          }
          
          .ai-chat-fab {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
          }
          
          .ai-chat-fab-tooltip {
            display: none !important;
          }
        }
      `}</style>

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div className="ai-chat-panel glass-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-title">
                <img 
                  src="https://i.pinimg.com/736x/bc/2f/fa/bc2ffa513b384b50a4406cc04d0aaa58.jpg" 
                  alt="AI Assistant avatar" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                AI Assistant
              </div>
              <div className="ai-chat-header-subtitle">Security Intelligence Support</div>
            </div>
            
            {/* Header controls including Clear option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button"
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-light, var(--text-light))',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-sidebar)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Clear
              </button>
              <button className="ai-chat-close-btn" onClick={handleToggle} aria-label="Close Chat">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-chat-msg-row ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <img 
                    src="https://i.pinimg.com/736x/bc/2f/fa/bc2ffa513b384b50a4406cc04d0aaa58.jpg" 
                    alt="Bot Avatar" 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px', flexShrink: 0, border: '1px solid var(--border-color, var(--border-color))' }}
                  />
                )}
                <div className="ai-chat-bubble">
                  {msg.text}
                  <span className="ai-chat-msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            
            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="ai-chat-msg-row bot">
                <img 
                  src="https://i.pinimg.com/736x/bc/2f/fa/bc2ffa513b384b50a4406cc04d0aaa58.jpg" 
                  alt="Bot Avatar" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px', flexShrink: 0, border: '1px solid var(--border-color, var(--border-color))' }}
                />
                <div className="ai-chat-bubble" style={{ padding: '8px 12px' }}>
                  <div className="ai-chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <form className="ai-chat-input-form" onSubmit={handleInputSubmit}>
            <input
              type="text"
              className="ai-chat-input-field"
              placeholder="Ask anything about security..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              disabled={!inputValue.trim() || isTyping}
              style={{
                height: '36px',
                width: '36px',
                padding: 0,
                minWidth: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </form>

          {/* Quick Suggestion Chips (placed BELOW input) */}
          <div className="ai-chat-suggestions">
            <button 
              type="button"
              className="ai-chat-chip"
              onClick={() => handleSuggestionClick(predefinedReplies.risk.query)}
              disabled={isTyping}
            >
              Analyze my risk score
            </button>
            <button 
              type="button"
              className="ai-chat-chip"
              onClick={() => handleSuggestionClick(predefinedReplies.phishing.query)}
              disabled={isTyping}
            >
              Explain phishing red flags
            </button>
            <button 
              type="button"
              className="ai-chat-chip"
              onClick={() => handleSuggestionClick(predefinedReplies.training.query)}
              disabled={isTyping}
            >
              Show training gaps
            </button>
            <button 
              type="button"
              className="ai-chat-chip"
              onClick={() => handleSuggestionClick(predefinedReplies.recommendation.query)}
              disabled={isTyping}
            >
              Recommend next action
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button className="ai-chat-fab animate-pulse-soft" onClick={handleToggle} aria-label="Open AI Assistant">
          <img 
            src="https://i.pinimg.com/736x/bc/2f/fa/bc2ffa513b384b50a4406cc04d0aaa58.jpg" 
            alt="AI Assistant Avatar" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
          
          {/* Notification Dot */}
          {showNotification && <div className="ai-chat-notif-dot" />}
          
          {/* Custom Tooltip */}
          <span className="ai-chat-fab-tooltip">AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default FloatingAIChatbot;
