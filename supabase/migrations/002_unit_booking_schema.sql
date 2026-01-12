-- ============================================
-- UNIT BOOKING SCHEMA MIGRATION
-- ============================================
-- This migration adds support for unit rental bookings
-- with weekly, monthly, and yearly duration options

-- Add booking duration type enum
CREATE TYPE booking_duration_type AS ENUM ('weekly', 'monthly', 'yearly');

-- Modify units table: Add separate rent columns for different durations
ALTER TABLE units
  ADD COLUMN IF NOT EXISTS weekly_rent DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS yearly_rent DECIMAL(15, 2);

-- Rename monthly_rent to be explicit (already exists, just ensure naming consistency)
-- monthly_rent already exists, so we'll keep it

-- Add comment for clarity
COMMENT ON COLUMN units.monthly_rent IS 'Monthly rent price';
COMMENT ON COLUMN units.weekly_rent IS 'Weekly rent price (optional)';
COMMENT ON COLUMN units.yearly_rent IS 'Yearly rent price (optional)';
COMMENT ON COLUMN units.yearly_booking_price IS 'Deprecated: Use yearly_rent instead';

-- Create unit_bookings table
CREATE TABLE IF NOT EXISTS unit_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(100) UNIQUE NOT NULL,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    booking_duration_type booking_duration_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2) DEFAULT 0,
    admin_fee DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    status booking_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Modify residents table: Add unit_booking_id and key_collected_at
ALTER TABLE residents
  ADD COLUMN IF NOT EXISTS unit_booking_id UUID REFERENCES unit_bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS key_collected_at TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN residents.unit_booking_id IS 'Reference to the unit booking that assigned this unit';
COMMENT ON COLUMN residents.key_collected_at IS 'Timestamp when resident collected the unit key';

-- Modify payment_type enum to include 'unit_booking'
-- Note: PostgreSQL doesn't support ALTER TYPE ADD VALUE in transaction blocks easily
-- We'll use DO block to handle this safely
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'unit_booking' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')
    ) THEN
        ALTER TYPE payment_type ADD VALUE 'unit_booking';
    END IF;
END $$;

-- Create unit_booking_payments junction table
CREATE TABLE IF NOT EXISTS unit_booking_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_booking_id UUID NOT NULL REFERENCES unit_bookings(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(unit_booking_id, payment_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_unit_bookings_resident_id ON unit_bookings(resident_id);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_unit_id ON unit_bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_status ON unit_bookings(status);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_payment_status ON unit_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_booking_number ON unit_bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_start_date ON unit_bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_unit_bookings_end_date ON unit_bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_residents_unit_booking_id ON residents(unit_booking_id);
CREATE INDEX IF NOT EXISTS idx_unit_booking_payments_unit_booking_id ON unit_booking_payments(unit_booking_id);
CREATE INDEX IF NOT EXISTS idx_unit_booking_payments_payment_id ON unit_booking_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_units_weekly_rent ON units(weekly_rent) WHERE weekly_rent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_units_yearly_rent ON units(yearly_rent) WHERE yearly_rent IS NOT NULL;

-- Add trigger for updated_at on unit_bookings
CREATE TRIGGER update_unit_bookings_updated_at BEFORE UPDATE ON unit_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE unit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_booking_payments ENABLE ROW LEVEL SECURITY;

-- Add helpful comments
COMMENT ON TABLE unit_bookings IS 'Tracks unit rental bookings with duration options (weekly/monthly/yearly)';
COMMENT ON TABLE unit_booking_payments IS 'Junction table linking unit bookings to their payment records';

