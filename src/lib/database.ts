import { supabase } from './supabase';
import type { Resident, Unit, UnitPhoto, FacilityBooking, Facility, Ticket, TicketUpdate, Announcement, AnnouncementRead, GalleryPhoto, AnnouncementCategory, AnnouncementStatus, UnitBooking, BookingDurationType } from './types/database';

/**
 * Generic function untuk fetch data dari table
 */
export async function fetchFromTable<T>(
  tableName: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<{ data: T[] | null; error: any }> {
  try {
    let query = supabase.from(tableName).select(options?.select || '*');

    // Apply filters
    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as T[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Generic function untuk insert data ke table
 */
export async function insertIntoTable<T>(
  tableName: string,
  data: Partial<T>
): Promise<{ data: T | null; error: any }> {
  try {
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: insertedData as T, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Generic function untuk update data di table
 */
export async function updateInTable<T>(
  tableName: string,
  id: string | number,
  updates: Partial<T>
): Promise<{ data: T | null; error: any }> {
  try {
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: updatedData as T, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Generic function untuk delete data dari table
 */
export async function deleteFromTable(
  tableName: string,
  id: string | number
): Promise<{ error: any }> {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Subscribe ke perubahan real-time di table
 */
export function subscribeToTable<T>(
  tableName: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: T | null;
  }) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`${tableName}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: filter,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T | null,
          old: payload.old as T | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get resident data with unit information
 */
export async function getResidentWithUnit(userId: string) {
  try {
    // Get resident data
    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (residentError) throw residentError;
    if (!resident || !resident.unit_id) {
      return { data: null, error: null };
    }

    // Get unit data
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('*')
      .eq('id', resident.unit_id)
      .single();

    if (unitError) throw unitError;

    // Get unit photos
    const { data: photos, error: photosError } = await supabase
      .from('unit_photos')
      .select('*')
      .eq('unit_id', resident.unit_id)
      .order('order', { ascending: true });

    if (photosError) {
      console.warn('Error fetching unit photos:', photosError);
    }

    return {
      data: {
        resident: resident as Resident,
        unit: unit as Unit,
        photos: (photos || []) as UnitPhoto[],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get resident_id from user_id
 */
export async function getResidentId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error getting resident_id:', error);
    return null;
  }
}

/**
 * Get bookings for a resident
 */
export async function getResidentBookings(residentId: string) {
  try {
    const { data, error } = await supabase
      .from('facility_bookings')
      .select(`
        *,
        facilities:facility_id (
          id,
          name,
          category,
          location
        )
      `)
      .eq('resident_id', residentId)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) throw error;
    return { data: data as any[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get all active facilities
 */
export async function getActiveFacilities() {
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: data as Facility[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create a booking
 */
export async function createBooking(bookingData: {
  resident_id: string;
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  number_of_guests: number;
  booking_fee: number;
  notes?: string;
}) {
  try {
    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('facility_bookings')
      .insert({
        ...bookingData,
        booking_number: bookingNumber,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as FacilityBooking, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from('facility_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as FacilityBooking, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get tickets for a resident
 */
export async function getResidentTickets(residentId: string) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Ticket[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get ticket by ID with updates
 */
export async function getTicketWithUpdates(ticketId: string) {
  try {
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    const { data: updates, error: updatesError } = await supabase
      .from('ticket_updates')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (updatesError) {
      console.warn('Error fetching ticket updates:', updatesError);
    }

    return {
      data: {
        ticket: ticket as Ticket,
        updates: (updates || []) as TicketUpdate[],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create a ticket
 */
export async function createTicket(ticketData: {
  resident_id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
}) {
  try {
    // Generate ticket number
    const ticketNumber = `TKT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticketData,
        ticket_number: ticketNumber,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Ticket, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Add update to ticket
 */
export async function addTicketUpdate(updateData: {
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal?: boolean;
  status_change?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('ticket_updates')
      .insert(updateData)
      .select()
      .single();

    if (error) throw error;

    // Update ticket updated_at
    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', updateData.ticket_id);

    return { data: data as TicketUpdate, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get all units (for admin)
 */
export async function getAllUnits(filters?: {
  type?: string;
  status?: string;
  floor?: number;
  search?: string;
}) {
  try {
    let query = supabase.from('units').select('*');

    if (filters?.type) {
      query = query.eq('unit_type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.floor) {
      query = query.eq('floor', filters.floor);
    }
    if (filters?.search) {
      query = query.ilike('unit_number', `%${filters.search}%`);
    }

    query = query.order('unit_number', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return { data: data as Unit[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get unit by ID with photos
 */
export async function getUnitWithPhotos(unitId: string) {
  try {
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (unitError) throw unitError;

    const { data: photos, error: photosError } = await supabase
      .from('unit_photos')
      .select('*')
      .eq('unit_id', unitId)
      .order('order', { ascending: true });

    if (photosError) {
      console.warn('Error fetching unit photos:', photosError);
    }

    return {
      data: {
        unit: unit as Unit,
        photos: (photos || []) as UnitPhoto[],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create unit
 */
export async function createUnit(unitData: {
  unit_number: string;
  unit_type: string;
  floor: number;
  size_sqm: number;
  bedrooms: number;
  bathrooms: number;
  orientation?: string;
  monthly_rent: number;
  yearly_booking_price?: number;
  deposit_required: number;
  features?: any[];
  floor_plan_url?: string;
  status: string;
}) {
  try {
    const { data, error } = await supabase
      .from('units')
      .insert(unitData)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Unit, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update unit
 */
export async function updateUnit(unitId: string, updates: Partial<Unit>) {
  try {
    const { data, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', unitId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Unit, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete unit
 */
export async function deleteUnit(unitId: string) {
  try {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Create resident record
 */
export async function createResident(residentData: {
  user_id: string;
  unit_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  move_in_date?: string;
  contract_start?: string;
  contract_end?: string;
  status?: string;
  deposit_amount?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('residents')
      .insert({
        ...residentData,
        status: residentData.status || 'pending',
        deposit_amount: residentData.deposit_amount || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Resident, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create unit booking
 */
export async function createUnitBooking(bookingData: {
  resident_id: string;
  unit_id: string;
  booking_duration_type: BookingDurationType;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  admin_fee: number;
  total_amount: number;
  payment_status?: string;
  status?: string;
  notes?: string;
}): Promise<{ data: UnitBooking | null; error: any }> {
  try {
    // Generate booking number
    const bookingNumber = `UB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('unit_bookings')
      .insert({
        ...bookingData,
        booking_number: bookingNumber,
        payment_status: bookingData.payment_status || 'pending',
        status: bookingData.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as UnitBooking, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get unit booking by ID
 */
export async function getUnitBookingById(bookingId: string): Promise<{ data: UnitBooking | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('unit_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return { data: data as UnitBooking, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update unit booking
 */
export async function updateUnitBooking(bookingId: string, updates: Partial<UnitBooking>): Promise<{ data: UnitBooking | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('unit_bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UnitBooking, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update resident
 */
export async function updateResident(residentId: string, updates: Partial<Resident>): Promise<{ data: Resident | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('residents')
      .update(updates)
      .eq('id', residentId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Resident, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Mark key as collected
 */
export async function markKeyAsCollected(residentId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('residents')
      .update({ key_collected_at: new Date().toISOString() })
      .eq('id', residentId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Get all residents (for admin)
 */
export async function getAllResidents(filters?: {
  status?: string;
  unit_id?: string;
  search?: string;
}) {
  try {
    let query = supabase
      .from('residents')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name,
          phone
        ),
        units:unit_id (
          id,
          unit_number
        )
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.unit_id) {
      query = query.eq('unit_id', filters.unit_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Filter by search if provided
    let filteredData = data;
    if (filters?.search) {
      filteredData = data?.filter((resident: any) => {
        const searchLower = filters.search!.toLowerCase();
        return (
          resident.users?.email?.toLowerCase().includes(searchLower) ||
          resident.users?.full_name?.toLowerCase().includes(searchLower) ||
          resident.users?.phone?.toLowerCase().includes(searchLower)
        );
      });
    }

    return { data: filteredData as any[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get all payments (for admin)
 */
export async function getAllPayments(filters?: {
  status?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        residents:resident_id (
          id,
          users:user_id (
            email,
            full_name
          )
        ),
        units:unit_id (
          unit_number
        )
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('payment_type', filters.type);
    }
    if (filters?.date_from) {
      query = query.gte('due_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('due_date', filters.date_to);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Filter by search if provided
    let filteredData = data;
    if (filters?.search) {
      filteredData = data?.filter((payment: any) => {
        const searchLower = filters.search!.toLowerCase();
        return (
          payment.invoice_number?.toLowerCase().includes(searchLower) ||
          payment.residents?.users?.email?.toLowerCase().includes(searchLower) ||
          payment.residents?.users?.full_name?.toLowerCase().includes(searchLower)
        );
      });
    }

    return { data: filteredData as any[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create payment/invoice
 */
export async function createPayment(paymentData: {
  resident_id: string;
  unit_id: string;
  payment_type: string;
  amount: number;
  admin_fee: number;
  discount: number;
  penalty: number;
  due_date: string;
  notes?: string;
}) {
  try {
    // Generate invoice number
    const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const totalAmount = paymentData.amount + paymentData.admin_fee - paymentData.discount + paymentData.penalty;

    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as any, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(paymentId: string, status: string, paymentDate?: string) {
  try {
    const updates: any = { status };
    if (paymentDate) {
      updates.payment_date = paymentDate;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as any, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

/**
 * Get all announcements with optional filters
 */
export async function getAllAnnouncements(filters?: {
  category?: AnnouncementCategory;
  status?: AnnouncementStatus;
  is_important?: boolean;
}): Promise<{ data: Announcement[] | null; error: any }> {
  try {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.is_important !== undefined) {
      query = query.eq('is_important', filters.is_important);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as Announcement[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get announcement by ID
 */
export async function getAnnouncementById(announcementId: string): Promise<{ data: Announcement | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single();

    if (error) throw error;
    return { data: data as Announcement, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Mark announcement as read by user
 */
export async function markAnnouncementAsRead(
  announcementId: string,
  userId: string
): Promise<{ data: AnnouncementRead | null; error: any }> {
  try {
    // Check if already read
    const { data: existing } = await supabase
      .from('announcement_reads')
      .select('*')
      .eq('announcement_id', announcementId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { data: existing as AnnouncementRead, error: null };
    }

    // Mark as read
    const { data, error } = await supabase
      .from('announcement_reads')
      .insert({
        announcement_id: announcementId,
        user_id: userId,
        read_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as AnnouncementRead, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get read status for announcements by user
 */
export async function getAnnouncementReadStatus(
  userId: string,
  announcementIds?: string[]
): Promise<{ data: Record<string, boolean>; error: any }> {
  try {
    let query = supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', userId);

    if (announcementIds && announcementIds.length > 0) {
      query = query.in('announcement_id', announcementIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const readMap: Record<string, boolean> = {};
    (data || []).forEach((read) => {
      readMap[read.announcement_id] = true;
    });

    return { data: readMap, error: null };
  } catch (error) {
    return { data: {}, error };
  }
}

/**
 * Create announcement (admin only)
 */
export async function createAnnouncement(
  announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Announcement | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Announcement, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update announcement (admin only)
 */
export async function updateAnnouncement(
  announcementId: string,
  updates: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Announcement | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', announcementId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Announcement, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete announcement (admin only)
 */
export async function deleteAnnouncement(announcementId: string): Promise<{ data: boolean; error: any }> {
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error };
  }
}

// ============================================================================
// GALLERY
// ============================================================================

/**
 * Get all gallery photos with optional filters
 */
export async function getAllGalleryPhotos(filters?: {
  category?: string;
  is_featured?: boolean;
}): Promise<{ data: GalleryPhoto[] | null; error: any }> {
  try {
    let query = supabase
      .from('gallery_photos')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as GalleryPhoto[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get gallery photo by ID
 */
export async function getGalleryPhotoById(photoId: string): Promise<{ data: GalleryPhoto | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('id', photoId)
      .single();

    if (error) throw error;
    return { data: data as GalleryPhoto, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create gallery photo (admin only)
 */
export async function createGalleryPhoto(
  photoData: Omit<GalleryPhoto, 'id' | 'created_at'>
): Promise<{ data: GalleryPhoto | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('gallery_photos')
      .insert(photoData)
      .select()
      .single();

    if (error) throw error;
    return { data: data as GalleryPhoto, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update gallery photo (admin only)
 */
export async function updateGalleryPhoto(
  photoId: string,
  updates: Partial<Omit<GalleryPhoto, 'id' | 'created_at'>>
): Promise<{ data: GalleryPhoto | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('gallery_photos')
      .update(updates)
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as GalleryPhoto, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete gallery photo (admin only)
 */
export async function deleteGalleryPhoto(photoId: string): Promise<{ data: boolean; error: any }> {
  try {
    const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error };
  }
}

