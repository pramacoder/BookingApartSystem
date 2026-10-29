// Fast timeout helper
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 700): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}
import { supabase, isValidConfig } from './supabase';
import type { ChatMessage, ChatRoom, Notification } from './types/database';

export type { ChatMessage, ChatRoom, Notification };

// Local in-memory / localStorage cache for offline/demo fallback
const LOCAL_STORAGE_CHATS_KEY = 'greenview_chat_rooms';
const LOCAL_STORAGE_MESSAGES_KEY = 'greenview_chat_messages';
const LOCAL_STORAGE_NOTIFS_KEY = 'greenview_notifications';

function getLocalChats(): ChatRoom[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalChats(chats: ChatRoom[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save local chats:', e);
  }
}

function getLocalMessages(chatId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${chatId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'msg-welcome',
      chatId,
      chat_id: chatId,
      senderId: 'admin-1',
      sender_id: 'admin-1',
      senderName: 'Customer Service Admin',
      sender_name: 'Customer Service Admin',
      senderRole: 'admin',
      sender_role: 'admin',
      message: 'Halo! Ada yang bisa kami bantu terkait unit atau fasilitas apartemen Anda hari ini?',
      read: true,
      timestamp: new Date(),
      created_at: new Date().toISOString(),
    }
  ];
}

function saveLocalMessages(chatId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${chatId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save local messages:', e);
  }
}

function getLocalNotifications(userId: string): Notification[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_NOTIFS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'notif-1',
      user_id: userId,
      type: 'system',
      title: 'Selamat Datang di GreenView',
      message: 'Sistem manajemen apartemen Anda siap digunakan.',
      read: false,
      created_at: new Date().toISOString(),
    } as unknown as Notification,
  ];
}

