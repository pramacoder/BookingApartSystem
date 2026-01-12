/**
 * Firebase Firestore Schema Types
 * 
 * This file defines the TypeScript types for Firestore collections
 * to ensure type safety when working with Firebase data.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// CHAT SCHEMA
// ============================================

export interface ChatRoomDocument {
  residentId: string;
  residentName?: string;
  adminId?: string | null;
  adminName?: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  unreadCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessageDocument {
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'resident' | 'admin';
  message: string;
  timestamp: Timestamp;
  read: boolean;
  readAt?: Timestamp;
}

// ============================================
// NOTIFICATION SCHEMA
// ============================================

export type NotificationType = 
  | 'unit_assigned' 
  | 'key_pickup' 
  | 'payment' 
  | 'ticket' 
  | 'announcement' 
  | 'system';

export interface NotificationDocument {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// COLLECTION PATHS
// ============================================

export const FIRESTORE_COLLECTIONS = {
  CHATS: 'chats',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Helper functions to construct collection/document paths
 */
export const getChatPath = (chatId: string) => `chats/${chatId}`;
export const getMessagesPath = (chatId: string) => `chats/${chatId}/messages`;
export const getNotificationsPath = (userId: string) => `notifications/${userId}/notifications`;
export const getNotificationPath = (userId: string, notificationId: string) => 
  `notifications/${userId}/notifications/${notificationId}`;

