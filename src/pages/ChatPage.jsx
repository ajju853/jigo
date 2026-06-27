import React, { useEffect, useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Send, Search, Circle, Smile, Paperclip, MessageSquare } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useChatStore from '../stores/chatStore';
import useToastStore from '../stores/toastStore';
import { userAPI } from '../api/client';
import Spinner from '../components/ui/Spinner';

export const ChatPage = () => {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversation,
    isTyping,
    isLoading,
    fetchConversations,
    setActiveConversation,
    sendMessage
  } = useChatStore();
  const { addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation, setActiveConversation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;
    try {
      const text = inputText;
      setInputText('');
      const receiverId = activeConversation.otherUserId ||
        (activeConversation.participants && Object.keys(activeConversation.participants).find(id => id !== user.id));
      if (receiverId) {
        await sendMessage(receiverId, text);
      }
    } catch (err) {
      addToast("Failed to send message.", "error");
    }
  };

  const getRecipientInfo = (conv) => {
    if (!conv || !user) return { name: "Companion", photo: "", online: false };
    const recipientId = conv.otherUserId ||
      (conv.participants && Object.keys(conv.participants).find(id => id !== user.id));
    return (recipientId && conv.participants?.[recipientId]) || { name: "Companion", photo: "", online: false };
  };

  const filteredConversations = conversations.filter(c => {
    const info = getRecipientInfo(c);
    return info.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="h-[80vh] grid grid-cols-1 md:grid-cols-12 glass-panel border border-white/10 overflow-hidden">
        <aside className="col-span-1 md:col-span-4 border-r border-white/5 flex flex-col h-full bg-darkBg/30">
          <div className="p-4 border-b border-white/5 space-y-3">
            <h2 className="text-lg font-heading font-bold text-white">Conversations</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Spinner className="w-6 h-6 text-brandIndigo" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No active chats.</p>
            ) : (
              filteredConversations.map(c => {
                const info = getRecipientInfo(c);
                const isActive = activeConversation?.id === c.id || activeConversation?.conversationId === c.conversationId;
                return (
                  <button
                    key={c.id || c.conversationId}
                    onClick={() => setActiveConversation(c)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={info.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={info.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white/5"
                      />
                      {info.online && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-emerald-500 text-darkBg border-2 border-darkBg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-brandIndigo' : 'text-white'}`}>{info.name}</h4>
                        <span className="text-[9px] text-slate-500 whitespace-nowrap">
                          {c.lastUpdated ? new Date(c.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate leading-relaxed">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && !isActive && (
                      <span className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-brandIndigo text-[9px] font-bold text-white flex items-center justify-center shadow-neon-indigo">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="col-span-1 md:col-span-8 flex flex-col h-full bg-black/5">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-darkBg/20">
                <div className="flex items-center gap-3">
                  <img
                    src={getRecipientInfo(activeConversation).photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={getRecipientInfo(activeConversation).name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{getRecipientInfo(activeConversation).name}</h3>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Circle className={`w-2 h-2 ${getRecipientInfo(activeConversation).online ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-600 text-slate-600'}`} />
                      {getRecipientInfo(activeConversation).online ? 'Active Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(activeConversation.messages || []).map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex gap-2.5 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      {!isMe && (
                        <img src={getRecipientInfo(activeConversation).photo} alt="" className="w-7 h-7 rounded-lg object-cover self-end flex-shrink-0" />
                      )}
                      <div className="space-y-1">
                        <div className={`p-3 text-xs leading-relaxed rounded-2xl ${isMe ? 'bg-gradient-to-r from-brandIndigo to-brandPurple text-white rounded-br-none shadow-md' : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'}`}>
                          {msg.content || msg.text}
                        </div>
                        <span className={`block text-[9px] text-slate-500 ${isMe ? 'text-right' : ''}`}>
                          {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex gap-2.5 max-w-[70%] mr-auto items-end">
                    <img src={getRecipientInfo(activeConversation).photo} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-darkBg/20 flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      addToast("File attachments are coming soon!", "info");
                    }
                    e.target.value = '';
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo"
                />
                <div className="relative">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50">
                      <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                      <div className="relative">
                        <EmojiPicker onEmojiClick={(e) => { setInputText(prev => prev + e.emoji); setShowEmojiPicker(false); }} />
                      </div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!inputText.trim()} className="p-2.5 rounded-xl bg-gradient-to-r from-brandIndigo to-brandPurple text-white hover:shadow-neon-indigo disabled:opacity-50 transition-all flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
              <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">Select a conversation to start messaging.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
