-- =====================================================
-- Supabase Realtime Setup for Chat Feature
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Enable Row Level Security
-- =====================================================
ALTER TABLE partout_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partout_conversations ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any) to avoid conflicts
-- =====================================================
DROP POLICY IF EXISTS "Users can view their messages" ON partout_messages;
DROP POLICY IF EXISTS "Users can send messages" ON partout_messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON partout_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON partout_conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON partout_conversations;

-- Step 3: Create RLS Policies for Messages
-- =====================================================

-- Allow users to view messages in conversations they're part of
CREATE POLICY "Users can view their messages"
ON partout_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partout_conversations
    WHERE partout_conversations.id = partout_messages.conversation_id
    AND (
      partout_conversations.seller_id = auth.uid()::text
      OR partout_conversations.buyer_id = auth.uid()::text
    )
  )
);

-- Allow users to send messages in their conversations
CREATE POLICY "Users can send messages"
ON partout_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partout_conversations
    WHERE partout_conversations.id = partout_messages.conversation_id
    AND (
      partout_conversations.seller_id = auth.uid()::text
      OR partout_conversations.buyer_id = auth.uid()::text
    )
  )
  AND partout_messages.sender_id = auth.uid()::text
);

-- Allow users to update their own messages (for read receipts, etc.)
CREATE POLICY "Users can update messages"
ON partout_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM partout_conversations
    WHERE partout_conversations.id = partout_messages.conversation_id
    AND (
      partout_conversations.seller_id = auth.uid()::text
      OR partout_conversations.buyer_id = auth.uid()::text
    )
  )
);

-- Step 4: Create RLS Policies for Conversations
-- =====================================================

-- Allow users to view conversations they're part of
CREATE POLICY "Users can view their conversations"
ON partout_conversations
FOR SELECT
USING (
  seller_id = auth.uid()::text OR buyer_id = auth.uid()::text
);

-- Allow buyers to create conversations
CREATE POLICY "Users can create conversations"
ON partout_conversations
FOR INSERT
WITH CHECK (
  buyer_id = auth.uid()::text
);

-- Allow users to update conversations they're part of (for lastMessageAt)
CREATE POLICY "Users can update their conversations"
ON partout_conversations
FOR UPDATE
USING (
  seller_id = auth.uid()::text OR buyer_id = auth.uid()::text
);

-- Step 5: Grant Realtime Permissions
-- =====================================================

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON partout_messages TO authenticated;
GRANT SELECT ON partout_conversations TO authenticated;
GRANT INSERT ON partout_messages TO authenticated;
GRANT INSERT ON partout_conversations TO authenticated;
GRANT UPDATE ON partout_messages TO authenticated;
GRANT UPDATE ON partout_conversations TO authenticated;

-- Step 6: Add tables to Realtime publication
-- =====================================================

-- Add messages table to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE partout_messages;

-- Add conversations table to Realtime (optional, for conversation updates)
ALTER PUBLICATION supabase_realtime ADD TABLE partout_conversations;

-- Step 7: Verify setup
-- =====================================================

-- Check if tables are in the publication
SELECT
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('partout_messages', 'partout_conversations');

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('partout_messages', 'partout_conversations');

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next steps:
-- 1. Go to Database → Replication in Supabase dashboard
-- 2. Enable replication for partout_messages table
-- 3. Enable replication for partout_conversations table (optional)
-- 4. Test your chat feature!
-- =====================================================
