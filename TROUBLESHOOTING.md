# Troubleshooting Guide 🔧

## Common Issues and Solutions

### 🚫 Application Not Loading

**Issue**: Blank screen or "Application error"

**Solutions**:
1. Check if dev server is running: `npm run dev`
2. Clear Next.js cache: Delete `.next` folder
3. Restart the dev server
4. Check browser console for errors
5. Verify you're on http://localhost:3000

```bash
# Fix steps
rm -rf .next
npm run dev
```

---

### 📡 No Pins Loading / Empty Grid

**Issue**: Loading spinner runs forever or shows "no pins found"

**Possible Causes & Fixes**:

**1. API Endpoint Issue**
```bash
# Test the API directly
curl http://localhost:3000/api/pins
# or
node test-api.mjs
```

**2. Network Issues**
- Check internet connection
- Reddit/Flickr might be down
- Try different search terms
- Wait and refresh

**3. CORS Errors**
- Make sure you're using the API route (`/api/pins`)
- Don't fetch directly from Reddit in the browser
- Server-side fetching should handle CORS

**Fix**: API route should be at `app/api/pins/route.ts`

---

### 🖼️ Images Not Displaying

**Issue**: Broken image icons or images fail to load

**Solutions**:

**1. Check next.config.ts**
Ensure remote patterns include:
- `*.redd.it`
- `live.staticflickr.com`
- `picsum.photos`

**2. Try unoptimized mode**
In PinCard.tsx, the component already has `unoptimized={true}` for Reddit images.

**3. Check Network Tab**
- Open DevTools → Network
- Filter by "Img"
- Look for 403/404 errors
- Some sources may block hotlinking

---

### 🎬 Videos Not Playing

**Issue**: Video pins don't play or show errors

**Solutions**:

**1. Reddit Video CORS**
Reddit videos sometimes have CORS issues. The app uses:
```typescript
video: isVideo ? p.media?.reddit_video?.fallback_url?.split('?')[0] : undefined
```

**2. Check Video Element**
Look in browser console for video errors.

**3. Fallback**
Some videos may not work due to:
- CORS restrictions
- Deleted content
- Format incompatibility

**Fix**: Videos use `poster` attribute for thumbnail fallback.

---

### 🔍 Search Not Working

**Issue**: Typing in search doesn't update results

**Checklist**:
1. ✅ Search input updates when typing?
2. ✅ Form submits when pressing Enter?
3. ✅ URL changes with `?q=` parameter?
4. ✅ Page reloads with new query?

**Debug**:
```typescript
// Check in browser console
console.log(window.location.search); // Should show ?q=yourquery
```

**Common Fix**: Clear browser cache or hard reload (Ctrl+Shift+R)

---

### 📱 Mobile Issues

**Issue**: Layout broken on mobile

**Solutions**:

**1. Viewport Meta Tag**
Check `app/layout.tsx` has viewport config:
```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

**2. CSS Grid Columns**
Check `PinGrid.module.css`:
```css
.masonry {
    columns: 1; /* Should start at 1 for mobile */
}
```

**3. Test in DevTools**
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test different screen sizes

---

### ⚡ Performance Issues / Slow Loading

**Solutions**:

**1. Too Many Pins**
The API limits to ~40 pins per source. If loading is slow:
- Check network speed
- Reduce limit in `route.ts`
- Enable caching properly

**2. Image Optimization**
Ensure `next.config.ts` has:
```typescript
formats: ['image/avif', 'image/webp']
```

**3. Check Bundle Size**
```bash
npm run build
# Look for large bundles in output
```

**4. Disable Video Autoplay**
If too laggy, remove `autoPlay` from Lightbox.tsx video element.

---

### 🎨 Styling Broken / CSS Not Applied

**Issue**: Styles missing or incorrect

**Solutions**:

**1. CSS Modules**
Ensure imports use `.module.css`:
```tsx
import styles from './Component.module.css';
```

**2. Global Styles**
Check `app/globals.css` is imported in `layout.tsx`

**3. Rebuild**
```bash
rm -rf .next
npm run dev
```

**4. Check Class Names**
Use `className={styles.yourClass}` not `class=`

---

### 🔴 Build Errors

**Issue**: `npm run build` fails

**Common Errors & Fixes**:

**1. TypeScript Errors**
```bash
# Check for errors
npx tsc --noEmit

