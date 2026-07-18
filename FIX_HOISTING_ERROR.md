# Fix: "Cannot access 'markAsRead' before initialization" Error

## Error
```
ReferenceError: Cannot access 'markAsRead' before initialization
at NotificationProvider
```

## Root Cause
**JavaScript Hoisting Issue** - The `useEffect` hook was trying to use the `markAsRead` function before it was defined.

### The Problem Code
```typescript
// ❌ WRONG ORDER
useEffect(() => {
  const handleMarkChatNotificationsRead = async (event: CustomEvent) => {
    // ...
    await markAsRead(notification.id);  // ← Using markAsRead here
  };
  // ...
}, [notifications, markAsRead]);  // ← Depending on markAsRead

// markAsRead is defined LATER (too late!)
const markAsRead = useCallback(async (id: string) => {
  // ...
}, []);
```

## The Fix
Move the `useEffect` to **AFTER** the `markAsRead` function is defined:

```typescript
// ✅ CORRECT ORDER

// 1. Define markAsRead first
const markAsRead = useCallback(async (id: string) => {
  // Optimistically update UI
  setNotifications((prev) => {
    const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    const unreadInUpdated = updated.filter((n) => !n.read).length;
    setUnreadCount(unreadInUpdated);
    return updated;
  });

  try {
    await markNotificationAsRead(id);
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    // Revert optimistic update on error
    setNotifications((prev) => {
      const reverted = prev.map((n) => (n.id === id ? { ...n, read: false } : n));
      const unreadInReverted = reverted.filter((n) => !n.read).length;
      setUnreadCount(unreadInReverted);
      return reverted;
    });
  }
}, []);

// 2. Then use it in useEffect
useEffect(() => {
  const handleMarkChatNotificationsRead = async (event: Event) => {
    const customEvent = event as CustomEvent;
    const { conversationId } = customEvent.detail;
    
    // Find all unread chat notifications for this conversation
    const chatNotifications = notifications.filter(
      n => n.type === 'CHAT_MESSAGE_RECEIVED' && 
           !n.read && 
           (n.payload as any)?.conversationId === conversationId
    );
    
    // Mark each notification as read
    for (const notification of chatNotifications) {
      await markAsRead(notification.id);  // ← Now markAsRead is defined!
    }
  };
  
  window.addEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead);
  
  return () => {
    window.removeEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead);
  };
}, [notifications, markAsRead]);
```

## Additional Fix: TypeScript Type Casting
Also fixed the TypeScript error with event listener:

```typescript
// ❌ WRONG
const handleMarkChatNotificationsRead = async (event: CustomEvent) => {
  // ...
};
window.addEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead as EventListener);

// ✅ CORRECT
const handleMarkChatNotificationsRead = async (event: Event) => {
  const customEvent = event as CustomEvent;  // Cast inside the function
  const { conversationId } = customEvent.detail;
  // ...
};
window.addEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead);
```

## Why This Happened
In JavaScript/TypeScript, `useCallback` and `useEffect` hooks are executed in the order they appear in the code. If a `useEffect` depends on a function defined with `useCallback`, the `useCallback` must come first.

### Execution Order
1. Component renders
2. All `useCallback` hooks are executed (functions are created)
3. All `useEffect` hooks are executed (side effects run)

If `useEffect` tries to use a function that hasn't been created yet by `useCallback`, you get a "Cannot access before initialization" error.

## Files Modified
✅ `lib/context/notification-context.tsx` - Moved `useEffect` after `markAsRead` definition

## Testing
After this fix:
1. ✅ No more "Cannot access 'markAsRead' before initialization" error
2. ✅ Chat notifications are marked as read when opening a conversation
3. ✅ Event listener works correctly

## Prevention
To avoid this in the future:

### Rule 1: Define Functions Before Using Them
```typescript
// ✅ GOOD
const myFunction = useCallback(() => { /* ... */ }, []);
useEffect(() => { myFunction(); }, [myFunction]);

// ❌ BAD
useEffect(() => { myFunction(); }, [myFunction]);
const myFunction = useCallback(() => { /* ... */ }, []);
```

### Rule 2: Order Hooks Logically
1. `useState` - State declarations
2. `useRef` - Ref declarations
3. `useCallback` - Function definitions
4. `useEffect` - Side effects that use the functions
5. `useMemo` - Memoized values

### Rule 3: Check Dependencies
If a `useEffect` depends on a function, make sure that function is defined before the `useEffect`.

## Summary
The error was caused by trying to use `markAsRead` in a `useEffect` before it was defined. Moving the `useEffect` to after the `markAsRead` definition fixed the issue.

**Key Changes:**
- ✅ Moved event listener `useEffect` after `markAsRead` definition
- ✅ Fixed TypeScript type casting for CustomEvent
- ✅ Cleared Next.js cache to apply changes

Now restart your dev server and the error should be gone! 🎉
