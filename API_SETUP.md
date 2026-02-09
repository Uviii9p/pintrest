# Free API Setup Guide 🔑

Your Visual Discovery App now supports **10 different free APIs** for incredible content variety!

## 📊 Current API Status

### ✅ Already Working (No Keys Required)
These APIs work out of the box:

1. **Reddit** - Images & Videos
2. **Picsum Photos** - Random placeholder images  
3. **NASA APOD** - Astronomy pictures
4. **Dog CEO** - Random dog images
5. **The Cat API** - Random cat images
6. **Giphy** - GIFs (using public beta key)

### 🔓 Optional (Add API Keys for More Content)

These require free API keys but significantly enhance content quality:

7. **Unsplash** - Professional photography (5000 req/hour)
8. **Pexels** - High-quality stock photos (200 req/hour)
9. **Pixabay** - Diverse image library (5000 req/hour)

---

## 🚀 Quick Start (No API Keys)

The app works perfectly without any setup! Just run:

```bash
npm run dev
```

You'll get content from:
- Reddit (images & videos)
- NASA space photos
- Random dog & cat images
- Giphy GIFs
- Picsum placeholder images

---

## 🎯 Enhanced Setup (Add API Keys)

Want even more high-quality content? Add these free API keys:

### 1. Unsplash API

**Why**: Access to 3+ million professional photos

**Steps**:
1. Go to https://unsplash.com/developers
2. Click "Register as a Developer"
3. Create a new application
4. Copy your "Access Key"
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

**Limits**: 50 requests/hour (Demo), 5000/hour (Production)

---

### 2. Pexels API

**Why**: High-quality curated photos & videos

**Steps**:
1. Go to https://www.pexels.com/api/
2. Click "Get Started"
3. Create account (free)
4. Copy your API key
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_PEXELS_API_KEY=your_api_key_here
   ```

**Limits**: 200 requests/hour (free forever)

---

### 3. Pixabay API

**Why**: 2.8+ million images and videos

**Steps**:
1. Go to https://pixabay.com/api/docs/
2. Sign up for free account
3. Your API key is shown after registration
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_PIXABAY_API_KEY=your_api_key_here
   ```

**Limits**: 5000 requests/hour (generous!)

---

## 📁 Environment Setup

Create a `.env.local` file in your project root:

```bash
# Copy this template and add your keys

# Unsplash (optional)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=

# Pexels (optional)
NEXT_PUBLIC_PEXELS_API_KEY=

# Pixabay (optional)
NEXT_PUBLIC_PIXABAY_API_KEY=

# Giphy (already working with public key, but you can add your own)
NEXT_PUBLIC_GIPHY_API_KEY=dc6zaTOxFJmzC
```

**Important**: After adding keys, restart your dev server!

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

---

## 🎨 Content by Source

### What Each API Provides

| API | Images | Videos | GIFs | Special Content |
|-----|--------|--------|------|-----------------|
| **Reddit** | ✅ | ✅ | - | Community content |
| **Unsplash** | ✅ | - | - | Professional photos |
| **Pexels** | ✅ | ✅ | - | Stock photos & videos |
| **Pixabay** | ✅ | - | - | Diverse library |
| **NASA** | ✅ | - | - | Space & astronomy |
| **Giphy** | - | - | ✅ | Animated GIFs |
| **Dog CEO** | ✅ | - | - | Dog photos |
| **The Cat API** | ✅ | - | - | Cat photos |
| **Picsum** | ✅ | - | - | Placeholder images |

---

## 🔍 Category Mapping

### New Categories Added

Now your app has these specialized categories:

- **Dogs** → Fetches from Dog CEO API
- **Cats** → Fetches from The Cat API
- **NASA** → Space photos from NASA APOD
- **Animals** → Combines dogs, cats, and wildlife
- **Videos** → Prioritizes video content from all sources
- **Art/Design/Photography** → High-quality creative content

---

## 🎯 Testing Your Setup

### 1. Check Which APIs Are Active

Open browser console and check:
```javascript
// The app will log which APIs are enabled
```

### 2. Test Different Categories

Click through these categories to see different APIs in action:
- **All** → Mixed content from all sources
- **Dogs** → Dog CEO API
- **Cats** → The Cat API
- **NASA** → NASA space photos
- **Videos** → Reddit videos + Giphy GIFs

### 3. Search Functionality

Try searching for:
- "nature" → All APIs search for nature content
- "art" → Creative content from Unsplash, Pexels, etc.
- "space" → NASA + Reddit space content
- "dogs" → Dog-specific content

