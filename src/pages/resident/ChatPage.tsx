import React, { useEffect, useState } from 'react';
import { ChatWindow } from '../../components/ChatWindow';
import { useAuth } from '../../hooks/useAuth';
import { getResidentId } from '../../lib/database';
import { getOrCreateChatRoom } from '../../lib/firestore';
import { Loader2 } from 'lucide-react';

export function ChatPage() {
  const { user, profile } = useAuth();
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      if (!user || profile?.role !== 'resident') {
        setLoading(false);
        return;
      }

      try {
        // Get resident ID
        const residentId = await getResidentId(user.id);
        if (!residentId) {
          setLoading(false);
          return;
        }

        // Create or get chat room
        const id = await getOrCreateChatRoom(residentId);
        setChatId(id);
      } catch (err: any) {
        console.error('Error initializing chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-primary mb-2">Chat dengan Admin</h2>
        <p className="text-text-secondary">Kirim pesan kepada admin untuk pertanyaan atau bantuan</p>
      </div>

      <div className="card p-0 h-[600px] overflow-hidden">
        {chatId ? (
          <ChatWindow chatId={chatId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">Gagal memuat chat. Silakan refresh halaman.</p>
          </div>
        )}
      </div>
    </div>
  );
}

