import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Bot,
  User as UserIcon,
  Database,
  CheckCircle2,
  AlertCircle,
  Minimize2
} from 'lucide-react';
import { schoolService } from '../../services/schoolService';
import { User, UserRole } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  dataSources?: string[];
  suggestedFollowups?: string[];
  isError?: boolean;
}

export const CurosFloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(schoolService.getCurrentUser());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync auth state & listen for external open trigger
  useEffect(() => {
    const handleAuthChange = () => {
      const user = schoolService.getCurrentUser();
      setCurrentUser(user);
    };
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('auth-user-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('open-curos-ai', handleOpen);
    return () => {
      window.removeEventListener('auth-user-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('open-curos-ai', handleOpen);
    };
  }, []);

  // Fetch welcome message & suggested questions whenever user changes or modal opens
  useEffect(() => {
    let isMounted = true;
    schoolService.fetchCurosSuggestedQuestions().then(data => {
      if (!isMounted) return;
      setWelcomeMessage(data.welcome_message);
      setSuggestedQuestions(data.questions);
    }).catch(() => {
      if (!isMounted) return;
      setWelcomeMessage("Hello! I'm CUROS AI. I can help you with school information.");
    });
    return () => { isMounted = false; };
  }, [currentUser.role]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender,
        content: m.content
      }));

      const res = await schoolService.sendCurosMessage(text, history);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataSources: res.data_sources,
        suggestedFollowups: res.suggested_followups
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: err?.message || 'Sorry, I encountered an issue retrieving data from the database. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'TEACHER':
        return { label: 'Teacher', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'STUDENT':
        return { label: 'Student', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'PARENT':
        return { label: 'Parent', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: role, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  // Render text with basic markdown formatting
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm my-0.5">
            {formattedLine}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-sm my-0.5 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex items-center group pointer-events-auto animate-float-subtle">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open CUROS AI Assistant"
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 hover:from-indigo-800 hover:to-purple-700 text-white pl-4 pr-4 py-2.5 sm:py-3 rounded-full shadow-2xl hover:shadow-indigo-500/50 border-2 border-white transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-300 ring-offset-2"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white"></span>
              </span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight leading-none text-white">
                  CUROS AI
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              </div>
              <span className="text-[10px] text-indigo-100 font-medium mt-0.5 leading-none">
                Live School Database
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 overflow-hidden ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-5rem)]'
          }`}
          style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.35), 0 0 1px 1px rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                    CUROS AI
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200 mt-0.5 flex items-center gap-1 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Grounded in Live School Database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                {isMinimized ? <Sparkles className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
                {/* Welcome Card */}
                <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/80 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950">Welcome to CUROS AI</p>
                      <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                        {welcomeMessage}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 text-[10px] text-indigo-700 font-medium">
                        <Database className="w-3 h-3 text-indigo-600" />
                        <span>Querying real-time school records with role authorization</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested Questions */}
                {messages.length < 2 && suggestedQuestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">
                      Suggested Questions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          className="text-left text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300 shadow-2xs transition-all duration-150 leading-snug cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Bubble Thread */}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {msg.sender === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center shrink-0 text-xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                            : msg.isError
                            ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                            : 'bg-white text-gray-800 border border-gray-200/90 shadow-2xs rounded-bl-xs'
                        }`}
                      >
                        {msg.isError ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">{msg.content}</p>
                          </div>
                        ) : (
                          renderFormattedContent(msg.content)
                        )}

                        {/* Data sources pill */}
                        {msg.dataSources && msg.dataSources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>
                              Grounded in: {msg.dataSources.map(s => s.replace(/_/g, ' ')).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-8">
                      {msg.timestamp}
                    </span>

                    {/* Suggested follow-up buttons */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="mt-2 ml-8 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((f, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSendMessage(f)}
                            className="text-xs bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors text-left cursor-pointer"
                          >
                            👉 {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500 ml-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-gray-200 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-xs text-gray-500 ml-1 font-medium">Querying database...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-gray-200">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask about teachers, attendance, fees..."
                    disabled={isLoading}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 px-1">
                  <span>Enter to submit • Shift + Enter for newline</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Live DB
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
