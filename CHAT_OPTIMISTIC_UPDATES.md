# Chat Optimistic Updates - Implementation Guide

## What We Fixed

### 1. ✅ Invalid Date Issue
**Problem**: Messages showed "Invalid Date" when sent because optimistic messages didn't have proper timestamps.

**Solution**: Now we create optimistic messages with `createdAt: new Date()`, ensuring proper date formatting.

### 2. ✅ "You" Display Issue
**Problem**: User's own messages showed their name instead of "You".

**Solution**: Optimistic messages now include a sender object with `name: "You"`, and we properly check `message.senderId === currentUserId` to display the avatar fallback correctly.

### 3. ✅ Better UX with React Query Cache
**Problem**: Using local state for optimistic updates was clunky and didn't integrate well with React Query's caching.

**Solution**: Now using React Query's proper optimistic update pattern with `onMutate`, `onError`, and `onSettled`.

---

## How It Works Now

### Optimistic Updates Flow

```typescript
sendMessageMutation = api.chat.sendMessage.useMutation({
  // 1. Before mutation runs (onMutate)
  onMutate: async (newMessage) => {
    // Cancel any outgoing refetches to prevent race conditions
    await utils.chat.getMessages.cancel(conversationId);

    // Take a snapshot of current data for rollback
    const previousMessages = utils.chat.getMessages.getData(conversationId);

    // Create optimistic message with proper structure
    const optimisticMessage = {
      id: `temp-${Date.now()}`,  // Temporary ID
      conversationId,
      senderId: currentUserId,
      content: newMessage.content,
      isRead: false,
      createdAt: new Date(),  // ✅ Proper timestamp
      sender: {
        id: currentUserId,
        name: "You",  // ✅ Display as "You"
        imageUrl: null,
      },
    };

    // Update the cache immediately (user sees message instantly)
    utils.chat.getMessages.setData(conversationId, (old) => [
      ...(old || []),
      optimisticMessage,
    ]);

    // Return snapshot for potential rollback
    return { previousMessages };
  },

  // 2. If mutation fails (onError)
  onError: (err, newMessage, context) => {
    // Rollback to previous state
    if (context?.previousMessages) {
      utils.chat.getMessages.setData(conversationId, context.previousMessages);
    }
  },

  // 3. After success or error (onSettled)
  onSettled: () => {
    // Refetch to ensure cache matches server
    utils.chat.getMessages.invalidate(conversationId);
    utils.chat.getConversations.invalidate();
  },
});
```

### Realtime Updates Flow

When a message arrives via Supabase Realtime:

```typescript
const handleNewMessage = useCallback((newMessage: Message) => {
  // Update the cache with the real message
  utils.chat.getMessages.setData(conversationId, (old) => {
    if (!old) return [newMessage];

    // Avoid duplicates (replaces optimistic message)
    if (old.some((m) => m.id === newMessage.id)) {
      return old;
    }

    return [...old, newMessage];
  });

  // Update conversations list
  utils.chat.getConversations.invalidate();
}, [conversationId, utils]);
```

---

## Benefits of This Approach

### 1. Instant Feedback
- User sees their message immediately
- No waiting for server response
- Feels like a native app

### 2. Automatic Rollback
- If network fails, message disappears
- User gets error notification
- Cache stays consistent

### 3. Deduplication
- Optimistic message has temp ID (`temp-${Date.now()}`)
- Real message from server has real ID
- When server responds, optimistic is replaced
- Realtime updates check for duplicates

### 4. Cache Consistency
- `onSettled` ensures cache matches server
- Works with React Query's built-in staleness
- Automatic refetching when needed

---

## User Experience Flow

### Sending a Message

1. **User types and hits send**
   - Message input is disabled (shows "sending..." state)

2. **Optimistic update (instant)**
   - Message appears in chat immediately
   - Shows "You" as sender
   - Shows current timestamp
   - Message is on the right side (current user)

3. **Server processes (background)**
   - tRPC mutation sends to server
   - Database saves the message
   - Real message ID is generated

4. **Server responds (success)**
   - Optimistic message is replaced with real one
   - ID changes from `temp-123` to real nanoid
   - Cache is invalidated and refetched
   - Input is re-enabled

5. **Realtime broadcast**
   - Other user receives message via Supabase Realtime
   - Their cache is updated
   - They see the message instantly

### Receiving a Message

1. **Realtime event fires**
   - Supabase Realtime detects INSERT on `partout_messages`

2. **Cache update**
   - `handleNewMessage` is called
   - Message is added to cache
   - Duplicate check prevents double-display

3. **UI updates**
   - Message appears in chat
   - Shows sender's name and avatar
   - Message is on the left side (other user)
   - Auto-scroll to bottom

---

## Error Handling

### Network Failure
```typescript
onError: (err, newMessage, context) => {
  // Rollback optimistic update
  utils.chat.getMessages.setData(conversationId, context.previousMessages);

  // User sees toast notification
  toast.error("Failed to send message. Please try again.");
}
```

### Server Error
- Same rollback mechanism
- Original message state is restored
- User can retry sending

---

## Performance Considerations

### Cache Management
- Messages are cached per conversation
- Old conversations are garbage collected by React Query
- `staleTime` and `cacheTime` can be configured

### Realtime Subscriptions
- One subscription per open conversation
- Cleanup on unmount
- No memory leaks

### Deduplication Strategy
```typescript
// Check message ID to avoid duplicates
if (old.some((m) => m.id === newMessage.id)) {
  return old;  // Skip duplicate
}
```

---

## Debugging Tips

### Check Optimistic Messages
```typescript
// In browser console
console.log('Messages cache:',
  queryClient.getQueryData(['chat.getMessages', conversationId])
);
```

### Verify Realtime Connection
```typescript
// In useRealtimeMessages hook
console.log('Realtime status:', channel.state);
```

### Monitor Mutations
```typescript
// In React Query Devtools
// Look for "chat.sendMessage" mutation
// Check status: idle, loading, success, error
```

---

## Future Enhancements

### Typing Indicators
- Use Supabase Realtime presence
- Broadcast "typing" events
- Show "User is typing..." indicator

### Read Receipts
- Mark messages as read when viewed
- Show checkmarks (single/double)
- Use optimistic updates for instant feedback

### Message Reactions
- Add emoji reactions
- Optimistic update on click
- Realtime broadcast to other user

### Offline Support
- Queue messages when offline
- Send when connection restored
- Use IndexedDB for persistence
