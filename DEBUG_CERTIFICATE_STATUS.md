# Debug Certificate Upload Status Issue

## Issue

After successfully uploading certificate and private key, the UI still shows "Pending Certificates" warning and "No certificate loaded" / "No private key loaded" messages.

## Added Debug Logging

I've added comprehensive console logging to help diagnose the issue. Follow these steps:

### 1. Open Browser Console

- Chrome/Edge: Press `F12` or `Ctrl+Shift+I`
- Navigate to the **Console** tab

### 2. Clear Console

- Click the 🚫 clear icon to start fresh

### 3. Open Digital Certificates Modal

- Go to Business Settings
- Click "Digital Certificates" button
- **Check console for:** `[Certificate Status Response]` log

### 4. Upload Certificate File

- Use `tests/test-cert.crt`
- Click "Upload Certificate (.crt)"
- **Watch for these logs:**
  - `[Certificate Upload Success]` - Shows upload response
  - `[Fetching updated certificate status...]` - Confirms refetch triggered
  - `[Certificate Status Response]` - Shows status API response
  - `[Setting Certificate Status]` - Shows what state is being set
  - `[Certificate Status State]` - Shows computed upload flags

### 5. Upload Private Key File

- Use `tests/test-pkcs8-key.pem`
- Click "Upload Private Key (.key)"
- **Watch for same log sequence**

### 6. Check Final State

After both uploads complete, look for the last `[Certificate Status State]` log. It should show:

```javascript
{
  certificateStatus: {
    digital: {
      status: "VALID",
      fileName: "test-cert.crt",
      uploadedAt: "2026-01-26T...",
      // ...
    },
    privateKey: {
      status: "VALID",
      fileName: "test-pkcs8-key.pem",
      uploadedAt: "2026-01-26T...",
      // ...
    }
  },
  certUploaded: true,   // ← Should be true
  keyUploaded: true,    // ← Should be true
  bothUploaded: true    // ← Should be true
}
```

## Expected Behavior vs Actual

### ✅ Expected (if working correctly)

- `certUploaded: true` when certificate has `status: "VALID"` OR `fileName` exists
- `keyUploaded: true` when private key has `status: "VALID"` OR `fileName` exists
- `bothUploaded: true` when both above are true
- UI shows green "Certificates Ready" banner
- UI shows checkmarks and filenames
- "Pending Certificates" warning hidden

### ❌ What's Happening (current bug)

- Files upload successfully (200 OK)
- Status fetch may return empty/null data
- OR status fetch returns data but state doesn't update
- OR computed flags (`certUploaded`, `keyUploaded`) evaluate to false despite data existing

## Possible Root Causes to Investigate

Based on the logs, we'll identify which scenario is happening:

### Scenario A: Status Response is Empty/Null

**Symptoms:**

- `[Certificate Status Response]` shows `{ success: true, data: null }` or `{ success: true, data: {} }`
- `[Setting Certificate Status]` doesn't appear

**Cause:** Database save may not be completing before status fetch, or newly created fiscal config doesn't have certificate data yet

**Fix:** Add a small delay before refetch, or ensure fiscal.save() completes properly

### Scenario B: Status Response is Correct but State Doesn't Update

**Symptoms:**

- `[Certificate Status Response]` shows correct data with fileName and status
- `[Setting Certificate Status]` appears with correct data
- But `[Certificate Status State]` shows `certificateStatus: null` or old data

**Cause:** React state update timing issue, or component re-render not happening

**Fix:** Force state update, add dependency to useEffect, or check if state is being overwritten

### Scenario C: State Updates but Flags Evaluate False

**Symptoms:**

- `[Certificate Status State]` shows `certificateStatus` with data
- But `certUploaded: false` and `keyUploaded: false`

**Cause:** Data structure mismatch (e.g., `digital` vs `certificateDigital`, `status` field missing)

**Fix:** Adjust the condition logic or API response structure

### Scenario D: Everything Correct but UI Doesn't Update

**Symptoms:**

- Logs show all correct: data fetched, state set, flags true
- But UI still shows "Pending"

**Cause:** React rendering issue, conditional logic in JSX wrong, or stale closure

**Fix:** Check JSX conditions, add key to force re-render, or check React component structure

## Manual Testing Steps

1. **Test with fresh state:**
   - Log out and log back in
   - Open modal (should show PENDING status)
   - Upload certificate
   - Check logs for Scenario A-D

2. **Test with existing uploads:**
   - If certificates already uploaded in database
   - Close and reopen modal
   - Should immediately show uploaded state
   - Check if `[Certificate Status Response]` on mount returns correct data

3. **Test sequential uploads:**
   - Upload certificate first
   - Check if UI updates to show certificate uploaded but key pending
   - Then upload key
   - Check if UI updates to show both uploaded

## Report Results

Copy the console logs and paste them here:

```
[Paste console output here]
```

Include:

- All `[Certificate Status Response]` logs
- All `[Certificate Status State]` logs
- Any errors or warnings
- Network tab screenshot showing `/api/fiscal-config/certificates/status` response body
