/**
 * Helper functions untuk check Supabase configuration
 */

export function checkSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  const issues: string[] = [];

  if (!url || url === '' || url === 'your_supabase_project_url') {
    issues.push('VITE_SUPABASE_URL tidak ditemukan atau tidak valid');
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL harus berupa URL yang valid');
  } else if (!url.includes('supabase.co')) {
    issues.push('VITE_SUPABASE_URL sepertinya bukan URL Supabase yang valid');
  }

  if (!key || key === '' || key === 'your_supabase_anon_key') {
    issues.push('VITE_SUPABASE_ANON_KEY tidak ditemukan atau tidak valid');
  } else if (key.length < 50) {
    issues.push('VITE_SUPABASE_ANON_KEY sepertinya tidak valid (terlalu pendek)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    url: url || 'not set',
    keySet: !!key && key !== 'your_supabase_anon_key',
  };
}

