# 🚀 Quick Reference Guide

## 💻 Running the Application

### Development Server
```bash
npm run dev
```
- Runs on `http://localhost:3000`
- Hot reload enabled
- TypeScript compilation on save

### Production Build
```bash
npm run build
npm start
```
- Optimized build
- Ready for deployment

---

## 🔑 Test Credentials

### Login Page (`/login`)
- **Email**: any email (e.g., `user@example.com`)
- **Password**: any password (demo mode)

### Signup Page (`/signup`)
- **Username**: any username
- **Email**: any email

---

## 📍 Page Routes

| Route | Purpose | Features |
|-------|---------|----------|
| `/` | Home | Browse pins, search, categories |
| `/login` | Professional login | Email + password authentication |
| `/signup` | Create account | Username + email signup |
| `/create` | Create pin | Upload new pins |
| `/api/pins` | Get pins | Search, trending, filter |
| `/api/download` | Download media | Authenticated downloads |

---

## 🎯 Component Usage

### Use Notifications
```typescript
import { useNotification } from '@/context/NotificationContext';

export function MyComponent() {
    const { notify } = useNotification();
    
    return (
        <button onClick={() => notify('Success!', 'success')}>
            Click me
        </button>
    );
}
```

### Access Chat
```typescript
import { useChat } from '@/context/ChatContext';

export function MyComponent() {
    const { chats, activeChat, sendMessage } = useChat();
    
    return <div>Chat feature</div>;
}
```

### Use Authentication
```typescript
import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
    const { user, login, logout } = useAuth();
    
    return <div>{user?.username || 'Not logged in'}</div>;
}
```

---

## 🎨 Customizing Styles

### Login Page Colors
**File**: `app/login/LoginPage.module.css`

Change gradient:
```css
.container {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Chat Modal Size
**File**: `components/ChatModal/ChatModal.module.css`

Adjust dimensions:
```css
.modal {
    width: 600px;  /* Desktop */
    height: 700px;
}
```

### Notification Colors
**File**: `components/Toast/Toast.module.css`

Modify notification type:
```css
.toast.success {
    background: linear-gradient(135deg, YOUR_COLOR1, YOUR_COLOR2);
}
```

---

## 🔔 Notification Types

| Type | Usage | Color |
|------|-------|-------|
| `success` | Successful operations | Green |
| `error` | Errors and failures | Red |
| `warning` | Warnings/caution | Orange |
| `info` | Information | Blue |

---

## 💬 Chat Features

### How to Search & Chat with Users ✨
1. Click the **message icon** in the header
2. You're on the **chat page** (`/chat`)
3. In the search box, type a user's **name** or **ID**
4. Select a user from results → click **"Start Chat"**
5. Begin messaging!

### Send Message
1. Open chat page (click message icon)
2. Search and select a user
3. Type message in input box
4. Press Enter or click Send button

### Unread Notifications
- Badge shows count on message icon when unread
- Automatically marks as read when chat opened
- Number updates in real-time

---

## 📁 Project Structure

```
pintrest/
├── app/
│   ├── api/                 # API endpoints
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── Header/             # Navigation
│   ├── Toast/              # Notifications
│   ├── ChatModal/          # Chat interface
│   ├── Pin/                # Pin components
│   └── ...
├── context/
│   ├── AuthContext.tsx     # Authentication
│   ├── NotificationContext.tsx  # Notifications
│   └── ChatContext.tsx     # Chat
├── lib/
│   └── api.ts              # API helpers
├── public/
│   └── logo.svg            # App logo
└── types.ts                # TypeScript types
```

---

## ⚙️ Configuration

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### TypeScript Config
- `tsconfig.json` - Set up with path aliases
- `/` maps to root
- `@/` maps to source root

### ESLint Config
- `eslint.config.mjs` - Code quality
- Configured for Next.js + React

---

## 🧪 Quick Testing

### Test Login Flow
1. Go to `/login`
2. Fill email: `test@example.com`
3. Fill password: `password123`
4. Click "Sign In"
5. ✅ Should redirect to home

### Test Chat Search
1. Click message icon in header
2. Go to `/chat` page
3. Type in search box: **"alice"** or **"user-1"**
4. ✅ Should show "Alice Johnson" in results
5. Click **"Start Chat"** button
6. ✅ Chat window should open with Alice

### Test Messaging
1. Search and start chat with any user
2. Type a message: "Hello!"
3. Press Enter or click Send
4. ✅ Message appears on right side (your message)
5. ✅ Reply from user appears on left side

### Test Notifications
1. Open browser console (F12)
2. Search for any term
3. Should see notification in top-right

---

## 📊 Performance Tips

### Optimize Images
- Use next/image component
- Set proper width/height
- Use responsive sizes

### Code Splitting
- Dynamic imports for large components
- Lazy load modals
- Tree-shake unused code

### Caching
- Use Next.js ISR
- Set proper cache headers
- Browser caching for assets

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Stop all node processes
Get-Process -Name node | Stop-Process -Force

# Or use different port
npm run dev -- -p 3001
```

### Chat Search Not Finding Users
- Make sure you're typing in the **search box** on the chat page
- Try typing **exact names**: "alice", "bob", "carol", "david", "emma", "frank"
- Or use **user IDs**: "user-1", "user-2", "user-3", etc.
- Search is **case-insensitive** (both "Alice" and "alice" work)
- After typing, wait a moment for results to appear
- Click **"Start Chat"** button to begin conversation

### Styling Not Applied
- Check CSS Module import
- Verify class name spelling
- Clear browser cache (Ctrl+Shift+R)

### Chat Not Opening
- Ensure logged in (header shows profile)
- Check NotificationProvider in layout
- Verify ChatProvider is wrapped

### Notification Not Showing
- Check Toast component is in layout
- Verify useNotification hook usage
- Check browser console for errors

---

## 🚀 Deployment Guide

### Vercel (Recommended)
```bash
vercel deploy
```

### GitHub Pages
```bash
npm run build
# Upload `out` folder
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD npm start
```

### Environment Setup
```bash
# Production variables
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `FEATURES_GUIDE.md` | Detailed feature docs |
| `UI_ENHANCEMENTS_SUMMARY.md` | Design system |
| `COMPLETE_FEATURES_SUMMARY.md` | Full implementation guide |
| `.github/copilot-instructions.md` | Architecture overview |

---

## 🔗 Useful Links

- **Next.js**: https://nextjs.org
- **React**: https://react.dev
- **TypeScript**: https://typescriptlang.org
- **Lucide Icons**: https://lucide.dev
- **CSS Modules**: https://nextjs.org/docs/pages/building-your-application/styling/css-modules

---

## ✅ Pre-Deployment Checklist

- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Notifications working
- [ ] Chat working
- [ ] Login/Signup working
- [ ] Responsive on mobile
- [ ] All links work
- [ ] Images load properly
- [ ] API calls complete

---

## 🎓 Learning Resources

### Get Started with Contexts
See `context/AuthContext.tsx` for example

### Add New Feature
1. Create context in `context/`
2. Add provider in layout
3. Use hook in components

### Style New Component
1. Create `.module.css` file
2. Import as `styles`
3. Use `styles.className`

---

**Your application is ready to use! Happy coding! 🚀**
