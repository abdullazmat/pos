# Email Configuration Guide

## Overview

The POS SaaS application uses Gmail SMTP to send password recovery emails to users.

## Current Configuration

**Email Provider:** Gmail SMTP  
**Sending Email:** shinsukenakamurahard@gmail.com  
**SMTP Server:** smtp.gmail.com  
**Port:** 587 (TLS)

## Environment Variables

The following variables are configured in `.env.local`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=shinsukenakamurahard@gmail.com
EMAIL_PASSWORD=cxfk asjl nkql xjab
```

## Features

### Password Reset Email Template

- Professional HTML design with responsive layout
- Blue gradient header with POS SaaS branding
- Clear call-to-action button
- Security warning (1-hour expiration)
- Fallback plain text link
- Personalized with user's name
- Available in Spanish, English, and Portuguese

### Email Content

**Subject:** Recuperación de Contraseña - POS SaaS  
**From:** POS SaaS <shinsukenakamurahard@gmail.com>  
**To:** User's registered email

## Testing

1. **Restart dev server** after adding environment variables
2. Navigate to login page and click "Forgot password?"
3. Enter user email
4. Check inbox for password reset email
5. Click button or use link to reset password

## Gmail App Password

The password `cxfk asjl nkql xjab` is a **Gmail App Password**, not the regular Gmail account password.

### What is an App Password?

- Special password for third-party apps
- More secure than using regular password
- Can be revoked without changing main password
- Required when 2FA is enabled

### How to Generate a New App Password (if needed):

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Enter "POS SaaS" as the name
7. Click "Generate"
8. Copy the 16-character password
9. Update `EMAIL_PASSWORD` in `.env.local`

## Switching Email Providers

### Using SendGrid (Alternative)

```bash
npm install @sendgrid/mail
```

Update `src/lib/utils/sendEmail.ts`:

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html }) {
  await sgMail.send({
    to,
    from: "noreply@yourdomain.com",
    subject,
    html,
  });
}
```

Add to `.env.local`:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Using AWS SES (Alternative)

```bash
npm install @aws-sdk/client-ses
```

Update environment variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SES_FROM_EMAIL=noreply@yourdomain.com
```

## Production Considerations

1. **Domain Email:** Use a custom domain email instead of Gmail
   - Example: `noreply@yourcompany.com`
   - More professional and trusted by email providers

2. **Email Service:** Consider dedicated email services for production:
   - SendGrid (99% deliverability)
   - AWS SES (cost-effective for high volume)
   - Postmark (excellent for transactional emails)
   - Mailgun (good API and analytics)

3. **Rate Limiting:** Implement rate limiting to prevent abuse
   - Limit password reset requests per email/IP
   - Track failed attempts

4. **Monitoring:** Set up email delivery monitoring
   - Track bounces and failures
   - Monitor spam complaints
   - Log all email attempts

5. **DKIM/SPF/DMARC:** Configure email authentication
   - Prevents emails from going to spam
   - Verifies sender authenticity
   - Required for good deliverability

## Troubleshooting

### Email Not Sending

- Check environment variables are loaded (restart server)
- Verify Gmail App Password is correct
- Check server console for error messages
- Ensure port 587 is not blocked by firewall

### Emails Going to Spam

- Configure SPF/DKIM records
- Use a verified domain email
- Avoid spam trigger words in subject/content
- Ensure proper email formatting

### Gmail Blocking Access

- Verify App Password is being used
- Check if 2-Step Verification is enabled
- Review Google Account security settings
- Try generating a new App Password

## Security Notes

⚠️ **Never commit `.env.local` to version control**

The `.env.local` file contains sensitive credentials and should be:

- Added to `.gitignore` (already done)
- Stored securely in production environment
- Rotated periodically for security

For production deployment, use:

- Environment variables in hosting platform
- Secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
- Encrypted configuration files

## Files

- **Email Utility:** `src/lib/utils/sendEmail.ts`
- **API Route:** `src/app/api/auth/forgot-password/route.ts`
- **Reset Route:** `src/app/api/auth/reset-password/route.ts`
- **Frontend Pages:**
  - `src/app/auth/forgot-password/page.tsx`
  - `src/app/auth/reset-password/page.tsx`

## Support

For issues with email delivery:

1. Check server logs for detailed error messages
2. Verify email configuration in `.env.local`
3. Test with a different email address
4. Review Gmail account security settings
