import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Send, Plus, MessageSquare, 
  Settings, LogOut, User, Menu, X, AlertCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../utils/api';
import gsap from 'gsap'; // Import GSAP for the modal animation

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullAiResponse, setFullAiResponse] = useState('');
  
  // --- NEW STATE FOR LOGOUT MODAL ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const modalRef = useRef(null); // Ref for modal animation

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, []);

  // --- GSAP ANIMATION FOR MODAL ---
  useEffect(() => {
    if (showLogoutModal && modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [showLogoutModal]);

  // Typing animation effect
  useEffect(() => {
    if (isTyping && fullAiResponse) {
      const words = fullAiResponse.split(' ');
      let currentWordIndex = 0;
      setTypingText('');

      typingIntervalRef.current = setInterval(() => {
        if (currentWordIndex < words.length) {
          setTypingText(prev => prev + (prev ? ' ' : '') + words[currentWordIndex]);
          currentWordIndex++;
          scrollToBottom();
        } else {
          // Typing complete
          clearInterval(typingIntervalRef.current);
          setMessages(prev => [...prev, { sender: 'ai', content: fullAiResponse, timestamp: new Date() }]);
          setIsTyping(false);
          setTypingText('');
          setFullAiResponse('');
        }
      }, 60); 

      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      };
    }
  }, [isTyping, fullAiResponse]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const data = await chatAPI.getChatHistory();
      setChatHistory(data.chats || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const createNewChat = async () => {
    try {
      const data = await chatAPI.createNewChat();
      setCurrentChatId(data.chat._id);
      setMessages([]);
      await loadChatHistory(); 
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const data = await chatAPI.getChatMessages(chatId);
      setMessages(data.messages || []);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    if (!currentChatId) {
      try {
        const data = await chatAPI.createNewChat();
        setCurrentChatId(data.chat._id);
        await sendMessageToChat(data.chat._id, input.trim());
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    } else {
      await sendMessageToChat(currentChatId, input.trim());
    }
  };

  const sendMessageToChat = async (chatId, content) => {
    const userMessageContent = content;
    setInput('');
    setLoading(true);

    const optimisticUserMsg = {
      sender: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const data = await chatAPI.sendMessage(chatId, userMessageContent);
      
      setMessages(prev => {
        const withoutOptimistic = prev.slice(0, -1);
        return [...withoutOptimistic, data.userMessage];
      });

      setFullAiResponse(data.aiMessage.content);
      setIsTyping(true);

      await loadChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.slice(0, -1));
      
      const errorMsg = {
        sender: 'ai',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED LOGOUT LOGIC ---
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden selection:bg-emerald-500 selection:text-black relative">
      
      {/* --- CUSTOM LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="bg-[#151515] border border-gray-800 p-6 md:p-8 rounded-2xl w-[90%] max-w-sm shadow-2xl relative"
          >
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to end your session? Your chat history will be saved.
              </p>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all text-sm shadow-lg shadow-red-900/20"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/80 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* --- SIDEBAR (History) --- */}
      <aside 
        className={`fixed md:relative z-50 w-72 h-full bg-[#0f0f0f] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
            <HeartPulse className="w-6 h-6 text-emerald-400" />
            <span className="font-bold tracking-wide">VitalMind</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 rounded-lg transition-colors text-sm text-gray-200"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            New Diagnosis
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
          {loadingHistory ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading...</div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No chat history yet</div>
          ) : (
            chatHistory.map((chat) => (
              <button 
                key={chat._id} 
                onClick={() => loadChatMessages(chat._id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm ${
                  currentChatId === chat._id ? 'bg-[#1a1a1a] text-emerald-400' : 'text-gray-400'
                } hover:bg-[#1a1a1a] hover:text-emerald-400 rounded-md transition-all group truncate`}
              >
                <MessageSquare className="w-4 h-4 min-w-[16px]" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))
          )}
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded bg-emerald-900/50 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">Free Plan</p>
            </div>
            {/* UPDATED LOGOUT BUTTON CLICK HANDLER */}
            <button onClick={handleLogoutClick} title="Logout">
              <LogOut className="w-4 h-4 text-gray-500 hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative h-full w-full">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-4 flex items-center gap-4 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500 font-medium">VitalMind AI - Health Assistant</span>
        </div>

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl text-center space-y-8 mt-10 md:mt-0">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                 <HeartPulse className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light">
                How can I help, <span className="font-serif italic text-emerald-400">{user?.username || 'there'}?</span>
              </h1>
              <p className="text-gray-500 text-sm max-w-md">
                I'm your AI health assistant. Ask me about symptoms, wellness tips, healthy habits, or general health questions.
              </p>
            </div>
          ) : (
            /* Messages List */
            <div className="w-full max-w-3xl space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-emerald-400 text-black' 
                      : 'bg-[#1a1a1a] text-white border border-gray-800'
                  } rounded-2xl px-5 py-3`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {/* Typing animation */}
              {isTyping && typingText && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] text-white border border-gray-800 rounded-2xl px-5 py-3">
                    <p className="text-sm md:text-base whitespace-pre-wrap">
                      {typingText}
                      <span className="inline-block w-[2px] h-4 bg-emerald-400 ml-1 animate-pulse"></span>
                    </p>
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl px-5 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 z-30">
          <form onSubmit={handleSendMessage}>
            <div className="relative flex items-end gap-2 bg-[#1a1a1a] border border-gray-700/50 rounded-2xl p-2 md:p-3 shadow-lg focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your health..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 text-sm md:text-base resize-none max-h-32 min-h-[44px] py-3 px-2 focus:ring-0 scrollbar-hide"
                rows={1}
                disabled={loading}
              />

              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  input.trim() && !loading
                    ? 'bg-emerald-400 text-black hover:bg-emerald-300 cursor-pointer' 
                    : 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <p className="text-center text-[10px] md:text-xs text-gray-600 mt-3">
            VitalMind can make mistakes. Consider checking important medical information.
          </p>
        </div>

      </main>
    </div>
  );
};

export default ChatPage;