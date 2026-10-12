# Quick Start: Testing Password Reset Flow

## For Developers

### Prerequisites
1. Backend running on the configured API URL
2. Backend has the following endpoints available:
   - `POST /api/v1/auth/request-password-reset`
   - `POST /api/v1/auth/verify-password-reset-pin`
   - `POST /api/v1/auth/reset-password`
3. Email service configured on backend (SMTP)

### Testing the Complete Flow

#### 1. Start the Flow
```
Navigate to: http://localhost:3000/auth/login
Click: "Forgot?" link
OR
Navigate directly to: http://localhost:3000/auth/forgot-password
```

#### 2. Request Password Reset
```
Enter a registered email address
Click "Send Reset PIN"
Expected: 
- Toast notification "Password reset PIN sent to your email"
- Redirect to /auth/verify-reset-pin?email={email}
- Email received with 6-digit PIN
```

#### 3. Verify PIN
```
Enter the 6-digit PIN from email
OR paste the entire PIN (it will auto-fill)
Click "Verify PIN"
Expected:
- Toast notification "PIN verified successfully"
- Redirect to /auth/reset-password?token={tokenValue}
```

#### 4. Reset Password
```
Enter new password (min 8 chars, letters + numbers)
Confirm password
Click "Reset Password"
Expected:
- Toast notification "Password reset successful!"
- Redirect to /auth/login
- Can now login with new password
```

### Testing Edge Cases

#### Invalid Email
```
Step 1: Enter non-existent email
Expected: Error toast "Email not found" or similar
```

#### Invalid PIN
```
Step 2: Enter wrong PIN (e.g., 000000)
Expected: Error message "Invalid or expired PIN"
```

#### Expired PIN
```
Step 2: Wait for PIN to expire (check backend timeout)
Expected: Error message "Invalid or expired PIN"
Action: Click "Resend PIN" to get a new one
```

#### Resend PIN
```
Step 2: Click "Resend PIN"
Expected: 
- Toast "New PIN sent to your email"
- PIN inputs cleared
- New email with new PIN
```

#### Password Mismatch
```
Step 3: Enter different passwords in confirm field
Expected: Validation error "Passwords do not match"
```

#### Weak Password
```
Step 3: Enter password like "pass"
Expected: Validation error "Password must be at least 8 characters"
```

#### No Token
```
Navigate directly to: /auth/reset-password (no token param)
Expected: "Invalid Link" message with button to start over
```

### API Testing with cURL

#### Request Password Reset
```bash
curl -X POST http://localhost:8080/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### Verify PIN
```bash
curl -X POST http://localhost:8080/api/v1/auth/verify-password-reset-pin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","pin":"123456"}'
```

#### Reset Password
```bash
curl -X POST http://localhost:8080/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"tokenValue":"TOKEN_FROM_VERIFY","newPassword":"NewPass123"}'
```

## For QA Testing

### Test Scenarios Checklist

- [ ] **Happy Path**: Complete flow from start to finish
- [ ] **Invalid Email**: Non-existent email at step 1
- [ ] **Wrong PIN**: Incorrect PIN at step 2
- [ ] **Expired PIN**: Wait for expiry and try to verify
- [ ] **Resend PIN**: Request new PIN and verify with new one
- [ ] **Paste PIN**: Copy/paste PIN instead of typing
- [ ] **Password Validation**: Try weak passwords
- [ ] **Password Mismatch**: Different passwords in confirm field
- [ ] **Direct URL Access**: Access reset page without token
- [ ] **Navigation**: Use "Back to Login" links
- [ ] **Mobile**: Test on mobile devices (numeric keyboard)
- [ ] **Browser Back Button**: Navigate back through steps
- [ ] **Network Error**: Test with network offline
- [ ] **Multiple Attempts**: Request reset multiple times

### Expected User Experience

✅ **Good:**
- Clear instructions at each step
- Immediate feedback (toasts, error messages)
- Auto-focus and paste support for PIN
- Can resend PIN if needed
- Can change email during verification
- Password requirements clearly stated
- Success confirmation after reset

❌ **Issues to Report:**
- Any step that doesn't redirect properly
- Error messages not showing
- PIN inputs not working correctly
- Passwords not validating
- Toast notifications not appearing
- Layout issues on mobile

## Troubleshooting

### Issue: Email not received
**Check:**
- Backend SMTP configuration
- Spam/junk folder
- Backend logs for email sending errors
- Email service status

### Issue: PIN verification fails
**Check:**
- PIN hasn't expired (check backend timeout)
- Email matches the one used in step 1
- PIN copied correctly (no spaces)
- Backend logs for verification errors

### Issue: Token invalid
**Check:**
- Token hasn't expired (check backend timeout)
- Token in URL matches the one from step 2
- Backend logs for token validation errors

### Issue: Password reset fails
**Check:**
- Password meets requirements (8+ chars, letters + numbers)
- Passwords match
- Token is still valid
- Backend logs for reset errors

## Configuration

### Backend Environment Variables Required
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@talentflow.com

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION_MINUTES=60

# Password Reset Configuration
PASSWORD_RESET_PIN_EXPIRY_MINUTES=15
PASSWORD_RESET_TOKEN_EXPIRY_MINUTES=30
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Check backend logs
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed
