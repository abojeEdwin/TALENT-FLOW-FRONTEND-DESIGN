# Debug Notification Endpoint Issue

## Error Analysis

The error `Failed to mark all notifications as read: APIError: Unexpected server error` indicates that the backend endpoint `/notifications/read-all` is not working as expected.

## Possible Causes

1. **Endpoint doesn't exist** - The backend might not have implemented this endpoint
2. **Wrong HTTP method** - Backend might expect PUT instead of PATCH
3. **Different endpoint path** - Backend might use a different URL pattern
4. **Authentication issue** - Token might be invalid or missing permissions
5. **Backend error** - The backend code might have a bug

## Debugging Steps

### 1. Check Browser Network Tab

Open your browser's Developer Tools (F12) → Network tab and look for the request to `/notifications/read-all`:

- **Request URL**: Should be `http://localhost:8080/api/v1/notifications/read-all`
- **Request Method**: Should be `PATCH`
- **Status Code**: What status code is returned? (400, 404, 500?)
- **Response Body**: What error message does the backend return?
- **Request Headers**: Is the Authorization header present?

### 2. Check Backend Logs

Look at your backend console/logs when you click "Mark all read". You should see:
- The incoming request
- Any error messages
- Stack traces if there's an exception

### 3. Test with cURL

Test the endpoint directly from terminal:

```bash
# Replace YOUR_TOKEN with your actual JWT token from localStorage
# You can get it from browser console: localStorage.getItem('auth_token')

curl -X PATCH http://localhost:8080/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

### 4. Check Backend Code

Look for the endpoint in your backend code. It should be something like:

```java
@PatchMapping("/notifications/read-all")
public ResponseEntity<?> markAllNotificationsAsRead(@AuthenticationPrincipal User user) {
    // Implementation
}
```

Common issues:
- ❌ Endpoint not implemented
- ❌ Wrong HTTP method annotation (@PostMapping instead of @PatchMapping)
- ❌ Missing @AuthenticationPrincipal or authentication logic
- ❌ Exception being thrown in the implementation

## Solutions Applied

I've added several improvements to handle this error:

### 1. Better Error Logging
The API client now logs detailed error information:
```typescript
console.error(`[API Error] ${method} ${endpoint}:`, {
  status: response.status,
  statusText: response.statusText,
  errorMessage,
  data
});
```

### 2. Fallback Strategy
If marking all as read fails, the app will try to mark each notification individually:
```typescript
// Try fallback: mark each unread notification individually
const unreadNotifications = previousNotifications.filter(n => !n.read);
await Promise.all(
  unreadNotifications.map(n => markNotificationAsRead(n.id))
);
```

### 3. Alternative Endpoints
The app now tries multiple endpoint patterns:
1. `PATCH /notifications/read-all` (primary)
2. `PATCH /notifications/mark-all-read` (alternative)
3. `PUT /notifications/read-all` (alternative method)

### 4. User Feedback
Shows a toast notification if the operation fails:
```typescript
toast.error("Failed to mark all notifications as read. Please try again.");
```

## Quick Fix Options

### Option 0: Use the Test Page (Start Here!)

I've created a test page to help you identify the issue:

1. Navigate to `http://localhost:3000/test-notifications`
2. Click each button to test different endpoints
3. Look for which one returns ✅ SUCCESS
4. Check the browser console and Network tab for details
5. Share the results with your backend team

This will quickly tell you:
- If the endpoint exists
- What HTTP method it expects
- What error the backend is returning

### Option A: Fix the Backend (Recommended)

Add or fix the endpoint in your backend:

```java
@PatchMapping("/notifications/read-all")
public ResponseEntity<Void> markAllNotificationsAsRead(
    @AuthenticationPrincipal UserDetails userDetails
) {
    try {
        String userId = userDetails.getUsername(); // or however you get user ID
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        log.error("Error marking all notifications as read", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

### Option B: Use Individual Marking (Temporary)

If you can't fix the backend immediately, the fallback strategy will automatically mark notifications individually. This is slower but works.

### Option C: Disable the Feature Temporarily

Comment out the "Mark all read" button in `components/shared/notification-panel.tsx`:

```typescript
{/* Temporarily disabled until backend is fixed
<Button
  variant="ghost"
  size="sm"
  className="h-7 px-2 text-xs"
  onClick={markAllAsRead}
>
  <Check className="w-3 h-3 mr-1" />
  Mark all read
</Button>
*/}
```

## Next Steps

1. **Check the browser console** - Look for the detailed error log I added
2. **Check the Network tab** - See what status code and response the backend returns
3. **Check backend logs** - See if there's an error on the backend side
4. **Share the findings** - Let me know what you discover and I can help further

## Expected Console Output

After my changes, you should see detailed logs like:

```
[API Error] PATCH /notifications/read-all: {
  status: 404,
  statusText: "Not Found",
  errorMessage: "Endpoint not found",
  data: {...}
}
Attempting fallback: marking 5 notifications individually
```

This will help us understand exactly what's going wrong!