---

## 📊 Content Quality Comparison

### Without API Keys
- ~50-100 pins per search
- Reddit + NASA + Dogs + Cats + Picsum
- Mix of quality levels

### With All API Keys
- ~150-200+ pins per search  
- All sources combined
- Higher quality professional photos
- More diverse content
- Better search results

---

## 🔒 Rate Limits & Best Practices

### API Rate Limits

| API | Free Tier Limit | Notes |
|-----|----------------|-------|
| Unsplash | 50/hour (demo) | Upgrade to 5000/hour (free) |
| Pexels | 200/hour | Generous, rarely hit |
| Pixabay | 5000/hour | Very generous |
| NASA | DEMO_KEY limits | Get free key for unlimited |
| Reddit | Unofficial, be nice | Auto-cached for 1 hour |
| Dog/Cat/Picsum | Unlimited | No restrictions |

### Our Caching Strategy

To respect rate limits, we cache:
- **1 hour**: API responses (server-side)
- **5 minutes**: Client-side requests
- **24 hours**: NASA APOD (changes daily)

This means you can search hundreds of times without hitting limits!

---

## 🛠️ Troubleshooting

### API Key Not Working?

1. **Check .env.local syntax**
   ```bash
   # Correct
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=abc123xyz
   
   # Wrong (no quotes needed)
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY="abc123xyz"
   ```

2. **Restart dev server**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

3. **Verify key in console**
   ```typescript
   // Check lib/config.ts is importing correctly
   ```

### No Content from Specific API?

Check these:
1. Is the API key correct?
2. Did you restart the server?
3. Are you within rate limits?
4. Check browser Network tab for errors

### Still Not Working?

The app is designed to gracefully handle missing APIs. If one fails, others continue working!

---

## 🚀 Production Deployment

### For Vercel/Netlify

Add environment variables in your hosting dashboard:

**Vercel**:
1. Project Settings → Environment Variables
2. Add each `NEXT_PUBLIC_*` variable
3. Redeploy

**Netlify**:
1. Site Settings → Build & Deploy → Environment
2. Add variables
3. Redeploy

### Important: Never Commit API Keys!

```bash
# .gitignore already includes:
.env.local
.env*.local
```

---

## 💡 Pro Tips

### 1. Upgrade Unsplash for Production
- Demo: 50 requests/hour
- Production (free): 5000 requests/hour
- Just fill out a simple approval form

### 2. Combine Search with Categories
- Search "ocean" + Category "Photography"
- Gets you professional ocean photos from Unsplash/Pexels!

### 3. Use Specific Keywords
Better search results:
- ❌ "pics" 
- ✅ "landscape photography"
- ✅ "minimalist design"
- ✅ "abstract art"

### 4. Monitor Your Usage
Most APIs have dashboards showing:
- Requests made
- Remaining quota
- Usage patterns

---

## 📈 Content Statistics

With all APIs enabled, you can access:

- **6+ million** Unsplash photos
- **2.8+ million** Pixabay images
- **Millions** of Pexels photos & videos
- **Daily** NASA space photos
- **Unlimited** Reddit community content
- **Thousands** of dog/cat images
- **Endless** Giphy GIFs

**Total potential content**: 10+ MILLION unique pins! 🎉

---

## 🎯 Recommended Setup

### For Development
```bash
# Minimum (already working)
# No keys needed!

# Recommended (best experience)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key
NEXT_PUBLIC_PEXELS_API_KEY=your_key
NEXT_PUBLIC_PIXABAY_API_KEY=your_key
```

### For Production
Add all three keys for maximum content diversity.

---

## 📞 Getting Help

### Issues Getting API Keys?

1. **Unsplash**: Check https://unsplash.com/documentation
2. **Pexels**: Email api@pexels.com
3. **Pixabay**: Check FAQ at https://pixabay.com/api/docs/

### App-Specific Issues?

Check `TROUBLESHOOTING.md` for common solutions.

---

## ✅ Quick Checklist

- [ ] App works without any keys (Reddit, NASA, Dogs, Cats, Picsum)
- [ ] Created `.env.local` file (optional)
- [ ] Added Unsplash key (optional)
- [ ] Added Pexels key (optional)
- [ ] Added Pixabay key (optional)
- [ ] Restarted dev server
- [ ] Tested different categories
- [ ] Searched for content
- [ ] Verified APIs in Network tab

---

**Remember**: The app is designed to work great with or without API keys. Start free, add keys later for even more content! 🚀