# Common fix: update types
npm install @types/node@latest @types/react@latest
```

**2. Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**3. Memory Issues**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

### 🌐 CORS / API Errors

**Issue**: "Failed to fetch" or CORS errors

**Why This Happens**:
Browser blocks direct API calls to Reddit/Flickr due to CORS policy.

**Solution** (Already Implemented):
✅ We use `/app/api/pins/route.ts` as a proxy
✅ Server-side fetching bypasses CORS
✅ Client fetches from own API

**If Still Broken**:
1. Verify `app/api/pins/route.ts` exists
2. Check it exports a `GET` function
3. Restart dev server

---

### 🐛 Console Errors

**Common Errors & Solutions**:

**1. "Hydration failed"**
```
Fix: Ensure no mismatched HTML between server/client
- Check for <style jsx> conflicts
- Verify Suspense boundaries
```

**2. "useSearchParams must be wrapped in Suspense"**
```
✅ Already fixed - Header and Page wrapped in Suspense
```

**3. "Cannot read property of undefined"**
```
Fix: Add optional chaining
pin?.title instead of pin.title
```

**4. "Image hostname not allowed"**
```
Fix: Add to next.config.ts remotePatterns
```

---

### 📦 Dependency Issues

**Issue**: Package errors or version conflicts

**Solutions**:

**1. Clean Install**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Check Versions**
Ensure compatible versions:
- Next.js: 15.0.0+
- React: 19.0.0+
- Node: 18.0.0+

**3. Update Packages**
```bash
npm update
```

---

### 🔄 Hot Reload Not Working

**Issue**: Changes don't appear without manual refresh

**Solutions**:

**1. Restart Dev Server**
```bash
# Ctrl+C to stop
npm run dev
```

**2. Clear Cache**
```bash
rm -rf .next
```

**3. Check File Watchers**
Some systems have limits:
```bash
# Linux/Mac
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Emergency Fixes 🆘

### Nuclear Option (Reset Everything)

```bash
# Stop dev server (Ctrl+C)

# Delete all generated files
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# Reinstall
npm install

# Restart
npm run dev
```

### Verify Installation

```bash
# Check Node version (need 18+)
node --version

# Check npm version
npm --version

# Check Next.js version
npx next --version

# Test API manually
curl http://localhost:3000/api/pins | head -n 20
```

---

## Getting Help 💬

If none of these solutions work:

1. **Check Dev Server Output**: Look for errors in terminal
2. **Check Browser Console**: F12 → Console tab
3. **Check Network Tab**: F12 → Network tab
4. **Enable Verbose Logging**:
   ```typescript
   // Add to api route
   console.log('Debug:', data);
   ```

5. **Create Minimal Reproduction**:
   - Isolate the issue
   - Test with simple data
   - Document exact steps

---

## Prevention Tips 🛡️

1. **Regular Commits**: Use git to track changes
2. **Test Before Building**: Always test locally
3. **Check Dependencies**: Keep packages updated
4. **Monitor Console**: Watch for warnings early
5. **Use TypeScript**: Catches many errors at compile time

---

## Quick Reference Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Clear cache
rm -rf .next

# Test API
node test-api.mjs

# Full reset
rm -rf .next node_modules && npm install && npm run dev
```

---

**Remember**: Most issues can be solved by:
1. Checking the console
2. Restarting the dev server
3. Clearing the `.next` cache
4. Reading error messages carefully
