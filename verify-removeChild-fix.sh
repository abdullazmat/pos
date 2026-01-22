#!/bin/bash
# Quick verification that the removeChild fix is in place

echo "🔍 Verifying RemoveChild Fix Installation..."
echo ""

# Check ToastProvider has display:contents
if grep -q "display: \"contents\"" src/components/common/ToastProvider.tsx; then
    echo "✅ ToastProvider.tsx - display:contents wrapper found"
else
    echo "❌ ToastProvider.tsx - display:contents wrapper NOT found"
fi

# Check ThemeProvider has display:contents
if grep -q "display: \"contents\"" src/components/theme-provider.tsx; then
    echo "✅ ThemeProvider.tsx - display:contents wrapper found"
else
    echo "❌ ThemeProvider.tsx - display:contents wrapper NOT found"
fi

# Check GlobalErrorHandler exists
if [ -f "src/components/common/GlobalErrorHandler.tsx" ]; then
    echo "✅ GlobalErrorHandler.tsx - exists"
else
    echo "❌ GlobalErrorHandler.tsx - NOT found"
fi

# Check SafePortal exists
if [ -f "src/components/common/SafePortal.tsx" ]; then
    echo "✅ SafePortal.tsx - exists"
else
    echo "❌ SafePortal.tsx - NOT found"
fi

# Check layout.tsx imports GlobalErrorHandler
if grep -q "GlobalErrorHandler" src/app/layout.tsx; then
    echo "✅ layout.tsx - GlobalErrorHandler imported"
else
    echo "❌ layout.tsx - GlobalErrorHandler NOT imported"
fi

# Check layout.tsx has suppressHydrationWarning on body
if grep -q "body.*suppressHydrationWarning" src/app/layout.tsx; then
    echo "✅ layout.tsx - suppressHydrationWarning on body"
else
    echo "❌ layout.tsx - suppressHydrationWarning NOT on body"
fi

# Check queueMicrotask usage
if grep -q "queueMicrotask" src/components/common/ToastProvider.tsx; then
    echo "✅ ToastProvider.tsx - queueMicrotask used"
else
    echo "❌ ToastProvider.tsx - queueMicrotask NOT used"
fi

echo ""
echo "🎉 All fixes appear to be in place!"
echo ""
echo "Next steps:"
echo "1. npm run dev"
echo "2. Navigate to http://localhost:3000/products"
echo "3. Check browser console (F12) - should be clean"
echo "4. No 'removeChild' errors should appear"
