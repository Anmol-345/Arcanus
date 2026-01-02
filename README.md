# Arcanus 🔮

Arcanus is a secure, minimal, real-time chat application built with **Next.js (App Router)**, **Supabase**, and **shadcn/ui**.  
It allows users to create ephemeral chat rooms, join using a room token, and communicate in real time with a clean dark-themed UI.

---

## ✨ Features

- 🔐 **Authentication**
  - Google OAuth via Supabase
  - Protected routes using Next.js middleware

- 💬 **Real-time Chat**
  - Live messaging using Supabase Realtime
  - Messages appear instantly without refresh

- 🧩 **Ephemeral Chat Rooms**
  - Create a room instantly
  - Join using a unique room token
  - Room auto-invalidates when deleted

- 🗑️ **Room Deletion Handling**
  - When one user deletes the room:
    - Other users are notified in real time
    - They are redirected safely to home

- 🎨 **Modern Dark UI**
  - Built with shadcn/ui
  - Responsive layout with sidebar + chat panel
  - Message bubbles aligned left/right by sender

- 📋 **UX Enhancements**
  - Copy room ID to clipboard
  - Toast notifications (Sonner)
  - Smooth auto-scroll to latest message

---

## 🧱 Tech Stack

**Frontend**
- Next.js 13+ (App Router)
- React
- Tailwind CSS
- shadcn/ui
- lucide-react icons

**Backend**
- Supabase
  - Auth (Google OAuth)
  - PostgreSQL
  - Realtime
  - Row Level Security (RLS)
  - RPC functions

---

## 🗄️ Database Structure

### Chatroom
- `token` (UUID, primary identifier)
- `activeUser`
- `locked`
- Auto-deletes cascade messages

### Messages
- `id`
- `RoomId` → references `Chatroom.token`
- `SenderId`
- `Content`
- `timestamp`

---

## 🔐 Security

- Row Level Security (RLS) enabled
- Users can only:
  - Insert their own messages
  - Delete chatrooms they are part of
- Messages are automatically deleted when a room is removed

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/arcanus.git
cd arcanus
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the app
```bash
npm run dev
```

---

## 🧪 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

---

## 📁 Project Structure

```
app/
 ├─ login/
 ├─ chatroom/[room]/
 ├─ page.tsx
 ├─ middleware.ts
components/
 └─ ui/ (shadcn)
lib/
 └─ supabase.ts
public/
 └─ apple-touch-icon.png
```

---

## 🧠 Future Improvements

- Typing indicators
- Message encryption
- Room expiry timer
- Multiple participants
- File sharing

---

## 📜 License

MIT License

---

## 👤 Author

**Anmol Sinha**  
Built with ❤️ and curiosity.

---

If you like this project, consider giving it a ⭐ on GitHub!
