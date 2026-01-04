import { supabase } from './supabase';

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

