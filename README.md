# Visual Discovery App 🎨

A modern, Pinterest-inspired visual discovery platform built with Next.js 15, featuring high-quality images and videos from multiple sources.

## ✨ Features

### 🖼️ Content Discovery
- **Multi-Source Integration**: Real-time content from Reddit, Flickr, and open-source platforms
- **Smart Search**: Search across all platforms simultaneously
- **Category Filtering**: Browse by categories like Art, Design, Nature, Videos, and more
- **Mixed Media**: Seamlessly view both images and videos in one feed

### 🎬 Video Support
- **Autoplay Previews**: Videos play automatically on hover
- **Fullscreen Viewing**: Click to view videos in high-resolution lightbox
- **Smart Video Badge**: Visual indicator for video content
- **Multiple Sources**: Reddit video support with fallback URLs

### 🎯 User Experience
- **Infinite Scroll Grid**: Masonry layout that adapts to content
- **Lightbox Modal**: Immersive viewing experience with pin details
- **Responsive Design**: Optimized for all devices (mobile to desktop)
- **Loading States**: Beautiful spinner while fetching content
- **Error Handling**: Graceful fallbacks when APIs fail

### ⚡ Performance
- **Server-Side API**: Bypasses CORS with Next.js API routes
- **Image Optimization**: AVIF/WebP support with lazy loading
- **Code Splitting**: Dynamic imports for faster initial load
- **Caching**: Smart caching strategy (5 min client, 1 hour server)
- **Memoization**: Prevents unnecessary re-renders

### 📱 Responsive Features
- **Mobile-First**: 1-6 column grid based on screen size
- **Touch Optimized**: 40px+ touch targets
- **Smooth Scrolling**: Native momentum on mobile
- **Adaptive Typography**: Scales across devices
- **Gesture Support**: Swipe-friendly category bar

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with HSL color system
- **Icons**: Lucide React
- **Font**: Google Fonts (Outfit)
- **APIs**: Reddit JSON, Flickr Public Feed

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 API Sources

The app now integrates **10 different free APIs** for maximum content diversity!

### ✅ Always Available (No API Key Required)

**Reddit**
- Image subreddits: Art, Design, Architecture, Photography, etc.
- Video subreddits: oddlysatisfying, Cinemagraphs, Space, etc.
- Features: NSFW filtering, high-quality previews, community content

**NASA APOD**
- Astronomy Picture of the Day
- Space and universe photography
- Educational content with descriptions

**Dog CEO**
- Random dog images from all breeds
- Fun and wholesome content
- Perfect for animal lovers

**The Cat API**
- High-quality cat images
- Diverse cat breeds and poses
- Adorable feline content

**Picsum Photos**
- Random placeholder images
- Aesthetic photography
- Great for design inspiration

**Giphy**
- Animated GIFs
- Works with public beta key
- Entertainment and creative content

### 🔓 Optional (Add API Keys for Enhanced Content)

**Unsplash** (Recommended!)
- 3+ million professional photos
- World-class photography
- Free tier: 50 req/hour (demo), 5000/hour (production)
- Get key: https://unsplash.com/developers

**Pexels**
- High-quality stock photos & videos
- Curated collections
- Free tier: 200 requests/hour
- Get key: https://www.pexels.com/api/

**Pixabay**
- 2.8+ million images
- Diverse content library
- Free tier: 5000 requests/hour
- Get key: https://pixabay.com/api/docs/

See `API_SETUP.md` for detailed setup instructions!

## 🎨 Design System

### Colors
- **Primary**: HSL(350, 100%, 45%) - Pinterest Red
- **Background**: HSL(0, 0%, 100%) / HSL(0, 0%, 4%) (dark mode)
- **Surface**: Multi-level HSL grays
- **Text**: Semantic main/muted variants

### Typography
- **Font Family**: Outfit (300-700 weights)
- **Base Size**: 16px
- **Scale**: Responsive (14-32px headlines)

### Spacing
- **Grid Gap**: 12-20px (responsive)
- **Padding**: 12-32px (context-dependent)
- **Border Radius**: 12px (md), 24px (xl), 9999px (full)

## 📱 Breakpoints

```css
Mobile:    < 480px   (1 column)
Small:     480px+    (2 columns)
Tablet:    768px+    (3 columns)
Desktop:   1024px+   (4 columns)
Large:     1280px+   (5 columns)
XL:        1536px+   (6 columns)
```

## 🔧 Configuration

### Next.js Config
- Image optimization with modern formats
- Remote patterns for external images
- Compression enabled
- Strict mode enabled

### Performance Optimizations
- Dynamic imports for lightbox
- React.memo for grid components
- Suspense boundaries for async data
- Image lazy loading
- Font preconnect

## 📁 Project Structure

```
pintrest/
├── app/
│   ├── api/
│   │   └── pins/
│   │       └── route.ts       # Server-side API
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── CategoryBar/           # Category filter
│   ├── Header/                # Top navigation
│   ├── Lightbox/              # Pin detail modal
│   ├── Pin/                   # Pin card
│   └── PinGrid/               # Masonry grid
├── lib/
│   └── api.ts                 # API client
├── types.ts                   # TypeScript types
└── next.config.ts             # Next.js config
```

## 🎯 Key Features Implementation

### Search Functionality
1. Type in search bar
2. Press Enter or click search icon
3. URL updates with query parameter
4. All sources searched simultaneously
5. Results displayed in masonry grid

### Category Filtering
1. Click category button
2. Content filtered by category keyword
3. "Videos" category prioritizes video content
4. Smooth scroll in horizontal category bar

### Lightbox Viewing
1. Click any pin card
2. Modal opens with full details
3. Videos autoplay with controls
4. Source link and author info
5. Click outside or X to close

### Responsive Behavior
- Header shrinks on mobile (64px → 80px)
- Category buttons adapt size
- Grid columns adjust automatically
- Lightbox stacks vertically on mobile
- Touch targets meet accessibility standards

## 🔒 Security & Privacy

- NSFW content filtered automatically
- No user data collection
- Public APIs only (no authentication)
- Client-side rate limiting via caching

## 🐛 Known Limitations

- Reddit API rate limits (unofficial endpoint)
- Flickr feed limited to 20 recent items
- Some external images may fail to load
- Video playback depends on source availability

## 🚀 Future Enhancements

- [ ] User authentication
- [ ] Save/board functionality
- [ ] Infinite scroll pagination
- [ ] More API sources (Unsplash, Pexels with keys)
- [ ] PWA support
- [ ] Offline caching
- [ ] Social sharing
- [ ] Pin upload feature

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Built with ❤️ using Next.js and modern web technologies.

---

**Note**: This application uses public APIs and does not require API keys. For production use, consider implementing proper API keys and rate limiting.
