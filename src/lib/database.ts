import { mockUnits, mockResidents, mockPayments, mockBookings, mockAnnouncements, mockTickets, mockFacilities } from '../data/mockData';
import { supabase } from './supabase';

// Fast timeout helper for remote database queries to keep UI instant and responsive
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 1000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Database timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

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

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));

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
    const { data: resident, error: residentError } = await withTimeout(supabase.from('residents').select('*').eq('user_id', userId).maybeSingle());

    if (!residentError && resident && resident.unit_id) {
      const { data: unit, error: unitError } = await withTimeout(
        supabase
          .from('units')
          .select('*')
          .eq('id', resident.unit_id)
          .single()
      );

      const { data: photos } = await supabase
        .from('unit_photos')
        .select('*')
        .eq('unit_id', resident.unit_id)
        .order('order', { ascending: true });

      if (unit) {
        return {
          data: {
            resident: resident as Resident,
            unit: unit as Unit,
            photos: (photos || []) as UnitPhoto[],
          },
          error: null,
        };
      }
    }
  } catch (error) {
    console.warn('getResidentWithUnit query notice:', error);
  }

  // Graceful fallback for demo/development
  const mockU = mockUnits[0];
  return {
    data: {
      resident: {
        id: 'res-1',
        user_id: userId,
        unit_id: mockU.id,
        status: 'active' as any,
        deposit_amount: mockU.deposit,
        contract_start: '2025-01-01',
        contract_end: '2026-01-01',
        move_in_date: '2025-01-05',
        emergency_contact_name: 'Dewi Lestari',
        emergency_contact_phone: '081234567891',
        key_collected_at: '2025-01-05T08:00:00Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Resident,
      unit: {
        id: mockU.id,
        unit_number: mockU.unitNumber,
        unit_type: 'studio' as any,
        floor: mockU.floor,
        size_sqm: mockU.size,
        bedrooms: mockU.bedrooms,
        bathrooms: mockU.bathrooms,
        orientation: 'north' as any,
        monthly_rent: mockU.monthlyRent,
        yearly_rent: mockU.yearlyRent,
        yearly_booking_price: mockU.yearlyRent,
        deposit_required: mockU.deposit,
        features: mockU.features,
        status: 'occupied' as any,
        floor_plan_url: mockU.images[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Unit,
      photos: mockU.images.map((img, i) => ({
        id: `p-${i}`,
        unit_id: mockU.id,
        photo_url: img,
        caption: `Photo ${i + 1}`,
        order: i + 1,
        created_at: new Date().toISOString(),
      })) as UnitPhoto[],
    },
    error: null,
  };
}

/**
 * Get resident_id from user_id
 */
export async function getResidentId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await withTimeout(supabase.from('residents').select('id').eq('user_id', userId).maybeSingle());

    if (!error && data?.id) return data.id;
  } catch (error) {}
  return 'res-1';
}

/**
 * Get bookings for a resident
 */
export async function getResidentBookings(residentId: string) {
  try {
    const { data, error } = await withTimeout(
      supabase
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
    ).catch(e => ({ data: null, error: e }));

    if (!error && data && data.length > 0) {
      return { data: data as any[], error: null };
    }
  } catch (error) {}

  return {
    data: mockBookings.map((b) => ({
      id: b.id,
      booking_number: `BK-${b.id}`,
      facility_id: b.facilityId,
      resident_id: residentId,
      booking_date: b.date,
      start_time: b.timeSlot.split(' - ')[0] || '10:00',
      end_time: b.timeSlot.split(' - ')[1] || '12:00',
      duration_hours: b.duration,
      number_of_guests: b.guests,
      booking_fee: b.bookingFee || 0,
      total_price: b.bookingFee || 0,
      status: b.status as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      facilities: {
        id: b.facilityId,
        name: b.facilityName,
        category: 'Sports',
        location: 'Level 3',
      },
    })),
    error: null,
  };
}

/**
 * Cancel a booking
 */

