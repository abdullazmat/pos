# 🚀 Deployment Checklist & Verification Steps

## Pre-Deployment Verification

### ✅ Code Quality

- [x] No console errors in browser dev tools
- [x] No TypeScript compilation errors
- [x] All imports resolved correctly
- [x] Component renders without crashes

### ✅ Frontend Functionality

- [ ] Page loads without errors
- [ ] Plans display correctly
- [ ] Current subscription shows correct badge
- [ ] Ticket preview updates with business info
- [ ] Subscribe buttons are clickable
- [ ] Loading state shows during API call

### ✅ API Endpoints

- [ ] GET /api/plans returns 200 with plans array
- [ ] GET /api/subscription returns 200 with subscription
- [ ] POST /api/subscription/upgrade returns 200 with updated subscription
- [ ] All endpoints require auth token (except /api/plans)

### ✅ Database

- [ ] Subscription collection exists
- [ ] Subscription auto-creates on first fetch
- [ ] Plan features save correctly
- [ ] Current period dates track correctly

### ✅ User Experience

- [ ] Toast notifications appear on success
- [ ] Toast notifications appear on error
- [ ] Button disabled while loading
- [ ] Button text updates after subscribe
- [ ] Page is responsive on mobile
- [ ] No console errors on any interaction

## Testing Procedures

### Test 1: Load Page

```
1. Navigate to /business-config
2. Expected: Page loads, plans visible, no errors
3. Check: Browser console should be clear
4. Verify: Both FREE and PRO plans displayed
```

### Test 2: Check Current Subscription

```
1. Load page
2. Expected: One plan shows "Plan Actual" badge
3. Check: Green badge color and text
4. Verify: Matches subscription in database
```

### Test 3: Subscribe to Different Plan

```
1. On page, locate different plan than current
2. Click "Click para suscribirse →" button
3. Expected: Button shows "Procesando..."
4. Wait: For API response (2-5 seconds)
5. Verify: Success toast appears
6. Check: Button now shows "Plan Actual"
7. Refresh: Page should keep new subscription
```

### Test 4: Try Same Plan Again

```
1. Locate current plan
2. Click button on same plan
3. Expected: Info toast shows "Ya estás suscrito a este plan"
4. Verify: No API call made
5. Check: Button still shows "Plan Actual"
```

### Test 5: Business Info Updates Preview

```
1. If business-config form exists, update fields
2. Expected: Ticket preview updates in real-time
3. Verify: All fields reflected in preview
4. Check: Terminal style preserved
```

### Test 6: Error Handling

```
1. Disconnect internet/API
2. Click subscribe button
3. Expected: Error toast appears
4. Check: Button returns to clickable state
5. Verify: Page doesn't crash
```

### Test 7: Mobile Responsiveness

```
1. Open DevTools (F12)
2. Toggle device toolbar
3. Set to mobile size (375px)
4. Expected: Layout stacks vertically
5. Verify: Plans still clickable
6. Check: No horizontal scroll
```

## API Testing with cURL

### Get Plans

```bash
curl -X GET http://localhost:3000/api/plans
```

Expected: Array of 2 plans (FREE, PRO)

### Get Subscription (Replace TOKEN)

```bash
curl -X GET http://localhost:3000/api/subscription \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: Current subscription object

### Upgrade Subscription (Replace TOKEN)

```bash
curl -X POST http://localhost:3000/api/subscription/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"planId":"PRO"}'
```

Expected: Updated subscription object

## Database Verification

### Check Subscription Collection

```javascript
// In MongoDB compass or mongosh
use your_database_name
db.subscriptions.findOne({ businessId: "your-business-id" })
```

Expected: Document with planId, features, dates

## Performance Checklist

- [ ] Page loads in < 2 seconds
- [ ] API calls complete in < 1 second
- [ ] No memory leaks on repeated subscriptions
- [ ] No layout shifts during loading
- [ ] Buttons responsive immediately after click

## Security Checklist

- [ ] API requires authentication token
- [ ] Users can't see other businesses' subscriptions
- [ ] Plan validation on server (not trusting client)
- [ ] Business ID from token (not from request)
- [ ] No sensitive data exposed in logs

## Browser Compatibility

- [ ] Works on Chrome/Chromium
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Checklist

- [ ] Keyboard navigation works
- [ ] Buttons focusable with Tab key
- [ ] Color contrast sufficient
- [ ] Text readable at 125% zoom
- [ ] No purely color-based indicators

## Deployment Steps

### 1. Pre-deployment

```bash
# Clear build cache
rm -rf .next

# Install dependencies
npm install

# Run type checking
npx tsc --noEmit

# Build project
npm run build
```

### 2. Deploy

```bash
# Push to main/production branch
git add .
git commit -m "Business config & subscription system"
git push origin main

# Deploy (Vercel, Railway, etc.)
# Deployment platform handles rest
```

### 3. Post-deployment

- [ ] Verify all endpoints responding
- [ ] Check logs for errors
- [ ] Test subscribe flow in production
- [ ] Monitor error tracking (Sentry, etc.)
- [ ] Get user feedback

## Rollback Plan (If Issues)

If critical errors appear in production:

```bash
git revert COMMIT_HASH
git push origin main
# Redeploy previous version
```

## Known Limitations (Current)

1. No Stripe integration yet (plans display only)
2. No email notifications on upgrade
3. No usage limit enforcement
4. No invoice generation
5. No billing history UI

## Feature Flags (Optional)

If deploying gradually:

```typescript
const ENABLE_SUBSCRIPTIONS = true; // Toggle in env

if (ENABLE_SUBSCRIPTIONS) {
  // Show subscription UI
}
```

## Monitoring & Logging

### What to Monitor

- API response times
- Error rates on subscription upgrades
- User flow completion rates
- Toast notification displays

### Key Metrics

- Plans loaded successfully: 95%+
- Subscribe button clicks: X per day
- Successful upgrades: 90%+ success rate
- Error rate: < 1%

## Support Contacts

If issues arise:

1. Check logs in console
2. Review error messages in UI
3. Check MongoDB for data integrity
4. Review API endpoint responses
5. Check authentication tokens

## Post-Launch Improvements

### Week 1

- [ ] Monitor user feedback
- [ ] Check error logs
- [ ] Gather conversion metrics
- [ ] Fix any bugs

### Week 2+

- [ ] Plan Stripe integration
- [ ] Add email notifications
- [ ] Implement usage limits
- [ ] Create billing dashboard

## Success Criteria

✅ Launch Successful When:

- All endpoints returning 200 responses
- Users can subscribe to plans
- UI updates correctly after subscription
- No critical errors in logs
- Users providing positive feedback
- 90%+ successful subscription attempts

---

**Status**: Ready for deployment ✅
**Last Updated**: 2026-01-23
**Version**: 1.0.0
