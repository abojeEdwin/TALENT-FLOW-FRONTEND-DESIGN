# Password Reset UI Preview

## Visual Mockup of the Flow

### Step 1: Forgot Password Page (`/auth/forgot-password`)

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ┌────────────────────────────────────────────────────┐  ║
║   │                                                    │  ║
║   │  Forgot Password                                   │  ║
║   │  Enter your email address and we'll send you a    │  ║
║   │  PIN to reset your password                       │  ║
║   │                                                    │  ║
║   │  ─────────────────────────────────────────────    │  ║
║   │                                                    │  ║
║   │  Email Address                                     │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │ name@example.com                             │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │         Send Reset PIN                       │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │              Back to Login                         │  ║
║   │                                                    │  ║
║   └────────────────────────────────────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Step 2: Verify PIN Page (`/auth/verify-reset-pin`)

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ┌────────────────────────────────────────────────────┐  ║
║   │                                                    │  ║
║   │  Verify PIN                                        │  ║
║   │  Enter the 6-digit PIN sent to                    │  ║
║   │  user@example.com                                 │  ║
║   │                                                    │  ║
║   │  ─────────────────────────────────────────────    │  ║
║   │                                                    │  ║
║   │  Enter PIN                                         │  ║
║   │                                                    │  ║
║   │     ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐    │  ║
║   │     │ 1 │  │ 2 │  │ 3 │  │ 4 │  │ 5 │  │ 6 │    │  ║
║   │     └───┘  └───┘  └───┘  └───┘  └───┘  └───┘    │  ║
║   │                                                    │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │         Verify PIN                           │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │              Resend PIN                            │  ║
║   │          Use a different email                     │  ║
║   │                                                    │  ║
║   └────────────────────────────────────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Step 3: Reset Password Page (`/auth/reset-password`)

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ┌────────────────────────────────────────────────────┐  ║
║   │                                                    │  ║
║   │  Reset Password                                    │  ║
║   │  Enter your new password below                    │  ║
║   │                                                    │  ║
║   │  ─────────────────────────────────────────────    │  ║
║   │                                                    │  ║
║   │  New Password                                      │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │ ••••••••                                     │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │  Must be at least 8 characters with letters      │  ║
║   │  and numbers                                      │  ║
║   │                                                    │  ║
║   │  Confirm Password                                  │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │ ••••••••                                     │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │         Reset Password                       │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │              Back to Login                         │  ║
║   │                                                    │  ║
║   └────────────────────────────────────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Login Page - Updated Link

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ┌────────────────────────────────────────────────────┐  ║
║   │  [Logo]                                            │  ║
║   │                                                    │  ║
║   │  Sign in                                           │  ║
║   │  Enter your details to access your account        │  ║
║   │                                                    │  ║
║   │  ─────────────────────────────────────────────    │  ║
║   │                                                    │  ║
║   │  Email                                             │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │ you@example.com                              │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │  Password                            Forgot? ◄───  │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │ ••••••••                                     │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │  ┌──────────────────────────────────────────────┐ │  ║
║   │  │         Sign in                              │ │  ║
║   │  └──────────────────────────────────────────────┘ │  ║
║   │                                                    │  ║
║   │  Don't have an account?                           │  ║
║   │  Register your organisation                       │  ║
║   │                                                    │  ║
║   └────────────────────────────────────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
            ↑
    UPDATED: Now links to /auth/forgot-password
```

## Component Hierarchy

```
ForgotPasswordForm
├── Card
│   ├── CardHeader
│   │   ├── CardTitle: "Forgot Password"
│   │   └── CardDescription: "Enter your email..."
│   └── CardContent
│       └── form
│           ├── div (Email field)
│           │   ├── Label: "Email Address"
│           │   ├── Input (type="email")
│           │   └── error message (conditional)
│           ├── Button: "Send Reset PIN"
│           └── Link: "Back to Login"

VerifyResetPinForm
├── Card
│   ├── CardHeader
│   │   ├── CardTitle: "Verify PIN"
│   │   └── CardDescription: "Enter the 6-digit..."
│   └── CardContent
│       └── form
│           ├── div (PIN field)
│           │   ├── Label: "Enter PIN"
│           │   ├── div (6 inputs)
│           │   │   ├── input [0]
│           │   │   ├── input [1]
│           │   │   ├── input [2]
│           │   │   ├── input [3]
│           │   │   ├── input [4]
│           │   │   └── input [5]
│           │   └── error message (conditional)
│           ├── Button: "Verify PIN"
│           └── div (links)
│               ├── button: "Resend PIN"
│               └── Link: "Use a different email"