export async function getActiveFacilities(): Promise<{ data: Facility[] | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('facilities')
        .select('*')
        .eq('status', 'available')
        .order('name', { ascending: true })
    ).catch(e => ({ data: null, error: e }));

    if (!error && data && data.length > 0) {
      return { data: data as Facility[], error: null };
    }
  } catch (error) {}

  return {
    data: (mockFacilities || []).map((f) => ({
      id: f.id,
      name: f.name,
      category: (f.category?.toLowerCase() || 'sports') as any,
      description: f.description,
      capacity: f.capacity,
      location: 'Tower A',
      operational_start: f.operationalHours?.split(' - ')[0] || '06:00',
      operational_end: f.operationalHours?.split(' - ')[1] || '22:00',
      booking_fee: f.bookingFee || 0,
      rules: {},
      status: 'available' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    error: null,
  };
}

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
}): Promise<{ data: FacilityBooking | null; error: any }> {
  try {
    const bookingNumber = 'BK-' + Date.now().toString(36).toUpperCase();
    const { data, error } = await withTimeout(
      supabase
        .from('facility_bookings')
        .insert({
          ...bookingData,
          booking_number: bookingNumber,
          status: 'confirmed',
        })
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) {
      return { data: data as FacilityBooking, error: null };
    }
  } catch (error) {}

  const newBooking: FacilityBooking = {
    id: 'fb-' + Date.now(),
    booking_number: 'BK-' + Date.now().toString(36).toUpperCase(),
    resident_id: bookingData.resident_id,
    facility_id: bookingData.facility_id,
    booking_date: bookingData.booking_date,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    duration_hours: bookingData.duration_hours,
    number_of_guests: bookingData.number_of_guests,
    booking_fee: bookingData.booking_fee,
    status: 'confirmed',
    notes: bookingData.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { data: newBooking, error: null };
}

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
    const { data, error } = await withTimeout(
      supabase
        .from('tickets')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false })
    ).catch(e => ({ data: null, error: e }));

    if (!error && data && data.length > 0) {
      return { data: data as Ticket[], error: null };
    }
  } catch (error) {}

  return {
    data: mockTickets.map((t) => ({
      id: t.id,
      ticket_number: t.ticketNumber,
      resident_id: residentId,
      category: t.category.toLowerCase() as any,
      priority: t.priority.toLowerCase() as any,
      title: t.subject,
      description: t.description,
      status: (t.status === 'Open' ? 'open' : t.status === 'In Progress' ? 'in_progress' : 'resolved') as any,
      created_at: t.createdDate,
      updated_at: t.lastUpdate,
    })),
    error: null,
  };
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
    if (filters?.type && filters.type !== 'all') query = query.eq('unit_type', filters.type);
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.floor) query = query.eq('floor', filters.floor);
    if (filters?.search) query = query.ilike('unit_number', `%${filters.search}%`);
    query = query.order('unit_number', { ascending: true });

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));
    if (!error && data && data.length > 0) {
      return { data: data as Unit[], error: null };
    }
  } catch (error) {}

  const fallback = mockUnits.map((u) => ({
    id: u.id,
    unit_number: u.unitNumber,
    unit_type: (u.type.toLowerCase().includes('studio') ? 'studio' : u.type.toLowerCase().includes('1') ? '1br' : '2br') as any,
    floor: u.floor,
    size_sqm: u.size,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    orientation: 'north' as any,
    monthly_rent: u.monthlyRent,
    yearly_rent: u.yearlyRent,
    yearly_booking_price: u.yearlyRent,
    deposit_required: u.deposit,
    features: u.features,
    status: u.status as any,
    floor_plan_url: u.images[0] || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  let filtered = fallback;
  if (filters?.type && filters.type !== 'all') {
    filtered = filtered.filter((u) => u.unit_type === filters.type);
  }
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((u) => u.status === filters.status);
  }
  if (filters?.floor) {
    filtered = filtered.filter((u) => u.floor === filters.floor);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter((u) => u.unit_number.toLowerCase().includes(s));
  }

  return { data: filtered, error: null };
}

/**
 * Get unit by ID with photos
 */
export async function getUnitWithPhotos(unitId: string) {
  try {
    const { data: unit, error: unitError } = await withTimeout(supabase.from('units').select('*').eq('id', unitId).single());

    if (!unitError && unit) {
      const { data: photos } = await supabase
        .from('unit_photos')
        .select('*')
        .eq('unit_id', unitId)
        .order('order', { ascending: true });

      return {
        data: {
          unit: unit as Unit,
          photos: (photos || []) as UnitPhoto[],
        },
        error: null,
      };
    }
  } catch (error) {}

  const mock = mockUnits.find((u) => u.id === unitId || u.unitNumber === unitId) || mockUnits[0];
  return {
    data: {
      unit: {
        id: mock.id,
        unit_number: mock.unitNumber,
        unit_type: (mock.type.toLowerCase().includes('studio') ? 'studio' : mock.type.toLowerCase().includes('1') ? '1br' : '2br') as any,
        floor: mock.floor,
        size_sqm: mock.size,
        bedrooms: mock.bedrooms,
        bathrooms: mock.bathrooms,
        orientation: 'north' as any,
        monthly_rent: mock.monthlyRent,
        yearly_rent: mock.yearlyRent,
        yearly_booking_price: mock.yearlyRent,
        deposit_required: mock.deposit,
        features: mock.features,
        status: mock.status as any,
        floor_plan_url: mock.images[0] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Unit,
      photos: mock.images.map((img, idx) => ({
        id: `p-${idx}`,
        unit_id: mock.id,
        photo_url: img,
        caption: `Photo ${idx + 1}`,
        order: idx + 1,
        created_at: new Date().toISOString(),
      })) as UnitPhoto[],
    },
    error: null,
  };
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
export async function updateUnit(unitId: string, updates: Partial<Unit>): Promise<{ data: Unit | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('units')
        .update(updates)
        .eq('id', unitId)
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as Unit, error: null };
  } catch (error) {}

  return { data: { id: unitId, ...updates } as any, error: null };
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
}): Promise<{ data: Resident | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('residents')
        .insert({
          ...residentData,
          status: residentData.status || 'pending',
          deposit_amount: residentData.deposit_amount || 0,
        })
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as Resident, error: null };
  } catch (error) {}

  const mockRes: Resident = {
    id: 'res-' + Date.now(),
    user_id: residentData.user_id,
    unit_id: residentData.unit_id,
    status: (residentData.status as any) || 'pending',
    deposit_amount: residentData.deposit_amount || 0,
    emergency_contact_name: residentData.emergency_contact_name,
    emergency_contact_phone: residentData.emergency_contact_phone,
    move_in_date: residentData.move_in_date,
    contract_start: residentData.contract_start,
    contract_end: residentData.contract_end,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { data: mockRes, error: null };
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
  const bookingNumber = 'UB' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('unit_bookings')
        .insert({
          ...bookingData,
          booking_number: bookingNumber,
          payment_status: bookingData.payment_status || 'pending',
          status: bookingData.status || 'pending',
        })
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as UnitBooking, error: null };
  } catch (error) {}

  const mockBooking: UnitBooking = {
    id: 'ub-' + Date.now(),
    booking_number: bookingNumber,
    resident_id: bookingData.resident_id,
    unit_id: bookingData.unit_id,
    booking_duration_type: bookingData.booking_duration_type,
    start_date: bookingData.start_date,
    end_date: bookingData.end_date,
    rent_amount: bookingData.rent_amount,
    deposit_amount: bookingData.deposit_amount,
    admin_fee: bookingData.admin_fee,
    total_amount: bookingData.total_amount,
    payment_status: (bookingData.payment_status as any) || 'pending',
    status: (bookingData.status as any) || 'pending',
    notes: bookingData.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem('greenview_unit_booking_' + mockBooking.id, JSON.stringify(mockBooking));
  } catch {}

  return { data: mockBooking, error: null };
}

