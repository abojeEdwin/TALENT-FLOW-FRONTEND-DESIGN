# Forgot Password Flow Update

## Overview
Updated the frontend to implement the new PIN-based password reset flow that matches the backend changes in the `feat/restructure` branch.

## New Password Reset Flow

### Step 1: Request Password Reset
**Page:** `/auth/forgot-password`
**Component:** `ForgotPasswordForm`
**API:** `POST /api/v1/auth/request-password-reset`

- User enters their email address
- Backend sends a 6-digit PIN to the user's email
- User is redirected to the PIN verification page

### Step 2: Verify PIN
**Page:** `/auth/verify-reset-pin?email={email}`
**Component:** `VerifyResetPinForm`
**API:** `POST /api/v1/auth/verify-password-reset-pin`

- User enters the 6-digit PIN received via email
- PIN can be pasted or entered digit by digit
- Auto-focus moves to next input on digit entry
- Backend verifies the PIN and returns a `tokenValue`
- User is redirected to the password reset page with the token

### Step 3: Reset Password
**Page:** `/auth/reset-password?token={tokenValue}`
**Component:** `ResetPasswordForm`
**API:** `POST /api/v1/auth/reset-password`

- User enters their new password
- Password must be at least 8 characters with letters and numbers
- Backend validates the token and updates the password
- User is redirected to login page

## Files Created

### Components
1. **`components/auth/forgot-password-form.tsx`**
   - Form to request password reset via email
   - Validates email format
   - Displays success/error messages

2. **`components/auth/verify-reset-pin-form.tsx`**
   - 6-digit PIN input interface
   - Auto-focus and paste support for better UX
   - Resend PIN functionality
   - Option to change email

### Pages
3. **`app/auth/verify-reset-pin/page.tsx`**
   - New page for PIN verification step
   - Uses Suspense for search params handling

## Files Modified

### API Layer
1. **`lib/api/types.ts`**
   - Added `RequestPasswordResetRequest` and `RequestPasswordResetResponse`
   - Added `VerifyPasswordResetPinRequest` and `VerifyPasswordResetPinResponse`
   - Added `ResetPasswordWithTokenRequest`

2. **`lib/api/auth.ts`**
   - Added `requestPasswordReset()` function
   - Added `verifyPasswordResetPin()` function
   - Added `resetPasswordWithToken()` function

### Validators
3. **`lib/utils/validators.ts`**
   - Added `verifyPinSchema` for PIN validation (6 digits)
   - Added `resetPasswordWithTokenSchema` for password reset with token
   - Exported new form data types

### Components
4. **`components/auth/reset-password-form.tsx`**
   - Updated to use new token-based API (`resetPasswordWithToken`)
   - Improved UI with Card components for consistency
   - Better error handling

5. **`components/auth/login-form.tsx`**
   - Updated "Forgot?" link to point to `/auth/forgot-password` instead of `/auth/reset-password`

### Pages
6. **`app/auth/forgot-password/page.tsx`**
   - Completely rewritten to use the new `ForgotPasswordForm`
   - Removed old admin-managed password reset message

7. **`app/auth/reset-password/page.tsx`**
   - Added Suspense wrapper for proper search params handling
   - Updated metadata

## Key Features

### User Experience
- **Progressive Flow:** Clear 3-step process (request → verify → reset)
- **Auto-focus:** PIN input auto-advances for faster entry
- **Paste Support:** Users can paste entire 6-digit PIN
- **Resend PIN:** Users can request a new PIN if needed
- **Email Change:** Option to use a different email address
- **Consistent UI:** All forms use the same Card component style

### Security
- **Token-based:** Each step requires valid tokens
- **Time-limited:** PINs and tokens expire (backend controlled)
- **Email verification:** PIN must be sent to registered email
- **Strong passwords:** Enforced password requirements

### Error Handling
- Field-level validation with Zod schemas
- API error messages displayed as toasts
- Clear feedback for expired/invalid tokens
- Network error handling

## API Endpoints Used

```typescript
// Step 1: Request password reset (Forgot Password)
POST /api/v1/auth/forgot-password
Request: { email: string }
Response: { message: string }

// Step 2: Verify PIN
POST /api/v1/auth/verify-password-reset-pin
Request: { email: string, pin: string }
Response: { resetToken: string, message: string }

// Step 3: Reset password
POST /api/v1/auth/reset-password
Request: { token: string, newPassword: string }
Response: { message: string }
```

## Testing Checklist

- [ ] Request password reset with valid email
- [ ] Request password reset with invalid email
- [ ] Enter valid 6-digit PIN
- [ ] Enter invalid PIN
- [ ] Paste 6-digit PIN
- [ ] Resend PIN functionality
- [ ] Change email during PIN verification
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Password validation (min length, letters, numbers)
- [ ] Password confirmation matching
- [ ] All navigation flows work correctly
- [ ] Error messages display properly
- [ ] Success toasts show up
- [ ] Mobile responsive design

## Notes

- The old admin-managed password reset flow (`POST /api/v1/admin/users/{userId}/password-reset`) is still available but this new self-service flow is now the primary method
- All forms use consistent shadcn/ui components for a cohesive design
- Suspense boundaries added to pages using `useSearchParams` for Next.js 15+ compatibility