ResetPasswordForm
├── Card
│   ├── CardHeader
│   │   ├── CardTitle: "Reset Password"
│   │   └── CardDescription: "Enter your new..."
│   └── CardContent
│       └── form
│           ├── div (Password field)
│           │   ├── Label: "New Password"
│           │   ├── Input (type="password")
│           │   ├── error message (conditional)
│           │   └── hint text
│           ├── div (Confirm field)
│           │   ├── Label: "Confirm Password"
│           │   ├── Input (type="password")
│           │   └── error message (conditional)
│           ├── Button: "Reset Password"
│           └── Link: "Back to Login"
```

## Interactive States

### Loading States
```
Button States:
┌────────────────────┐
│  Send Reset PIN    │  ← Normal
└────────────────────┘

┌────────────────────┐
│  Sending...        │  ← Loading (disabled)
└────────────────────┘
```

### Error States
```
Input with Error:
┌──────────────────────────────┐
│ invalid@email                │  ← Red border
└──────────────────────────────┘
⚠️ Invalid email address         ← Red text
```

### Success States
```
Toast Notification:
┌─────────────────────────────────────┐
│ ✓ Password reset PIN sent to your  │
│   email                             │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>768px)
- Card centered on page
- Max width: 400px
- Ample padding
- Large, easy-to-click buttons

### Mobile (<768px)
- Card fills width with margin
- Stacked layout
- PIN inputs sized for touch
- Numeric keyboard for PIN input
- Full-width buttons

## Color Scheme (Using Theme)

```
Background: bg-background
Card: bg-card with border
Text: text-foreground
Muted Text: text-muted-foreground
Primary Button: bg-primary text-primary-foreground
Error Text: text-destructive
Input Border: border-input
Focus Ring: ring-ring
```

## Accessibility Features

✅ **Keyboard Navigation:**
- Tab through all inputs
- Enter to submit forms
- Backspace navigation in PIN inputs

✅ **Screen Readers:**
- Proper label associations
- Error messages announced
- Button states communicated

✅ **Visual:**
- High contrast text
- Clear focus indicators
- Error states visible
- Sufficient touch targets

✅ **Semantic HTML:**
- Proper form structure
- Label/input associations
- Button vs link usage
- Heading hierarchy

## Animation & Transitions

```css
/* Smooth transitions on inputs */
input:focus → ring-2 ring-primary (0.2s)

/* Button hover states */
button:hover → slight scale/color change

/* Error message appearance */
error message → fade in from top

/* Toast notifications */
toast → slide in from top-right
```

## Dark Mode Support

All components use shadcn/ui theme variables:
- Automatically adapts to light/dark mode
- No hardcoded colors
- Consistent across all forms
- Theme toggle preserved

## Email Template Preview

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  [TalentFlow Logo]                                         ║
║                                                            ║
║  Password Reset Request                                    ║
║                                                            ║
║  Hello,                                                    ║
║                                                            ║
║  You requested to reset your password. Please use the     ║
║  following PIN to verify your identity:                   ║
║                                                            ║
║        ┌─────────────────────┐                            ║
║        │      123456         │                            ║
║        └─────────────────────┘                            ║
║                                                            ║
║  This PIN will expire in 15 minutes.                      ║
║                                                            ║
║  If you didn't request this, you can safely ignore this   ║
║  email.                                                    ║
║                                                            ║
║  Best regards,                                             ║
║  The TalentFlow Team                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## User Flow Timing

```
Step 1: Request Reset
├── User enters email: ~5 seconds
├── API request: ~1 second
└── Navigate to Step 2: instant

Step 2: Verify PIN
├── Check email: ~30 seconds
├── Enter/paste PIN: ~5 seconds
├── API request: ~1 second
└── Navigate to Step 3: instant

Step 3: Reset Password
├── Enter new password: ~10 seconds
├── API request: ~1 second
└── Navigate to Login: instant

Total Time: ~1-2 minutes
```

## Mobile-Specific Enhancements

📱 **PIN Input on Mobile:**
- Uses `inputMode="numeric"` for number keyboard
- Larger tap targets (48x48px minimum)
- Auto-zoom prevented with proper font size
- Paste detection works with mobile keyboards

📱 **Form Optimization:**
- Auto-capitalization off for email
- Auto-correct off for email/password
- Proper input types for keyboards
- Submit on keyboard "Go" button
