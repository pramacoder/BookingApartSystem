-- ============================================
-- RLS POLICY: Allow users to insert their own record
-- ============================================
-- Policy ini diperlukan agar user bisa membuat record di tabel users
-- saat registrasi melalui Supabase Auth
-- ============================================

-- Policy untuk INSERT: User bisa insert record dengan id yang sama dengan auth.uid()
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

-- Alternative: Jika ingin lebih permisif (untuk development/testing)
-- Hapus policy di atas dan gunakan ini:
-- CREATE POLICY "Allow authenticated users to insert" ON users
--   FOR INSERT 
--   WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Pastikan RLS sudah diaktifkan di tabel users:
--    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--
-- 2. Policy ini memungkinkan user untuk insert record dengan id yang sama
--    dengan auth.uid() (ID dari Supabase Auth)
--
-- 3. Jika masih error, pastikan:
--    - RLS sudah diaktifkan
--    - Policy sudah dibuat
--    - User sudah authenticated (sudah signup di Supabase Auth)
--
-- 4. Untuk testing, bisa juga nonaktifkan RLS sementara:
--    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
--    (JANGAN gunakan di production!)
-- ============================================





