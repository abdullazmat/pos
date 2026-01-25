# Password Recovery System

## Overview

The password recovery system allows users to reset their password if they forget it. The flow includes:

1. **Forgot Password Page** - User enters their email
2. **Email with Reset Link** - System sends email with secure token (currently logs to console in development)
3. **Reset Password Page** - User clicks link and enters new password
4. **Confirmation** - Password is updated and user can log in

## Files Created/Modified

### Frontend Pages

- **`src/app/auth/forgot-password/page.tsx`** - Form to request password reset
- **`src/app/auth/reset-password/page.tsx`** - Form to set new password
- **`src/app/auth/login/page.tsx`** - Added "Forgot password?" link

### API Endpoints

- **`src/app/api/auth/forgot-password/route.ts`** - Generates reset token and sends email
- **`src/app/api/auth/reset-password/route.ts`** - Validates token and updates password

### Database Model

- **`src/lib/models/User.ts`** - Added fields:
  - `resetPasswordToken` - Hashed token for security
  - `resetPasswordExpires` - Token expiration (1 hour)

### Translations

- **`src/lib/context/LanguageContext.tsx`** - Added translations for:
  - Spanish (es): Forgot password and reset password UI
  - English (en): Forgot password and reset password UI
  - Portuguese (pt): Forgot password and reset password UI

## Security Features

1. **Token Hashing** - Reset tokens are hashed using SHA-256 before storage
2. **Token Expiration** - Tokens expire after 1 hour
3. **No Email Disclosure** - System doesn't reveal if email exists (returns success either way)
4. **Random Token Generation** - Uses crypto.randomBytes for secure tokens

## Usage Flow

### User Forgot Password

1. User clicks "¿Olvidaste tu contraseña?" on login page
2. User enters email and clicks "Enviar Enlace de Recuperación"
3. System generates secure token and saves to database
4. In production: Email is sent with reset link
5. In development: Reset URL is logged to console

### User Resets Password

1. User clicks link from email (format: `/auth/reset-password?token=...`)
2. User enters new password twice
3. System validates token hasn't expired
4. Password is hashed and saved
5. User is redirected to login page

## Development Mode

**✅ Email sending is now ACTIVE!**

The system uses Gmail SMTP to send password reset emails to users. The reset email includes:

- Professional HTML template with POS SaaS branding
- Reset button and direct link
- Security warning about 1-hour expiration
- Fallback plain URL if button doesn't work

**Email Configuration:**

- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- From: POS SaaS <shinsukenakamurahard@gmail.com>

The reset URL is also logged to console and returned in the API response (development only) for convenience.

**Example console output:**

```
Password reset email sent successfully to: user@example.com
Password reset URL: http://localhost:3000/auth/reset-password?token=abc123...
```

## Production Setup

**✅ Email functionality is FULLY CONFIGURED and ready to use!**

The system uses the following environment variables from `.env.local`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=shinsukenakamurahard@gmail.com
EMAIL_PASSWORD=cxfk asjl nkql xjab
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Email Template Features:**

- Responsive HTML design
- Professional branding with blue gradient header
- Clear call-to-action button
- Warning message about 1-hour expiration
- Fallback link if button doesn't work
- Footer with automated email notice

**Files Created:**

- `src/lib/utils/sendEmail.ts` - Email utility with nodemailer
- Updated `src/app/api/auth/forgot-password/route.ts` - Now sends actual emails

**Dependencies Installed:**

- nodemailer (email sending)
- @types/nodemailer (TypeScript types)

## Translation Keys

All text is internationalized in 3 languages:

**Spanish:**

- forgotPassword.title: "Recuperar Contraseña"
- resetPassword.title: "Restablecer Contraseña"

**English:**

- forgotPassword.title: "Recover Password"
- resetPassword.title: "Reset Password"

**Portuguese:**

- forgotPassword.title: "Recuperar Senha"
- resetPassword.title: "Redefinir Senha"

## Testing

### How to Test Password Recovery:

1. **Restart your development server** (if running) to load new environment variables:

   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

2. Go to `/auth/login`
3. Click "¿Olvidaste tu contraseña?" (or "Forgot your password?" / "Esqueceu sua senha?")
4. Enter the email of an existing user in your database
5. Click "Enviar Enlace de Recuperación" (Send Recovery Link)
6. **Check your email inbox** for the password reset email
   - Subject: "Recuperación de Contraseña - POS SaaS"
   - Sender: POS SaaS <shinsukenakamurahard@gmail.com>
7. Click the reset button in the email (or copy the URL)
8. Enter your new password twice
9. Click "Restablecer Contraseña" (Reset Password)
10. Log in with your new password

### Troubleshooting:

**Email not received?**

- Check your spam/junk folder
- Verify the email exists in your database
- Check server console for error messages
- Ensure dev server was restarted after adding env variables

**Gmail App Password:**
The password used (`cxfk asjl nkql xjab`) is a Gmail App Password, not the regular account password. This is required for security when using Gmail SMTP.

**Testing with Console Logs:**
In development mode, the reset URL is also logged to the console for quick testing without checking email.

### Email Preview:

The email sent to users looks like this:

- **Header**: Blue gradient with lock icon and "Recuperación de Contraseña"
- **Body**: Personalized greeting with user's name
- **Button**: Large blue "Restablecer Contraseña" button
- **Warning**: Yellow alert box about 1-hour expiration
- **Footer**: Automated email notice and POS SaaS branding
