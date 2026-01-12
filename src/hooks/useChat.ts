import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToChatMessages, 
  sendChatMessage as sendMessage, 
  markMessagesAsRead,
  getOrCreateChatRoom,
  type ChatMessage 
} from '../lib/firestore';
import { useAuth } from './useAuth';

export function useChat(chatId?: string) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);

  // Initialize chat room
  useEffect(() => {
    if (!user || !profile || currentChatId) return;

    const initializeChat = async () => {
      if (user && profile.role === 'resident') {
        // Get resident ID from profile
        // For now, use user ID as chat ID
        const chatId = `chat_${user.id}`;
        try {
          await getOrCreateChatRoom(user.id);
          setCurrentChatId(chatId);
        } catch (err: any) {
          console.error('Error initializing chat:', err);
          setError('Gagal memuat chat. Silakan refresh halaman.');
        }
      }
    };

    initializeChat();
  }, [user, profile, currentChatId]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentChatId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToChatMessages(currentChatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentChatId]);

  // Mark messages as read when user views them
  useEffect(() => {
    if (!currentChatId || !user) return;

    const unreadMessages = messages.filter(
      msg => !msg.read && msg.senderId !== user.id
    );

    if (unreadMessages.length > 0) {
      markMessagesAsRead(currentChatId, user.id).catch(err => {
        console.error('Error marking messages as read:', err);
      });
    }
  }, [messages, currentChatId, user]);

  const sendMessageHandler = useCallback(async (message: string) => {
    if (!currentChatId || !user || !profile || !message.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendMessage(
        currentChatId,
        user.id,
        profile.full_name || profile.email || 'User',
        profile.role === 'admin' ? 'admin' : 'resident',
        message.trim()
      );
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Gagal mengirim pesan. Silakan coba lagi.');
      throw err;
    } finally {
      setSending(false);
    }
  }, [currentChatId, user, profile]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage: sendMessageHandler,
    chatId: currentChatId,
  };
}

