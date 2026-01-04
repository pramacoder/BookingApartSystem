/**
 * Type definitions untuk database schema
 * Auto-generated berdasarkan schema SQL
 */

export type UserRole = 'resident' | 'admin' | 'guest';
export type ResidentStatus = 'active' | 'inactive' | 'pending' | 'terminated';
export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff';
export type UnitType = 'studio' | '1br' | '2br' | '3br' | '4br' | 'penthouse';
export type UnitOrientation = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
export type UnitStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type PaymentType = 'rent' | 'utilities' | 'maintenance' | 'deposit' | 'penalty' | 'facility_booking' | 'other';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'debit_card' | 'e_wallet' | 'cash' | 'midtrans';
export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired';
export type FacilityCategory = 'recreation' | 'sports' | 'business' | 'social' | 'wellness' | 'other';
export type FacilityStatus = 'active' | 'inactive' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type TicketCategory = 'maintenance' | 'complaint' | 'request' | 'emergency' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type StatusChange = 'opened' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type AnnouncementCategory = 'general' | 'maintenance' | 'event' | 'payment' | 'important' | 'other';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'upload';
export type NotificationType = 'payment' | 'announcement' | 'ticket' | 'booking' | 'system' | 'other';
export type OtpPurpose = 'email_verification' | 'password_reset' | 'login' | 'transaction';

// Database Tables Types
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  phone?: string;
  full_name?: string;
  id_number?: string;
  birth_date?: string;
  profile_picture?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: string;
  user_id: string;
  unit_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  move_in_date?: string;
  contract_start?: string;
  contract_end?: string;
  status: ResidentStatus;
  deposit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  admin_role: AdminRole;
  permissions: Record<string, any>;
  created_at: string;
}

export interface Unit {
  id: string;
  unit_number: string;
  unit_type: UnitType;
  floor: number;
  size_sqm: number;
  bedrooms: number;
  bathrooms: number;
  orientation?: UnitOrientation;
  monthly_rent: number;
  yearly_booking_price?: number;
  deposit_required: number;
  features: any[];
  floor_plan_url?: string;
  status: UnitStatus;
  created_at: string;
  updated_at: string;
}

export interface UnitPhoto {
  id: string;
  unit_id: string;
  photo_url: string;
  caption?: string;
  order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_number: string;
  resident_id: string;
  unit_id: string;
  payment_type: PaymentType;
  amount: number;
  admin_fee: number;
  discount: number;
  penalty: number;
  total_amount: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment_id: string;
  transaction_id: string;
  midtrans_order_id?: string;
  midtrans_transaction_id?: string;
  payment_method: PaymentMethod;
  amount: number;
  status: TransactionStatus;
  midtrans_response?: Record<string, any>;
  payment_proof_url?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  description?: string;
  capacity: number;
  location?: string;
  operational_start?: string;
  operational_end?: string;
  booking_fee: number;
  max_booking_duration_hours?: number;
  rules: Record<string, any>;
  status: FacilityStatus;
  created_at: string;
  updated_at: string;
}

export interface FacilityPhoto {
  id: string;
  facility_id: string;
  photo_url: string;
  caption?: string;
  order: number;
  created_at: string;
}

export interface FacilityBooking {
  id: string;
  booking_number: string;
  resident_id: string;
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  number_of_guests: number;
  booking_fee: number;
  status: BookingStatus;
  notes?: string;
  qr_code?: string;
  payment_transaction_id?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  resident_id: string;
  assigned_to?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  resolved_at?: string;
  rating?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketUpdate {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  status_change?: StatusChange;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_type?: string;
  file_name?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  publish_date: string;
  is_important: boolean;
  target_audience: Record<string, any>;
  status: AnnouncementStatus;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface GalleryPhoto {
  id: string;
  uploaded_by: string;
  photo_url: string;
  caption?: string;
  category?: string;
  tags: any[];
  is_featured: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActionType;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  updated_at: string;
}

export interface OtpVerification {
  id: string;
  email: string;
  otp_code: string;
  purpose: OtpPurpose;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

