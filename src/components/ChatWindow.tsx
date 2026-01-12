import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  chatId?: string;
  residentName?: string;
  adminName?: string;
}

export function ChatWindow({ chatId, residentName, adminName }: ChatWindowProps) {
  const { messages, loading, sending, error, sendMessage } = useChat(chatId);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(messageToSend);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      // Error is already handled in useChat hook
      setInputMessage(messageToSend); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">
              {residentName || adminName || 'Chat'}
            </h3>
            {residentName && adminName && (
              <p className="text-sm text-tertiary">Admin Chat</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-text-secondary">Belum ada pesan</p>
            <p className="text-sm text-text-secondary mt-1">Mulai percakapan dengan mengirim pesan</p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage key={message.id || `${message.timestamp}-${message.senderId}`} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSend} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            rows={2}
            className="flex-1 resize-none input-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Kirim
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

