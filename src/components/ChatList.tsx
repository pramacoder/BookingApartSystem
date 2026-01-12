import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { getAllChatRooms, subscribeToChatMessages, type ChatRoom } from '../lib/firestore';

interface ChatListProps {
  onSelectChat?: (chatId: string, residentName: string) => void;
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const rooms = await getAllChatRooms();
      setChatRooms(rooms);
    } catch (err: any) {
      console.error('Error loading chat rooms:', err);
      setError('Gagal memuat daftar chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat: ChatRoom) => {
    if (chat.id) {
      setSelectedChatId(chat.id);
      if (onSelectChat) {
        onSelectChat(chat.id, chat.residentName || 'Resident');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-text-secondary">Belum ada chat</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chatRooms.map((chat) => {
        const lastMessageTime = chat.lastMessageAt instanceof Date
          ? chat.lastMessageAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : chat.lastMessageAt
          ? new Date(chat.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <button
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              selectedChatId === chat.id
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {chat.residentName?.charAt(0).toUpperCase() || 'R'}
                  </span>
                </div>
                <div>
                  <h4 className="text-primary font-medium">{chat.residentName || 'Resident'}</h4>
                  {chat.adminName && (
                    <p className="text-xs text-text-secondary">Chat dengan admin</p>
                  )}
                </div>
              </div>
              {chat.unreadCount && chat.unreadCount > 0 && (
                <span className="badge badge-error">{chat.unreadCount}</span>
              )}
            </div>
            
            {chat.lastMessage && (
              <div className="ml-13">
                <p className="text-sm text-text-secondary truncate mb-1">{chat.lastMessage}</p>
                {lastMessageTime && (
                  <p className="text-xs text-text-secondary">{lastMessageTime}</p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

