# Login Setup Documentation

## Environment Configuration

The app now uses environment variables to manage the API base URL:
- **Base URL**: `https://nz-b2b-api-admin.laravel.cloud/api`
- Configuration is stored in `.env` and `app.json`

## Login Page

**Route**: `/auth/login`

### Features:
- Blue themed login screen with mynztrip-white.png logo
- Email and password input fields
- Secure token storage using expo-secure-store
- Error handling and loading states
- **Authentication Guard**: Users MUST login to access the app

### Authentication Protection:
The app now requires authentication to access any screen:
- Unauthenticated users are automatically redirected to `/auth/login`
- After successful login, users are redirected to the main app
- The auth state is checked on app start and persists across sessions

### Test Credentials:
```
Email: it@mynztrip.com
Password: m#P5
```

### API Endpoint:
- **POST** `/auth/login`
- **Payload**: 
  ```json
  {
    "email": "it@mynztrip.com",
    "password": "m#P5"
  }
  ```

### Response Structure:
```json
{
  "message": "Logged in successfully!",
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "country_code": "MY",
    "market_list_id": 2,
    "name": "IT DEPARTMENT",
    "avatar": null,
    "panel": "admin",
    "user_type": "staff",
    "email": "it@mynztrip.com",
    "contact": "0123456789",
    "otp_status": 0,
    "is_vendor_allowed": 0,
    "sub_partner": null
  },
  "panel": "admin"
}
```

## Files Created:

1. **`.env`** - Environment variables
2. **`types/auth.ts`** - TypeScript types for authentication
3. **`services/api.ts`** - Axios API client configuration
4. **`services/auth.ts`** - Authentication service with login/logout methods
5. **`app/auth/login.tsx`** - Login screen component
6. **`hooks/use-auth.ts`** - Custom hook for authentication state
7. **`app/_layout.tsx`** - Updated with authentication guard

## How It Works:

1. **On App Start**: The root layout checks if a token exists in secure storage
2. **Not Authenticated**: User is automatically redirected to `/auth/login`
3. **Login Success**: Token is stored securely, user redirected to main app
4. **Authenticated**: User can access all app screens
5. **Logout**: Token is removed, user redirected back to login

## Testing the Flow:

1. Start the app - you'll be redirected to login
2. Enter credentials and login
3. You'll see the home screen with a "Logout" button
4. Click logout to return to login screen

## Usage:

To navigate to the login page programmatically:
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/auth/login');
```

After successful login, the access token is stored securely and the user is automatically redirected to the main app. The app checks authentication status on startup and redirects to login if needed.
