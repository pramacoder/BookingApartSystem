import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  setDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db, isValidConfig } from './firebase';

// Types for Firestore collections
export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'resident' | 'admin';
  message: string;
  timestamp: Date | Timestamp;
  read: boolean;
  readAt?: Date | Timestamp;
}

export interface ChatRoom {
  id?: string;
  residentId: string;
  residentName: string;
  adminId?: string;
  adminName?: string;
  lastMessage?: string;
  lastMessageAt?: Date | Timestamp;
  unreadCount?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'unit_assigned' | 'key_pickup' | 'payment' | 'ticket' | 'announcement' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
}

// ============================================
// CHAT FUNCTIONS
// ============================================

/**
 * Get or create chat room between resident and admin
 */
export async function getOrCreateChatRoom(residentId: string, adminId?: string): Promise<string> {
  if (!isValidConfig || !db) {
    throw new Error('Firebase not configured');
  }

  try {
    // For now, use a simple chat ID format: chat_{residentId}
    // Admin can view all resident chats
    const chatId = `chat_${residentId}`;
    
    // Check if chat room exists
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      // Create new chat room
      await setDoc(chatRef, {
        residentId,
        adminId: adminId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return chatId;
  } catch (error) {
    console.error('Error getting/creating chat room:', error);
    throw error;
  }
}

/**
 * Send a message in a chat
 */
export async function sendChatMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  senderRole: 'resident' | 'admin',
  message: string
): Promise<string> {
  if (!isValidConfig || !db) {
    throw new Error('Firebase not configured');
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesRef, {
      chatId,
      senderId,
      senderName,
      senderRole,
      message,
      read: senderRole === 'admin', // Admin messages are auto-read
      timestamp: serverTimestamp(),
    });

    // Update chat room last message
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Get chat messages for a chat room
 */
export async function getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
  if (!isValidConfig || !db) {
    return [];
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        readAt: data.readAt?.toDate(),
      } as ChatMessage);
    });
    
    // Reverse to get chronological order
    return messages.reverse();
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
}

/**
 * Listen to chat messages in real-time
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  if (!isValidConfig || !db) {
    return () => {}; // Return empty unsubscribe function
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          readAt: data.readAt?.toDate(),
        } as ChatMessage);
      });
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to chat messages:', error);
    return () => {};
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  if (!isValidConfig || !db) {
    return;
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, where('senderId', '!=', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map((docSnapshot) => {
      return updateDoc(docSnapshot.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

/**
 * Get all chat rooms (for admin)
 */
export async function getAllChatRooms(): Promise<ChatRoom[]> {
  if (!isValidConfig || !db) {
    return [];
  }

  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const chatRooms: ChatRoom[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chatRooms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as ChatRoom);
    });
    
    return chatRooms;
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    return [];
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<string> {
  if (!isValidConfig || !db) {
    throw new Error('Firebase not configured');
  }

  try {
    const notificationsRef = collection(db, 'notifications', userId, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  if (!isValidConfig || !db) {
    return [];
  }

  try {
    const notificationsRef = collection(db, 'notifications', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        readAt: data.readAt?.toDate(),
      } as Notification);
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}

/**
 * Listen to user notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  if (!isValidConfig || !db) {
    return () => {};
  }

  try {
    const notificationsRef = collection(db, 'notifications', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(20));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          readAt: data.readAt?.toDate(),
        } as Notification);
      });
      callback(notifications);
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return () => {};
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  if (!isValidConfig || !db) {
    return;
  }

  try {
    const notificationRef = doc(db, 'notifications', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!isValidConfig || !db) {
    return;
  }

  try {
    const notificationsRef = collection(db, 'notifications', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map((docSnapshot) => {
      return updateDoc(docSnapshot.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!isValidConfig || !db) {
    return 0;
  }

  try {
    const notificationsRef = collection(db, 'notifications', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

