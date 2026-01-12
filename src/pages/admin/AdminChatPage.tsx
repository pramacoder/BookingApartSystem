import React, { useState } from 'react';
import { ChatWindow } from '../../components/ChatWindow';
import { ChatList } from '../../components/ChatList';

export function AdminChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedResidentName, setSelectedResidentName] = useState<string>('');

  const handleSelectChat = (chatId: string, residentName: string) => {
    setSelectedChatId(chatId);
    setSelectedResidentName(residentName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-primary mb-2">Chat Management</h2>
        <p className="text-text-secondary">Kelola percakapan dengan residents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1 card p-4 overflow-y-auto">
          <h3 className="text-primary mb-4">Daftar Chat</h3>
          <ChatList onSelectChat={handleSelectChat} />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedChatId ? (
            <ChatWindow 
              chatId={selectedChatId} 
              residentName={selectedResidentName}
              adminName="Admin"
            />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-text-secondary">Pilih chat dari daftar untuk memulai percakapan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

