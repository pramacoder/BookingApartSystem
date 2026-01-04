import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mendapatkan environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validasi environment variables
let isValidConfig = true;
let configError: string | null = null;

if (!supabaseUrl || supabaseUrl === '' || supabaseUrl === 'your_supabase_project_url') {
  isValidConfig = false;
  configError = 'VITE_SUPABASE_URL tidak ditemukan atau tidak valid';
} else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  isValidConfig = false;
  configError = 'VITE_SUPABASE_URL harus berupa URL yang valid (dimulai dengan http:// atau https://)';
}

if (!supabaseAnonKey || supabaseAnonKey === '' || supabaseAnonKey === 'your_supabase_anon_key') {
  isValidConfig = false;
  configError = configError 
    ? configError + ' dan VITE_SUPABASE_ANON_KEY tidak ditemukan atau tidak valid'
    : 'VITE_SUPABASE_ANON_KEY tidak ditemukan atau tidak valid';
}

if (!isValidConfig) {
  console.error(
    '❌ Supabase Configuration Error:\n' +
    configError + '\n\n' +
    'Silakan buat file .env di root project dengan:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'Dapatkan credentials dari: https://app.supabase.com → Project Settings → API'
  );
}

// Membuat Supabase client dengan validasi
let supabase: SupabaseClient;

if (isValidConfig && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
      global: {
        headers: {
          'x-client-info': 'apartment-management-web',
        },
      },
    });
    
    // Test connection
    supabase.auth.getSession().catch((err) => {
      console.error('Supabase connection test failed:', err);
      if (err.message?.includes('fetch')) {
        console.error('Kemungkinan masalah:\n' +
          '1. URL Supabase tidak valid\n' +
          '2. Masalah CORS (pastikan Supabase project sudah di-setup dengan benar)\n' +
          '3. Koneksi internet bermasalah\n' +
          '4. Supabase project mungkin di-pause atau tidak aktif'
        );
      }
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Fallback: create client dengan placeholder (akan error saat digunakan)
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
} else {
  // Fallback: create client dengan placeholder (akan error saat digunakan)
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { supabase, isValidConfig, configError };

// Import type definitions
import type {
  User,
  Resident,
  Admin,
  Unit,
  UnitPhoto,
  Payment,
  PaymentTransaction,
  Facility,
  FacilityPhoto,
  FacilityBooking,
  Ticket,
  TicketUpdate,
  TicketAttachment,
  Announcement,
  AnnouncementRead,
  GalleryPhoto,
  ActivityLog,
  Notification,
  SystemSetting,
  OtpVerification,
  Session,
} from './types/database';

// Export types untuk digunakan di aplikasi
export type {
  User,
  Resident,
  Admin,
  Unit,
  UnitPhoto,
  Payment,
  PaymentTransaction,
  Facility,
  FacilityPhoto,
  FacilityBooking,
  Ticket,
  TicketUpdate,
  TicketAttachment,
  Announcement,
  AnnouncementRead,
  GalleryPhoto,
  ActivityLog,
  Notification,
  SystemSetting,
  OtpVerification,
  Session,
};

// Type definitions untuk Supabase Database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      residents: {
        Row: Resident;
        Insert: Omit<Resident, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Resident, 'id' | 'created_at'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'id' | 'created_at'>;
        Update: Partial<Omit<Admin, 'id' | 'created_at'>>;
      };
      units: {
        Row: Unit;
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Unit, 'id' | 'created_at'>>;
      };
      unit_photos: {
        Row: UnitPhoto;
        Insert: Omit<UnitPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<UnitPhoto, 'id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      payment_transactions: {
        Row: PaymentTransaction;
        Insert: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentTransaction, 'id' | 'created_at'>>;
      };
      facilities: {
        Row: Facility;
        Insert: Omit<Facility, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Facility, 'id' | 'created_at'>>;
      };
      facility_photos: {
        Row: FacilityPhoto;
        Insert: Omit<FacilityPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<FacilityPhoto, 'id' | 'created_at'>>;
      };
      facility_bookings: {
        Row: FacilityBooking;
        Insert: Omit<FacilityBooking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FacilityBooking, 'id' | 'created_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>;
      };
      ticket_updates: {
        Row: TicketUpdate;
        Insert: Omit<TicketUpdate, 'id' | 'created_at'>;
        Update: Partial<Omit<TicketUpdate, 'id' | 'created_at'>>;
      };
      ticket_attachments: {
        Row: TicketAttachment;
        Insert: Omit<TicketAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<TicketAttachment, 'id' | 'created_at'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>;
      };
      announcement_reads: {
        Row: AnnouncementRead;
        Insert: Omit<AnnouncementRead, 'id'>;
        Update: Partial<Omit<AnnouncementRead, 'id'>>;
      };
      gallery_photos: {
        Row: GalleryPhoto;
        Insert: Omit<GalleryPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<GalleryPhoto, 'id' | 'created_at'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      system_settings: {
        Row: SystemSetting;
        Insert: Omit<SystemSetting, 'id' | 'updated_at'>;
        Update: Partial<Omit<SystemSetting, 'id'>>;
      };
      otp_verifications: {
        Row: OtpVerification;
        Insert: Omit<OtpVerification, 'id' | 'created_at'>;
        Update: Partial<Omit<OtpVerification, 'id' | 'created_at'>>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at'>;
        Update: Partial<Omit<Session, 'id' | 'created_at'>>;
      };
    };
  };
};

