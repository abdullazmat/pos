# Certificate Upload Testing Guide

## 🎯 Test Files Generated

All test files are located in: `C:\pos-saas\tests\`

### ✅ Valid Files (Should Pass Validation)

1. **test-cert.crt** - Valid PEM certificate (443 bytes)
   - Use: Upload as Digital Certificate
   - Expected: ✓ Success

2. **test-pkcs8-key.pem** - PKCS#8 private key (1,704 bytes)
   - Use: Upload as Private Key
   - Expected: ✓ Success

3. **test-rsa-key.key** - PKCS#1 RSA private key (1,675 bytes)
   - Use: Upload as Private Key
   - Expected: ✓ Success

4. **test-ec-key.pem** - EC private key (223 bytes)
   - Use: Upload as Private Key
   - Expected: ✓ Success

5. **test-crlf-key.pem** - PKCS#8 with Windows line endings
   - Use: Upload as Private Key
   - Expected: ✓ Success

### ❌ Invalid Files (Should Fail Validation)

1. **invalid-cert.crt** - No PEM headers
   - Expected: ✗ "Invalid certificate format"

2. **invalid-key.pem** - No PEM headers
   - Expected: ✗ "Invalid private key format"

3. **oversized.pem** - 2MB file (exceeds 1MB limit)
   - Expected: ✗ "File size exceeds 1MB limit"

---

## 🧪 Manual Testing Checklist

### Happy Path Tests

- [ ] Upload `test-cert.crt` as Digital Certificate
  - ✓ Green success toast appears
  - ✓ Filename shown with checkmark
  - ✓ Modal shows "Certificates Ready" banner
  - ✓ No errors in browser console

- [ ] Upload `test-pkcs8-key.pem` as Private Key
  - ✓ Green success toast appears
  - ✓ Filename shown with checkmark
  - ✓ Both uploads complete → "Certificates Ready" banner
  - ✓ No private key content in Network tab response

- [ ] Upload `test-rsa-key.key` as Private Key (alternative format)
  - ✓ Accepts PKCS#1 RSA format
  - ✓ Success message appears

- [ ] Upload `test-ec-key.pem` as Private Key (EC format)
  - ✓ Accepts EC private key format
  - ✓ Success message appears

### Error Path Tests

- [ ] Upload `invalid-cert.crt` as Digital Certificate
  - ✗ Red error toast: "Invalid certificate format"
  - ✓ Upload button remains enabled
  - ✓ Can retry with valid file

- [ ] Upload `invalid-key.pem` as Private Key
  - ✗ Red error toast: "Invalid private key format"
  - ✓ Upload button remains enabled
  - ✓ Can retry with valid file

- [ ] Upload `oversized.pem` as Private Key
  - ✗ Red error toast: "File size exceeds 1MB limit"
  - ✓ Frontend prevents upload before API call

### Edge Case Tests

- [ ] Upload certificate with .cer extension (rename test-cert.crt → test.cer)
  - ✓ Accepts .cer extension

- [ ] Upload private key with spaces in filename
  - ✓ Handles special characters correctly

- [ ] Upload same file twice
  - ✓ Overwrites previous upload
  - ✓ Shows updated timestamp

- [ ] Close modal without uploading
  - ✓ Modal closes cleanly
  - ✓ No errors

- [ ] Open modal, check status of existing uploads
  - ✓ Shows previously uploaded filenames
  - ✓ Shows upload dates

### Security Tests

- [ ] Check Network tab response after private key upload
  - ✓ Response does NOT contain private key content
  - ✓ Response only shows: `{ success: true, data: { message: "...", status: "VALID" } }`

- [ ] Check browser console logs
  - ✓ No private key content logged
  - ✓ No sensitive data in error messages

- [ ] Check GET /api/fiscal-config/certificates/status response
  - ✓ Returns only metadata: fileName, status, uploadedAt
  - ✓ Does NOT return: storagePath, hash, or actual key content

- [ ] Verify database (if access available)
  - ✓ FiscalConfiguration document has `privateKey.hash` (SHA256)
  - ✓ FiscalConfiguration document has `privateKey.storagePath` (reference)
  - ✓ Actual key content NOT stored in plain text

### Integration Tests

- [ ] After uploading both certificates, save Business Settings
  - ✓ Settings save successfully
  - ✓ Certificates remain uploaded

- [ ] Navigate away and return to Business Settings
  - ✓ Certificate status persists
  - ✓ Shows uploaded filenames

- [ ] Log out and log back in
  - ✓ Certificates still show as uploaded
  - ✓ Status API returns correct data

- [ ] Try creating an invoice/receipt
  - ✓ System doesn't break
  - ✓ Fiscal config exists

---

## 🔒 Security Verification

### ✓ What Should Happen

1. Private key content is **never** returned in API responses
2. Private key content is **never** logged to console
3. Only metadata stored: fileName, fileSize, status, uploadedAt, hash, storagePath
4. Hash is SHA256 of content (for validation, not decryption)
5. storagePath is a reference (e.g., `certs/business_123_key_1234567890.pem`)
6. Actual file content would be encrypted at rest in production

### ✗ What Should NOT Happen

1. ❌ Private key appears in JSON response
2. ❌ Private key logged to console (even in errors)
3. ❌ Private key visible in browser DevTools
4. ❌ GET /status returns actual key content
5. ❌ Error messages contain key content

---

## 📊 Test Results Template

Copy this template to record your test results:

```markdown
### Test Run - [Date/Time]

**Environment:**

- Browser: [Chrome/Firefox/Safari]
- User: [Test account email]
- Business: [Test business name]

**Happy Path:**

- [ ] Upload valid certificate (.crt): PASS / FAIL
- [ ] Upload valid private key (.pem): PASS / FAIL
- [ ] Upload RSA private key (.key): PASS / FAIL
- [ ] Upload EC private key: PASS / FAIL

**Error Cases:**

- [ ] Invalid certificate rejected: PASS / FAIL
- [ ] Invalid private key rejected: PASS / FAIL
- [ ] Oversized file rejected: PASS / FAIL

**Security:**

- [ ] Private key not in response: PASS / FAIL
- [ ] Private key not logged: PASS / FAIL
- [ ] Only metadata stored: PASS / FAIL

**Notes:**
[Add any issues, bugs, or observations here]
```

---

## 🛠️ Re-generate Test Files

To regenerate test files with fresh keys:

```bash
cd C:\pos-saas
node tests\manual-certificate-test.js
```

This will:

- Generate new RSA key pairs
- Create all test files
- Display verification checksums
- Show next steps

---

## 📝 Known Limitations

1. Test certificates are self-signed (not from real CA)
2. Test private keys are generated on-the-fly (not from AFIP/SII/SUNAT)
3. No actual encryption storage in this test (TODO for production)
4. No HSM integration (TODO for production)

These limitations are **acceptable for development/testing** but should be addressed before production deployment.