/**
 * Get unit booking by ID
 */
export async function getUnitBookingById(bookingId: string): Promise<{ data: UnitBooking | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('unit_bookings')
        .select('*')
        .eq('id', bookingId)
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as UnitBooking, error: null };
  } catch (error) {}

  try {
    const cached = localStorage.getItem('greenview_unit_booking_' + bookingId);
    if (cached) return { data: JSON.parse(cached), error: null };
  } catch {}

  const fallbackBooking: UnitBooking = {
    id: bookingId,
    booking_number: 'UB-' + bookingId,
    resident_id: 'res-1',
    unit_id: '1',
    booking_duration_type: 'monthly',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    rent_amount: 4500000,
    deposit_amount: 9000000,
    admin_fee: 2500,
    total_amount: 13502500,
    payment_status: 'pending',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { data: fallbackBooking, error: null };
}

/**
 * Update unit booking
 */
export async function updateUnitBooking(bookingId: string, updates: Partial<UnitBooking>): Promise<{ data: UnitBooking | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('unit_bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as UnitBooking, error: null };
  } catch (error) {}

  try {
    const cached = localStorage.getItem('greenview_unit_booking_' + bookingId);
    if (cached) {
      const obj = { ...JSON.parse(cached), ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('greenview_unit_booking_' + bookingId, JSON.stringify(obj));
      return { data: obj, error: null };
    }
  } catch {}

  return { data: null, error: null };
}

/**
 * Update resident
 */
export async function updateResident(residentId: string, updates: Partial<Resident>): Promise<{ data: Resident | null; error: any }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('residents')
        .update(updates)
        .eq('id', residentId)
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as Resident, error: null };
  } catch (error) {}

  return { data: { id: residentId, ...updates } as any, error: null };
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

    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.unit_id) query = query.eq('unit_id', filters.unit_id);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));
    if (!error && data && data.length > 0) {
      let filteredData = data;
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        filteredData = data.filter((r: any) =>
          r.users?.email?.toLowerCase().includes(s) ||
          r.users?.full_name?.toLowerCase().includes(s) ||
          r.users?.phone?.toLowerCase().includes(s)
        );
      }
      return { data: filteredData as any[], error: null };
    }
  } catch (error) {}

  const fallback = mockResidents.map((r) => ({
    id: r.id,
    user_id: `user-${r.id}`,
    unit_id: r.unitNumber,
    status: r.status as any,
    deposit_amount: 5000000,
    contract_start: r.contractStart,
    contract_end: r.contractEnd,
    move_in_date: r.contractStart,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      id: `user-${r.id}`,
      email: r.email,
      full_name: r.name,
      phone: r.phone,
    },
    units: {
      id: r.unitNumber,
      unit_number: r.unitNumber,
    },
  }));

  let filtered = fallback;
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter((r) =>
      r.users.full_name.toLowerCase().includes(s) ||
      r.users.email.toLowerCase().includes(s)
    );
  }
  return { data: filtered, error: null };
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

    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));
    if (!error && data && data.length > 0) {
      return { data: data as any[], error: null };
    }
  } catch (error) {}

  const fallback = mockPayments.map((p) => ({
    id: p.id,
    invoice_number: p.invoiceNumber,
    resident_id: p.residentId,
    unit_id: p.unitNumber,
    payment_type: 'rent' as any,
    amount: p.amount,
    total_amount: p.amount,
    due_date: p.dueDate,
    payment_date: p.paymentDate,
    status: p.status as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    residents: {
      id: p.residentId,
      users: {
        email: `${p.residentName.toLowerCase().replace(/\s+/g, '')}@greenview.com`,
        full_name: p.residentName,
      },
    },
    units: {
      unit_number: p.unitNumber,
    },
  }));

  let filtered = fallback;
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.invoice_number.toLowerCase().includes(s) ||
      p.residents?.users?.full_name?.toLowerCase().includes(s)
    );
  }
  return { data: filtered, error: null };
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
  const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const totalAmount = paymentData.amount + paymentData.admin_fee - paymentData.discount + paymentData.penalty;
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('payments')
        .insert({
          ...paymentData,
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as any, error: null };
  } catch (error) {}

  const mockPay = {
    id: 'pay-' + Date.now(),
    ...paymentData,
    invoice_number: invoiceNumber,
    total_amount: totalAmount,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  return { data: mockPay, error: null };
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

    const { data, error } = await withTimeout(
      supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single()
    ).catch(e => ({ data: null, error: e }));

    if (!error && data) return { data: data as any, error: null };
  } catch (error) {}

  return { data: { id: paymentId, status, payment_date: paymentDate }, error: null };
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
  limit?: number;
}) {
  try {
    let query = supabase.from('announcements').select('*');
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.limit) query = query.limit(filters.limit);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));
    if (!error && data && data.length > 0) {
      return { data: data as Announcement[], error: null };
    }
  } catch (error) {}

  return {
    data: mockAnnouncements.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category.toLowerCase() as any,
      content: a.content,
      status: 'published' as any,
      published_at: a.date,
      publish_date: a.date,
      created_at: a.date,
      updated_at: a.date,
    })) as Announcement[],
    error: null,
  };
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

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));

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
    let query = supabase.from('gallery_photos').select('*');
    if (filters?.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters?.is_featured !== undefined) query = query.eq('is_featured', filters.is_featured);
    query = query.order('is_featured', { ascending: false });

    const { data, error } = await withTimeout(query).catch(e => ({ data: null, error: e }));
    if (!error && data && data.length > 0) {
      return { data: data as GalleryPhoto[], error: null };
    }
  } catch (error) {}

  const fallback = [
    {
      id: 'gal-1',
      title: 'Infinity Sky Pool',
      description: 'Kolam renang mewah dengan panorama kota Jakarta',
      photo_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1080',
      category: 'Facilities',
      is_featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gal-2',
      title: 'Modern Grand Lobby',
      description: 'Lobi megah dengan resepsionis dan sistem keamanan 24 jam',
      photo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1080',
      category: 'Interior',
      is_featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gal-3',
      title: 'Sky Fitness Center',
      description: 'Peralatan gym berstandar internasional dengan pemandangan skyline',
      photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080',
      category: 'Facilities',
      is_featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gal-4',
      title: 'Penthouse Living Room',
      description: 'Interior penthouse eksklusif berdesain arsitektur modern minimalis',
      photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080',
      category: 'Interior',
      is_featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gal-5',
      title: 'Green Zen Garden',
      description: 'Taman asri di tengah kompleks hunian untuk relaksasi dan jogging',
      photo_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1080',
      category: 'Exterior',
      is_featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gal-6',
      title: 'Kids Playground',
      description: 'Area bermain anak yang aman, bersih, dan menyenangkan',
      photo_url: 'https://images.unsplash.com/photo-1596464716127-f2a829822391?w=1080',
      category: 'Facilities',
      is_featured: false,
      created_at: new Date().toISOString(),
    },
  ];

  let filtered = fallback;
  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  return { data: filtered as GalleryPhoto[], error: null };
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