function saveLocalNotifications(userId: string, notifications: Notification[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_NOTIFS_KEY}_${userId}`, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save local notifications:', e);
  }
}

// ============================================
// CHAT FUNCTIONS (PostgreSQL / Supabase)
// ============================================

/**
 * Get or create chat room between resident and admin
 */
export async function getOrCreateChatRoom(residentId: string, adminId?: string): Promise<string> {
  const chatId = `chat_${residentId}`;

  if (isValidConfig) {
    try {
      const { data: existingRoom, error: fetchErr } = await withTimeout(supabase.from('chat_rooms').select('*').eq('id', chatId).maybeSingle()).catch(e => ({ data: null, error: e }));

      if (!fetchErr && existingRoom) {
        return chatId;
      }

      // Create new chat room in PostgreSQL
      await withTimeout(supabase.from('chat_rooms').insert({
        id: chatId,
        resident_id: residentId,
        admin_id: adminId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })).catch(() => {});

      return chatId;
    } catch (err) {
      console.warn('PostgreSQL chat room check failed, using local fallback:', err);
    }
  }

  // Fallback
  const localChats = getLocalChats();
  if (!localChats.some((c) => c.id === chatId)) {
    localChats.push({
      id: chatId,
      residentId,
      resident_id: residentId,
      residentName: 'Resident',
      resident_name: 'Resident',
      adminId: adminId || null,
      admin_id: adminId || null,
      lastMessage: 'Percakapan dimulai',
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    saveLocalChats(localChats);
  }

  return chatId;
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
  const now = new Date();
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (isValidConfig) {
    try {
      const { data, error } = await withTimeout(supabase.from('chat_messages').insert({
          chat_id: chatId,
          sender_id: senderId,
          sender_name: senderName,
          sender_role: senderRole,
          message,
          read: senderRole === 'admin',
          created_at: now.toISOString(),
        })
        .select().single()).catch(e => ({ data: null, error: e }));

      if (!error && data) {
        await withTimeout(supabase.from('chat_rooms').update({
            last_message: message,
            last_message_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', chatId)).catch(() => {});

        return data.id;
      }
    } catch (err) {
      console.warn('PostgreSQL insert message failed, storing locally:', err);
    }
  }

  // Local fallback
  const msgs = getLocalMessages(chatId);
  const newMsg: ChatMessage = {
    id: msgId,
    chatId,
    chat_id: chatId,
    senderId,
    sender_id: senderId,
    senderName,
    sender_name: senderName,
    senderRole,
    sender_role: senderRole,
    message,
    read: senderRole === 'admin',
    timestamp: now,
    created_at: now.toISOString(),
  };
  msgs.push(newMsg);
  saveLocalMessages(chatId, msgs);
  window.dispatchEvent(new CustomEvent('chat_updated_' + chatId, { detail: msgs }));

  // Update local chat room
  const localChats = getLocalChats();
  const roomIndex = localChats.findIndex((c) => c.id === chatId);
  if (roomIndex >= 0) {
    localChats[roomIndex].lastMessage = message;
    localChats[roomIndex].last_message = message;
    localChats[roomIndex].lastMessageAt = now;
    localChats[roomIndex].updatedAt = now;
  } else {
    localChats.push({
      id: chatId,
      residentId: senderId,
      residentName: senderName,
      lastMessage: message,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
  saveLocalChats(localChats);

  return msgId;
}

/**
 * Get chat messages for a chat room
 */
export async function getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
  if (isValidConfig) {
    try {
      const { data, error } = await withTimeout(supabase.from('chat_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true }).limit(limitCount)).catch(e => ({ data: null, error: e }));

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          chatId: item.chat_id,
          chat_id: item.chat_id,
          senderId: item.sender_id,
          sender_id: item.sender_id,
          senderName: item.sender_name,
          sender_name: item.sender_name,
          senderRole: item.sender_role,
          sender_role: item.sender_role,
          message: item.message,
          read: item.read,
          readAt: item.read_at ? new Date(item.read_at) : undefined,
          timestamp: item.created_at ? new Date(item.created_at) : new Date(),
          created_at: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('PostgreSQL fetch messages failed:', err);
    }
  }

  // Local fallback
  return getLocalMessages(chatId);
}

/**
 * Listen to chat messages in real-time
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  let isSubscribed = true;

  // Immediate initial load
  getChatMessages(chatId).then((msgs) => {
    if (isSubscribed) callback(msgs);
  });

  const handler = (e: any) => {
    if (isSubscribed) callback(e.detail || getLocalMessages(chatId));
  };
  window.addEventListener('chat_updated_' + chatId, handler);

  let channel: any = null;
  if (isValidConfig) {
    try {
      channel = supabase
        .channel('chat_' + chatId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: 'chat_id=eq.' + chatId,
          },
          async () => {
            const freshMessages = await getChatMessages(chatId);
            if (isSubscribed) callback(freshMessages);
          }
        )
        .subscribe();
    } catch (err) {}
  }

  const interval = setInterval(async () => {
    const freshMessages = await getChatMessages(chatId);
    if (isSubscribed) callback(freshMessages);
  }, 2500);

  return () => {
    isSubscribed = false;
    window.removeEventListener('chat_updated_' + chatId, handler);
    clearInterval(interval);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  if (isValidConfig) {
    try {
      await supabase
        .from('chat_messages')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .eq('read', false);
    } catch (err) {
      console.warn('PostgreSQL markMessagesAsRead failed:', err);
    }
  }

  const msgs = getLocalMessages(chatId);
  let changed = false;
  msgs.forEach((m) => {
    if (m.senderId !== userId && !m.read) {
      m.read = true;
      m.readAt = new Date();
      changed = true;
    }
  });
  if (changed) {
    saveLocalMessages(chatId, msgs);
  }
}

/**
 * Get all chat rooms (for admin)
 */
export async function getAllChatRooms(): Promise<ChatRoom[]> {
  if (isValidConfig) {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((room) => ({
          id: room.id,
          residentId: room.resident_id,
          resident_id: room.resident_id,
          residentName: room.resident_name || 'Resident',
          resident_name: room.resident_name || 'Resident',
          adminId: room.admin_id,
          admin_id: room.admin_id,
          adminName: room.admin_name || 'Admin',
          admin_name: room.admin_name || 'Admin',
          lastMessage: room.last_message,
          last_message: room.last_message,
          lastMessageAt: room.last_message_at ? new Date(room.last_message_at) : undefined,
          last_message_at: room.last_message_at,
          unreadCount: room.unread_count || 0,
          unread_count: room.unread_count || 0,
          createdAt: room.created_at ? new Date(room.created_at) : new Date(),
          created_at: room.created_at,
          updatedAt: room.updated_at ? new Date(room.updated_at) : new Date(),
          updated_at: room.updated_at,
        }));
      }
    } catch (err) {
      console.warn('PostgreSQL getAllChatRooms failed:', err);
    }
  }

  const local = getLocalChats();
  if (local.length > 0) return local;

  // Default sample chat rooms if empty
  return [
    {
      id: 'chat_resident_1',
      residentId: 'resident_1',
      residentName: 'Budi Santoso (A-1201)',
      lastMessage: 'Halo admin, apakah AC di unit saya sudah selesai diservis?',
      lastMessageAt: new Date(Date.now() - 15 * 60000),
      unreadCount: 1,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 15 * 60000),
    },
    {
      id: 'chat_resident_2',
      residentId: 'resident_2',
      residentName: 'Siti Rahma (B-0504)',
      lastMessage: 'Terima kasih atas informasinya.',
      lastMessageAt: new Date(Date.now() - 3600000),
      unreadCount: 0,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 3600000),
    },
  ];
}

// ============================================
// NOTIFICATION FUNCTIONS (PostgreSQL / Supabase)
// ============================================

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<string> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (isValidConfig) {
    try {
      const { data: inserted, error } = await withTimeout(supabase.from('notifications').insert({
          user_id: userId,
          type: type as any,
          title,
          message,
          data: data || {},
          read: false,
          created_at: new Date().toISOString(),
        }).select().single()).catch(e => ({ data: null, error: e }));

      if (!error && inserted) {
        return inserted.id;
      }
    } catch (err) {
      console.warn('PostgreSQL createNotification failed, storing locally:', err);
    }
  }

  const notifs = getLocalNotifications(userId);
  const newNotif = {
    id: notifId,
    userId,
    user_id: userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
    created_at: new Date().toISOString(),
  } as unknown as Notification;
  notifs.unshift(newNotif);
  saveLocalNotifications(userId, notifs);

  return notifId;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  if (isValidConfig) {
    try {
      const { data, error } = await withTimeout(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limitCount)).catch(e => ({ data: null, error: e }));

      if (!error && data && data.length > 0) {
        return data as Notification[];
      }
    } catch (err) {
      console.warn('PostgreSQL getUserNotifications failed:', err);
    }
  }

  return getLocalNotifications(userId);
}

/**
 * Listen to user notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  getUserNotifications(userId).then(callback);

  if (!isValidConfig) {
    const interval = setInterval(async () => {
      callback(getLocalNotifications(userId));
    }, 5000);
    return () => clearInterval(interval);
  }

  try {
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const fresh = await getUserNotifications(userId);
          callback(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime notifications subscription error, using polling:', err);
    const interval = setInterval(async () => {
      const fresh = await getUserNotifications(userId);
      callback(fresh);
    }, 5000);
    return () => clearInterval(interval);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  if (isValidConfig) {
    try {
      await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('PostgreSQL markNotificationAsRead failed:', err);
    }
  }

  const notifs = getLocalNotifications(userId);
  const target = notifs.find((n: any) => n.id === notificationId);
  if (target) {
    (target as any).read = true;
    (target as any).readAt = new Date();
    (target as any).read_at = new Date().toISOString();
    saveLocalNotifications(userId, notifs);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (isValidConfig) {
    try {
      await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('read', false);
    } catch (err) {
      console.warn('PostgreSQL markAllNotificationsAsRead failed:', err);
    }
  }

  const notifs = getLocalNotifications(userId);
  notifs.forEach((n: any) => {
    n.read = true;
    n.readAt = new Date();
    n.read_at = new Date().toISOString();
  });
  saveLocalNotifications(userId, notifs);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isValidConfig) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (!error && count !== null) {
        return count;
      }
    } catch (err) {
      console.warn('PostgreSQL getUnreadNotificationCount failed:', err);
    }
  }

  const notifs = getLocalNotifications(userId);
  return notifs.filter((n: any) => !n.read).length;
}
