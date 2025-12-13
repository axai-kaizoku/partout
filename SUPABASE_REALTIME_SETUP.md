# Supabase Realtime Setup Guide

## Step 1: Enable Realtime in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Database** → **Replication**
3. Find the `partout_messages` table in the list
4. Toggle the switch to **enable replication** for this table
5. Also enable replication for `partout_conversations` (optional, but recommended)

## Step 2: Set Up Row Level Security (RLS) Policies

The Realtime subscriptions respect RLS policies, so you need to set them up.

### Go to: Database → Policies

Run these SQL commands in the **SQL Editor**:

```sql
-- Enable RLS on the tables
ALTER TABLE partout_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partout_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in conversations they're part of
CREATE POLICY "Users can view their messages"
ON partout_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partout_conversations
    WHERE partout_conversations.id = partout_messages.conversation_id
    AND (
      partout_conversations.seller_id = auth.uid()
      OR partout_conversations.buyer_id = auth.uid()
    )
  )
);

-- Policy: Users can insert messages in their conversations
CREATE POLICY "Users can send messages"
ON partout_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partout_conversations
    WHERE partout_conversations.id = partout_messages.conversation_id
    AND (
      partout_conversations.seller_id = auth.uid()
      OR partout_conversations.buyer_id = auth.uid()
    )
    AND partout_messages.sender_id = auth.uid()
  )
);

-- Policy: Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
ON partout_conversations
FOR SELECT
USING (
  seller_id = auth.uid() OR buyer_id = auth.uid()
);

-- Policy: Users can create conversations as buyers
CREATE POLICY "Users can create conversations"
ON partout_conversations
FOR INSERT
WITH CHECK (
  buyer_id = auth.uid()
);

-- Policy: Users can update their conversations (for lastMessageAt)
CREATE POLICY "Users can update their conversations"
ON partout_conversations
FOR UPDATE
USING (
  seller_id = auth.uid() OR buyer_id = auth.uid()
);
```

## Step 3: Grant Realtime Permissions

Still in the **SQL Editor**, run:

```sql
-- Grant permissions for Realtime to publish changes
GRANT SELECT ON partout_messages TO authenticated;
GRANT SELECT ON partout_conversations TO authenticated;

-- Ensure the authenticated role can listen to changes
ALTER PUBLICATION supabase_realtime ADD TABLE partout_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE partout_conversations;
```

## Step 4: Verify Your Environment Variables

Make sure these are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 5: Test the Realtime Connection

You can test if Realtime is working by:

1. Open your app in two different browser windows
2. Sign in as different users in each window
3. Start a conversation
4. Send a message from one window
5. The message should appear instantly in the other window

## Common Setup Issues

### Issue: "operator does not exist: text = uuid"

**Cause**: Your profile IDs are `text` (using nanoid), but `auth.uid()` returns `uuid`.

**Solution**: The updated SQL script already includes `::text` casts. Use the latest version of `supabase-realtime-setup.sql`.

## Troubleshooting

### Issue: Messages not appearing in real-time

**Solution 1**: Check if replication is enabled
- Go to Database → Replication
- Make sure `partout_messages` has replication enabled

**Solution 2**: Check RLS policies
- Go to Database → Policies
- Verify the policies are created correctly

**Solution 3**: Check browser console
- Open DevTools → Console
- Look for any Supabase errors

### Issue: "PGRST301" or permission denied errors

**Solution**: The authenticated user doesn't have proper permissions
- Run the RLS policy SQL commands again
- Make sure `auth.uid()` matches your user's ID in the `profiles` table

### Issue: Realtime connects but no data flows

**Solution**: Check the publication
```sql
-- Verify tables are in the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- If missing, add them:
ALTER PUBLICATION supabase_realtime ADD TABLE partout_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE partout_conversations;
```

## Advanced Configuration (Optional)

### Enable Realtime for specific events only

By default, we listen to INSERT events. You can also listen to UPDATE and DELETE:

```typescript
// In your hook
channel = supabase
  .channel(`messages:${conversationId}`)
  .on(
    "postgres_changes",
    {
      event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
      schema: "public",
      table: "partout_messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      // Handle payload
    }
  )
  .subscribe();
```

## Notes

- Realtime subscriptions count toward your Supabase plan limits
- Free tier: 200 concurrent Realtime connections
- Each browser tab = 1 connection
- Connections are automatically cleaned up when users close the tab

## Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify your user is authenticated: `supabase.auth.getUser()`
