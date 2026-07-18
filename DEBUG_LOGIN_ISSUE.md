# Debug Login "Invalid Credentials" Issue

## Changes Made for Debugging

I've added extensive logging to help identify why the backend is receiving invalid credentials:

### 1. **Login Form** (`components/auth/login-form.tsx`)
Added logging to see what data the form is submitting:
```typescript
console.log('[DEBUG] Form submitted with data:', {
  email: data.email,
  passwordLength: data.password?.length,
  emailTrimmed: data.email?.trim(),
  passwordTrimmed: data.password?.trim(),
});
```

### 2. **Auth API** (`lib/api/auth.ts`)
Added logging to see what's being passed to the API function:
```typescript
console.log('[DEBUG] loginUser called with:', {
  email,
  passwordLength: password?.length,
  request
});
```

### 3. **API Client** (`lib/api/client.ts`)
Added logging to see the actual HTTP request being sent:
```typescript
console.log('[DEBUG] Login Request:', {
  url,
  body: fetchOptions.body,
  headers,
  skipAuth
});
```

### 4. **Email Trimming** (`lib/utils/validators.ts`)
Added `.trim()` to the email field to remove any accidental whitespace:
```typescript
email: z.string().trim().email("Invalid email address"),
```

## How to Debug

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Clear the console

### Step 2: Try to Login
1. Enter your email and password
2. Click "Sign in"
3. Look at the console output

### Step 3: Check the Logs

You should see three log messages:

```
[DEBUG] Form submitted with data: {
  email: "user@example.com",
  passwordLength: 12,
  emailTrimmed: "user@example.com",
  passwordTrimmed: "password123"
}

[DEBUG] loginUser called with: {
  email: "user@example.com",
  passwordLength: 12,
  request: { email: "user@example.com", password: "password123" }
}

[DEBUG] Login Request: {
  url: "http://localhost:8080/api/v1/auth/login",
  body: '{"email":"user@example.com","password":"password123"}',
  headers: { "Content-Type": "application/json" },
  skipAuth: true
}
```

### Step 4: Check Network Tab
1. Go to the Network tab in Developer Tools
2. Find the request to `/auth/login`
3. Click on it
4. Check the **Request** section:
   - **Request URL**: Should be `http://localhost:8080/api/v1/auth/login`
   - **Request Method**: Should be `POST`
   - **Request Headers**: Should include `Content-Type: application/json`
   - **Request Payload**: Should show `{"email":"...","password":"..."}`

5. Check the **Response** section:
   - **Status Code**: What is it? (401, 400, 500?)
   - **Response Body**: What error message does the backend return?

## Common Issues to Check

### Issue 1: Whitespace in Email/Password
**Symptom**: Email or password has leading/trailing spaces
**Solution**: ✅ Already fixed with `.trim()` in validator

**Check**: Look at the console logs - do `email` and `emailTrimmed` differ?

### Issue 2: Wrong API Endpoint
**Symptom**: Backend expects different endpoint
**Check**: 
- Frontend sends to: `http://localhost:8080/api/v1/auth/login`
- Backend expects: `???`

**Solution**: Update `API_BASE_URL` or `API_VERSION` in `.env.local`

### Issue 3: Wrong Request Body Format
**Symptom**: Backend expects different field names

**Frontend sends**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend might expect**:
```json
{
  "username": "user@example.com",  // ← Note: "username" not "email"
  "password": "password123"
}
```

**Solution**: Update `LoginRequest` interface in `lib/api/types.ts`:
```typescript
export interface LoginRequest {
  username: string;  // Changed from "email"
  password: string;
}
```

And update `lib/api/auth.ts`:
```typescript
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const request = { username: email, password };  // Use "username" key
  // ...
}
```

### Issue 4: Password Encoding Issue
**Symptom**: Special characters in password are being encoded incorrectly

**Check**: Does your password contain special characters like `&`, `+`, `=`, `%`, etc?

**Solution**: The password is already being sent in JSON body (not URL encoded), so this should be fine. But check the console logs to verify.

### Issue 5: Backend Expects Different Content-Type
**Symptom**: Backend expects `application/x-www-form-urlencoded` instead of `application/json`

**Check**: Look at backend controller - does it have `@RequestBody` or `@RequestParam`?

**Solution**: If backend expects form data, update `lib/api/auth.ts`:
```typescript
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);
  
  return fetchAPI<LoginResponse>("/auth/login", {
    method: "POST",
    body: formData,
    skipAuth: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
```

### Issue 6: CORS or Credentials Issue
**Symptom**: Request is being blocked or cookies aren't being sent

**Check**: Look for CORS errors in console

**Solution**: Already using `credentials: "include"` in fetch options

### Issue 7: Backend Validation Error
**Symptom**: Backend has stricter validation than frontend

**Check**: What does the backend error response say?

**Example**: Backend might require:
- Email must be lowercase
- Password must have uppercase, lowercase, number, and special character
- Email must be from a specific domain

## What to Share

After checking the above, please share:

1. **Console logs** - All three `[DEBUG]` messages
2. **Network tab screenshot** - The request and response
3. **Backend error response** - The exact error message from backend
4. **Backend controller code** - The login endpoint code
5. **Test credentials** - Are you using valid credentials that exist in the database?

## Quick Test

Try these test credentials (if they exist in your database):
- Email: `admin@example.com`
- Password: `password123`

If these don't work, create a test user directly in the database and try again.

## Backend Checklist

Ask your backend team to verify:

- [ ] The login endpoint is at `/api/v1/auth/login`
- [ ] It accepts POST requests
- [ ] It expects JSON body with `email` and `password` fields
- [ ] It returns 401 for invalid credentials (not 400 or 500)
- [ ] The password is being hashed correctly for comparison
- [ ] The user exists in the database
- [ ] The user's status is ACTIVE (not LOCKED or DISABLED)
- [ ] CORS is configured to allow requests from `http://localhost:3000`

## Next Steps

1. Try to login and check the console logs
2. Share the logs with me
3. I'll help identify the exact issue based on the logs
