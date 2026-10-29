-- ============================================
-- 003_chat_schema.sql
-- Chat Rooms & Chat Messages Schema (PostgreSQL)
-- Unifying all storage into PostgreSQL
-- ============================================

-- Add new values to notification_type enum if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type typ INNER JOIN pg_enum enu ON enu.enumtypid = typ.oid WHERE typ.typname = 'notification_type' AND enu.enumlabel = 'unit_assigned') THEN
        ALTER TYPE notification_type ADD VALUE 'unit_assigned';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type typ INNER JOIN pg_enum enu ON enu.enumtypid = typ.oid WHERE typ.typname = 'notification_type' AND enu.enumlabel = 'key_pickup') THEN
        ALTER TYPE notification_type ADD VALUE 'key_pickup';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id VARCHAR(100) PRIMARY KEY,
    resident_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resident_name VARCHAR(255),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_name VARCHAR(255),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(100) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('resident', 'admin')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_resident_id ON chat_rooms(resident_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated_at ON chat_rooms(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_rooms
CREATE POLICY "Allow authenticated read chat_rooms" 
ON chat_rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert/update chat_rooms" 
ON chat_rooms FOR ALL TO authenticated USING (true);

-- Policies for chat_messages
CREATE POLICY "Allow authenticated read chat_messages" 
ON chat_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert chat_messages" 
ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update chat_messages" 
ON chat_messages FOR UPDATE TO authenticated USING (true);

-- Enable Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
    END IF;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

