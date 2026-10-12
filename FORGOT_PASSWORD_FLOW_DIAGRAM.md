# Forgot Password Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FORGOT PASSWORD FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Login Page     │
│  /auth/login    │
│                 │
│  Click "Forgot?"│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Request Password Reset                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Page: /auth/forgot-password                                        │
│  Component: ForgotPasswordForm                                      │
│                                                                     │
│  ┌──────────────────────────────────────┐                         │
│  │  Enter Email Address                 │                         │
│  │  ┌────────────────────────────────┐  │                         │
│  │  │ email@example.com              │  │                         │
│  │  └────────────────────────────────┘  │                         │
│  │                                      │                         │
│  │  [Send Reset PIN]                    │                         │
│  └──────────────────────────────────────┘                         │
│                                                                     │
│  API: POST /api/v1/auth/request-password-reset                     │
│  Request: { email: "email@example.com" }                           │
│  Response: { message: "PIN sent to email" }                        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: Verify PIN                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Page: /auth/verify-reset-pin?email=email@example.com              │
│  Component: VerifyResetPinForm                                      │
│                                                                     │
│  ┌──────────────────────────────────────┐                         │
│  │  Enter 6-Digit PIN                   │                         │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│                         │
│  │  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││                         │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│                         │
│  │                                      │                         │
│  │  [Verify PIN]                        │                         │
│  │  [Resend PIN] [Use different email]  │                         │
│  └──────────────────────────────────────┘                         │
│                                                                     │
│  API: POST /api/v1/auth/verify-password-reset-pin                  │
│  Request: { email: "email@example.com", pin: "123456" }           │
│  Response: { tokenValue: "abc123...", message: "PIN verified" }   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Reset Password                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Page: /auth/reset-password?token=abc123...                        │
│  Component: ResetPasswordForm                                       │
│                                                                     │
│  ┌──────────────────────────────────────┐                         │
│  │  New Password                        │                         │
│  │  ┌────────────────────────────────┐  │                         │
│  │  │ ••••••••                       │  │                         │
│  │  └────────────────────────────────┘  │                         │
│  │                                      │                         │
│  │  Confirm Password                    │                         │
│  │  ┌────────────────────────────────┐  │                         │
│  │  │ ••••••••                       │  │                         │
│  │  └────────────────────────────────┘  │                         │
│  │                                      │                         │
│  │  [Reset Password]                    │                         │
│  └──────────────────────────────────────┘                         │
│                                                                     │
│  API: POST /api/v1/auth/reset-password                             │
│  Request: { tokenValue: "abc123...", newPassword: "newpass123" }  │
│  Response: { message: "Password reset successful" }               │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Login Page     │
                        │  /auth/login    │
                        │                 │
                        │  Success! ✓     │
                        └─────────────────┘
```

## Component Architecture

```
app/auth/
├── forgot-password/
│   └── page.tsx                    → Renders ForgotPasswordForm
│
├── verify-reset-pin/
│   └── page.tsx                    → Renders VerifyResetPinForm
│
└── reset-password/
    └── page.tsx                    → Renders ResetPasswordForm

components/auth/
├── forgot-password-form.tsx        → Email input + request reset
├── verify-reset-pin-form.tsx       → 6-digit PIN input + verify
└── reset-password-form.tsx         → New password input + confirm

lib/api/
├── auth.ts                         → API functions
│   ├── requestPasswordReset()
│   ├── verifyPasswordResetPin()
│   └── resetPasswordWithToken()
│
└── types.ts                        → TypeScript types
    ├── RequestPasswordResetRequest
    ├── RequestPasswordResetResponse
    ├── VerifyPasswordResetPinRequest
    ├── VerifyPasswordResetPinResponse
    └── ResetPasswordWithTokenRequest

lib/utils/
└── validators.ts                   → Zod schemas
    ├── emailSchema
    ├── verifyPinSchema
    └── resetPasswordWithTokenSchema
```

## State Management

```
Email State Flow:
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ User enters  │ ───► │ Passed via   │ ───► │ Used for     │
│ email        │      │ URL params   │      │ PIN verify   │
└──────────────┘      └──────────────┘      └──────────────┘

Token State Flow:
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ PIN verified │ ───► │ Passed via   │ ───► │ Used for     │
│ returns token│      │ URL params   │      │ pwd reset    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Error Handling

```
Each Step Has Error Scenarios:

Step 1 - Request Reset:
├── Email not found → Show error toast
├── Network error → Show error toast
└── Success → Navigate to Step 2

Step 2 - Verify PIN:
├── Invalid PIN → Show error message
├── Expired PIN → Show error + resend option
├── Network error → Show error toast
└── Success → Navigate to Step 3

Step 3 - Reset Password:
├── Invalid token → Show invalid link message
├── Expired token → Show invalid link message
├── Weak password → Show validation errors
├── Passwords don't match → Show validation error
├── Network error → Show error toast
└── Success → Navigate to login
```

## UX Features

### PIN Input Component
- **Auto-focus:** Automatically focuses next input after entering a digit
- **Paste Support:** Can paste entire 6-digit PIN code
- **Keyboard Navigation:** Backspace moves to previous input
- **Mobile Friendly:** Uses `inputMode="numeric"` for number keyboard
- **Visual Feedback:** Clear focus states and error messages

### Progressive Enhancement
- Form validation before API calls
- Loading states on all buttons
- Success/error toast notifications
- Clear navigation between steps
- "Back to Login" links on every page

### Accessibility
- Proper labels for all inputs
- Error messages linked to inputs
- Keyboard navigation support
- Focus management
- ARIA attributes (via shadcn/ui)
