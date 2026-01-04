-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES EXAMPLES
-- ============================================
-- 
-- File ini berisi contoh-contoh RLS policies yang bisa Anda gunakan
-- Sesuaikan dengan kebutuhan aplikasi Anda
-- 
-- Catatan: Policies ini adalah contoh, sesuaikan dengan logic bisnis Anda
-- ============================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function untuk check apakah user adalah admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk check apakah user adalah resident
CREATE OR REPLACE FUNCTION is_resident(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM residents WHERE residents.user_id = is_resident.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk mendapatkan resident_id dari user_id
CREATE OR REPLACE FUNCTION get_resident_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM residents WHERE residents.user_id = get_resident_id.user_id LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (is_admin(auth.uid()::uuid));

-- ============================================
-- RESIDENTS POLICIES
-- ============================================

-- Residents can view their own data
CREATE POLICY "Residents can view own data" ON residents
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Residents can update their own data
CREATE POLICY "Residents can update own data" ON residents
  FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Admins can view all residents
CREATE POLICY "Admins can view all residents" ON residents
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can insert/update residents
CREATE POLICY "Admins can manage residents" ON residents
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- UNITS POLICIES
-- ============================================

-- Everyone can view available units
CREATE POLICY "Everyone can view available units" ON units
  FOR SELECT USING (status = 'available');

-- Residents can view their own unit
CREATE POLICY "Residents can view own unit" ON units
  FOR SELECT USING (
    id IN (
      SELECT unit_id FROM residents WHERE user_id = auth.uid()::uuid
    )
  );

-- Admins can do everything with units
CREATE POLICY "Admins can manage units" ON units
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Residents can view their own payments
CREATE POLICY "Residents can view own payments" ON payments
  FOR SELECT USING (
    resident_id = get_resident_id(auth.uid()::uuid)
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can insert/update payments
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================

-- Residents can view their own payment transactions
CREATE POLICY "Residents can view own transactions" ON payment_transactions
  FOR SELECT USING (
    payment_id IN (
      SELECT id FROM payments 
      WHERE resident_id = get_resident_id(auth.uid()::uuid)
    )
  );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON payment_transactions
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can update transactions
CREATE POLICY "Admins can update transactions" ON payment_transactions
  FOR UPDATE USING (is_admin(auth.uid()::uuid));

-- ============================================
-- FACILITIES POLICIES
-- ============================================

-- Everyone can view active facilities
CREATE POLICY "Everyone can view active facilities" ON facilities
  FOR SELECT USING (status = 'active');

-- Admins can manage facilities
CREATE POLICY "Admins can manage facilities" ON facilities
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- FACILITY BOOKINGS POLICIES
-- ============================================

-- Residents can view their own bookings
CREATE POLICY "Residents can view own bookings" ON facility_bookings
  FOR SELECT USING (
    resident_id = get_resident_id(auth.uid()::uuid)
  );

-- Residents can create bookings
CREATE POLICY "Residents can create bookings" ON facility_bookings
  FOR INSERT WITH CHECK (
    resident_id = get_resident_id(auth.uid()::uuid)
  );

-- Residents can update their own pending bookings
CREATE POLICY "Residents can update own bookings" ON facility_bookings
  FOR UPDATE USING (
    resident_id = get_resident_id(auth.uid()::uuid) 
    AND status = 'pending'
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON facility_bookings
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON facility_bookings
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- TICKETS POLICIES
-- ============================================

-- Residents can view their own tickets
CREATE POLICY "Residents can view own tickets" ON tickets
  FOR SELECT USING (
    resident_id = get_resident_id(auth.uid()::uuid)
  );

-- Residents can create tickets
CREATE POLICY "Residents can create tickets" ON tickets
  FOR INSERT WITH CHECK (
    resident_id = get_resident_id(auth.uid()::uuid)
  );

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON tickets
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can manage all tickets
CREATE POLICY "Admins can manage all tickets" ON tickets
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- TICKET UPDATES POLICIES
-- ============================================

-- Users can view updates for tickets they have access to
CREATE POLICY "Users can view ticket updates" ON ticket_updates
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets 
      WHERE resident_id = get_resident_id(auth.uid()::uuid)
      OR assigned_to IN (SELECT id FROM admins WHERE user_id = auth.uid()::uuid)
    )
  );

-- Residents can add updates to their own tickets
CREATE POLICY "Residents can add updates to own tickets" ON ticket_updates
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets 
      WHERE resident_id = get_resident_id(auth.uid()::uuid)
    )
    AND user_id = auth.uid()::uuid
  );

-- Admins can add updates to any ticket
CREATE POLICY "Admins can add updates to any ticket" ON ticket_updates
  FOR INSERT WITH CHECK (is_admin(auth.uid()::uuid));

-- ============================================
-- ANNOUNCEMENTS POLICIES
-- ============================================

-- Everyone can view published announcements
CREATE POLICY "Everyone can view published announcements" ON announcements
  FOR SELECT USING (status = 'published');

-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements" ON announcements
  FOR SELECT USING (is_admin(auth.uid()::uuid));

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid()::uuid);

-- System can insert notifications (using service role)
-- Note: This should be done via service role, not RLS policy

-- ============================================
-- GALLERY PHOTOS POLICIES
-- ============================================

-- Everyone can view gallery photos
CREATE POLICY "Everyone can view gallery photos" ON gallery_photos
  FOR SELECT USING (true);

-- Admins can manage gallery photos
CREATE POLICY "Admins can manage gallery photos" ON gallery_photos
  FOR ALL USING (is_admin(auth.uid()::uuid));

-- ============================================
-- NOTES
-- ============================================
-- 
-- 1. Pastikan untuk menguji semua policies setelah implementasi
-- 2. Sesuaikan policies dengan kebutuhan bisnis Anda
-- 3. Untuk operasi yang memerlukan service role (seperti insert notifications),
--    gunakan service role key di backend, bukan RLS policy
-- 4. Test dengan berbagai role (admin, resident, guest) untuk memastikan
--    security bekerja dengan benar
-- 5. Pertimbangkan untuk membuat policies yang lebih granular jika diperlukan

