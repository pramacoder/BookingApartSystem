import React from 'react';
import { CheckCircle, CheckCheck } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;
  const formattedTime = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isOwnMessage ? 'bg-primary' : 'bg-secondary'
      }`}>
        <span className="text-white text-sm font-semibold">
          {message.senderName.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwnMessage && (
          <span className="text-xs text-text-secondary mb-1">{message.senderName}</span>
        )}
        <div className={`rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-gray-100 text-text-primary rounded-tl-none'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-text-secondary ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}>
          <span>{formattedTime}</span>
          {isOwnMessage && (
            <span>
              {message.read ? (
                <CheckCheck className="w-3 h-3 text-primary" />
              ) : (
                <CheckCircle className="w-3 h-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

