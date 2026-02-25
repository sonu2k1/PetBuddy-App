# 🐾 PetBuddy App

🔗 **Live Preview:** [https://petbuddy-app-nine.vercel.app](https://petbuddy-app-nine.vercel.app)

**PetBuddy** is a modern, mobile-first pet care companion app built with **Next.js 16** and **React 19**. It brings together pet management, veterinary services, shopping, community, and animal rescue — all in one beautiful, premium interface.

---

## ✨ Features

### 🔐 Authentication (OTP-Based)
- **Three-step login flow:** Animated splash → Phone number input → OTP verification
- OTP sent via **Twilio SMS** integration
- JWT-based session with **access + refresh tokens** (HTTP-only cookies)
- Auto-redirect to home on valid session
- Secure logout with token invalidation

### 🏠 Home Dashboard
- Personalized greeting with user's name and current location
- **Smart reminders** for upcoming pet health events (vaccinations, feeding)
- Quick actions grid for fast navigation to all sections
- **Special offers** carousel with gradient cards and countdown timers
- Featured nearby services with ratings, distance tags, and reviews
- Floating action button for quick rescue reporting

### 🐕 Pet Management
- **Add Pet:** Multi-field form with name, breed, gender, date of birth, weight, health status, and photo upload
- **Edit Pet:** Full inline editing with image upload support via Cloudinary
- **Delete Pet:** Confirmation dialog with safe deletion
- **Pet Profile:** Detailed view with photo, breed, age calculation, health status badge, and QR code
- **Health Records Timeline:**
  - Three record types: 💉 Vaccination, ⚖️ Weight, 🩺 Treatment
  - Add health records with date picker and notes
  - Delete individual records
  - Visual timeline with color-coded icons
- **AI-Powered Diet Chat:**
  - Integrated with **Google Gemini AI** (Generative Language API)
  - Suggested quick prompts for common pet health questions
  - Real-time streaming responses with markdown rendering
  - Context-aware — knows the pet's breed, age, and health status

### 🩺 Veterinary Services
- Browse nearby veterinarians with rich doctor cards (photo, specialty, rating, distance)
- **Filter by specialty:** General, Dental, Surgery, Vaccination
- **SOS Emergency Button** for urgent veterinary care
- **Multi-step appointment booking:**
  - Step 1: Select date via interactive calendar
  - Step 2: Choose available time slot
  - Step 3: Review and confirm booking
- Real-time slot availability from backend API

### 🛒 Shop & Store
- Browse products by category and subcategory
- **Product detail pages** with:
  - Image gallery with thumbnails
  - Star ratings and customer reviews
  - Quantity selector
  - Subscription toggle for recurring orders
  - Delivery time estimates
- **Shopping cart** with:
  - Quantity adjustment (+/-)
  - Item removal
  - Price breakdown with discounts
  - Delivery address management
- **Store section** with flash delivery banner and pet essentials grid
- Floating cart indicator with item count badge

### 🚨 Animal Rescue System
- **Report distressed animals** with:
  - 📸 **Evidence photo** — Take from camera or pick from gallery, with retake/change options
  - 📍 **Live GPS location** — Auto-detects on page load using browser Geolocation API
  - 🗺️ **Interactive map** — Embedded OpenStreetMap with pin marker at the detected location
  - 🏷️ **Proper address** — Reverse geocoded via server-side Nominatim proxy (shows short name + full address)
  - 📝 **Incident details** — Text description of the situation
  - 🎙️ **Voice note recorder** — Record audio descriptions with waveform visualization, playback, and delete
- **Anti-fake news** verification system with authenticity checklist (Visual Proof + Live Location)
- **Track report status:** Pending → Verified → In Progress → Rescued (with progress bar)
- View past reports with status badges and submission dates

### 👥 Community Section
- **Social feed** with posts from vets, pet lovers, and organizations
- **Category filter tabs:** All, Health, Adoption, Rescue — fully functional filtering with API integration
- **Create Post** with rich features:
  - Text content with multi-line support
  - 📷 **Image upload** — Pick from gallery with preview and remove option
  - 🏷️ **Category tags** — Select Health, Adoption, Rescue, or General
  - 📍 **Location** — Auto-detect GPS and reverse geocode to readable address (removable chip)
  - 😊 **Feeling picker** — 12 emoji moods (Happy, Excited, Grateful, In Love, Curious, Sad, Worried, Proud, Tired, Blessed, Frustrated, Pawsome) with animated modal
- **Like system:**
  - Optimistic UI updates with heart animation
  - Like/unlike toggle via `POST /api/v1/posts/:id/like`
  - Like count display with real-time feedback
- **Comment system:**
  - Slide-up comment drawer with existing comments
  - Add new comments via `POST /api/v1/posts/:id/comment`
  - User avatars and timestamps
- **Share system:**
  - Native **Web Share API** on mobile (share to WhatsApp, Telegram, etc.)
  - Clipboard fallback on desktop with toast notification
- Expert and verified user badges (🩺 Vet, ✓ Verified, 🏢 Organization)
- Fundraiser progress tracking with progress bars

### 👤 Profile
- User profile with avatar, name, and email
- Profile menu for account management
- Secure logout button

### 🔔 Notifications Hub
- **Filter tabs:** All, Activity, Rescue, Offers
- **Notification types:**
  - 🐾 Pet Updates (vaccination reminders, health alerts)
  - 🚨 Rescue Alerts (nearby animal distress reports)
  - 🎁 Limited Offers (discounts, flash sales)
  - 💬 Community Replies (comments on your posts)
  - 🎫 Support Tickets (help desk updates)
- Actionable notification cards with CTAs (View Details, Claim Now)
- Accessible from bell icon across all sections (Home, Profile, Rescue)

---

## 🏗️ Architecture

PetBuddy is built as a **Single Page Application (SPA)** — all sections live on one page and are switched via React context state, with no route changes.

```
src/
├── app/
│   ├── page.tsx                        # SPA orchestrator with SectionRenderer
│   ├── client-page.tsx                 # Client-side root with auth guard
│   ├── layout.tsx                      # Root layout with metadata
│   ├── globals.css                     # Global styles & animations
│   └── api/v1/                         # RESTful API routes
│       ├── auth/
│       │   ├── send-otp/               # POST — Send OTP via Twilio
│       │   ├── verify-otp/             # POST — Verify OTP & issue JWT
│       │   ├── refresh/                # POST — Refresh access token
│       │   └── logout/                 # POST — Invalidate session
│       ├── pets/
│       │   ├── route.ts                # GET (list) / POST (create)
│       │   └── [id]/
│       │       ├── route.ts            # GET / PUT / DELETE
│       │       ├── health-record/      # POST — Add health record
│       │       └── health-records/     # GET — List health records
│       ├── posts/
│       │   ├── route.ts                # GET (list with category filter) / POST (create)
│       │   └── [id]/
│       │       ├── like/               # POST — Like/unlike toggle
│       │       ├── comment/            # POST — Add comment
│       │       └── report/             # POST — Report post
│       ├── rescue/
│       │   ├── route.ts                # GET — List rescue reports
│       │   ├── report/                 # POST — Create rescue report
│       │   └── [id]/                   # GET / PUT — Single report ops
│       ├── geocode/
│       │   └── reverse/                # GET — Server-side Nominatim proxy
│       ├── products/                   # GET — List products with filters
│       ├── cart/                        # GET / POST — Cart operations
│       ├── orders/                     # GET / POST — Order management
│       ├── services/                   # GET — Vet services & time slots
│       ├── health/                     # GET — Health dashboard
│       ├── health-record/              # POST — Create health record
│       ├── reminders/                  # GET / POST — Pet reminders
│       ├── upload/                     # POST — File upload (Cloudinary)
│       ├── ai/                         # POST — Gemini AI chat
│       └── admin/                      # Admin endpoints
├── components/
│   ├── sections/                       # All page-level section components
│   │   ├── HomeSection.tsx             # Home dashboard
│   │   ├── PetsSection.tsx             # Pet profiles & health tracking
│   │   ├── ServicesSection.tsx         # Vet services listing
│   │   ├── ShopSection.tsx             # Product browsing
│   │   ├── CartSection.tsx             # Shopping cart
│   │   ├── CommunitySection.tsx        # Social feed, create post, comments
│   │   ├── RescueSection.tsx           # Rescue reporting with map & voice
│   │   ├── StoreSection.tsx            # Store landing
│   │   ├── BookingSection.tsx          # Appointment booking flow
│   │   ├── ProductSection.tsx          # Product detail page
│   │   ├── ProfileSection.tsx          # User profile
│   │   └── NotificationsSection.tsx    # Notification hub
│   ├── auth/
│   │   └── LoginScreen.tsx             # Three-step OTP login flow
│   ├── pets/
│   │   ├── AddPetModal.tsx             # Add new pet form
│   │   ├── EditPetModal.tsx            # Edit pet details
│   │   ├── AddHealthRecordModal.tsx    # Add vaccination/weight/treatment record
│   │   └── PetHealthChat.tsx           # AI-powered pet diet chat
│   ├── booking/                        # Stepper, Calendar, TimeSlots
│   ├── home/                           # GroomingInfo, RecentlyOrdered
│   ├── product/                        # Gallery, Info, Reviews, Quantity
│   ├── profile/                        # ProfileHeader, ProfileMenu
│   ├── services/                       # DoctorCard
│   ├── store/                          # StoreHeader, CategoryPills
│   ├── layout/                         # MobileContainer, BottomNav
│   └── ui/                             # Shared UI primitives
├── context/
│   ├── SectionContext.tsx              # Active section state management
│   └── AuthContext.tsx                 # Auth state, user, login/logout
├── hooks/
│   └── useData.ts                      # SWR-like data fetching hooks
├── lib/
│   ├── api-client.ts                   # Centralized API client with interceptors
│   └── utils.ts                        # Utility functions (cn)
├── server/
│   └── modules/                        # Server-side business logic
│       ├── auth/                       # OTP, JWT, session management
│       ├── pet/                        # Pet CRUD & health records
│       ├── community/                  # Posts, likes, comments, schemas
│       ├── rescue/                     # Rescue report management
│       ├── product/                    # Product catalog
│       ├── order/                      # Order processing
│       ├── booking/                    # Appointment scheduling
│       ├── reminder/                   # Pet reminders
│       ├── health/                     # Health data aggregation
│       ├── ai/                         # Gemini AI integration
│       └── impact/                     # Community impact metrics
└── middleware.ts                        # Security headers, CORS, CSP, rate limiting
```

### How Navigation Works

- **`SectionContext`** holds the `activeSection` state
- **`BottomNav`** renders 5 tabs (Home, Pets, Store, Rescue, Community) using buttons that call `setActiveSection()`
- **`SectionRenderer`** in `page.tsx` conditionally renders the active section component
- Internal navigation (e.g. Shop → Cart, Services → Booking) also uses `setActiveSection()`

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/send-otp` | Send OTP to phone number |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP and issue JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `GET` | `/api/v1/pets` | List user's pets |
| `POST` | `/api/v1/pets` | Add a new pet |
| `GET/PUT/DELETE` | `/api/v1/pets/:id` | Get, update, or delete a pet |
| `GET` | `/api/v1/pets/:id/health-records` | List health records for a pet |
| `POST` | `/api/v1/pets/:id/health-record` | Add a health record |
| `GET` | `/api/v1/posts?category=...` | List community posts (with optional category filter) |
| `POST` | `/api/v1/posts` | Create a new post |
| `POST` | `/api/v1/posts/:id/like` | Like/unlike a post |
| `POST` | `/api/v1/posts/:id/comment` | Add comment to a post |
| `GET` | `/api/v1/rescue` | List rescue reports |
| `POST` | `/api/v1/rescue/report` | Submit a rescue report |
| `GET` | `/api/v1/geocode/reverse?lat=...&lon=...` | Reverse geocode coordinates (server proxy) |
| `GET` | `/api/v1/products` | List products |
| `GET/POST` | `/api/v1/cart` | View or modify cart |
| `GET` | `/api/v1/services` | List vet services |
| `POST` | `/api/v1/upload` | Upload file to Cloudinary |
| `POST` | `/api/v1/ai` | AI diet chat (Gemini) |
| `GET/POST` | `/api/v1/reminders` | Pet reminders |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework (App Router) |
| **React 19** | UI library with Server Components |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS** | Utility-first styling |
| **MongoDB + Mongoose** | Database and ODM |
| **Twilio** | OTP SMS delivery |
| **Cloudinary** | Image upload and hosting |
| **Google Gemini AI** | AI-powered pet health chat |
| **OpenStreetMap / Nominatim** | Maps and reverse geocoding |
| **Web Geolocation API** | GPS location detection |
| **Web Share API** | Native mobile sharing |
| **MediaRecorder API** | Voice note recording |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |
| **clsx / tailwind-merge** | Conditional class names |

---

## 🔒 Security

- **Content Security Policy (CSP):** Strict CSP headers via Edge Middleware
- **CORS:** Multi-origin support with preflight caching
- **HTTP-only cookies:** JWT tokens stored securely (not in localStorage)
- **Helmet-equivalent headers:** `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `HSTS`
- **Request IDs:** Unique `X-Request-Id` for every request
- **Input validation:** All API inputs validated with Zod schemas
- **Permissions Policy:** Camera, microphone, and geolocation scoped to `self`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**
- **MongoDB** instance (local or Atlas)

### Environment Variables

Create a `.env.local` file in the `petbuddy-app` directory:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Twilio (OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Cloudinary (Image upload)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google Gemini AI
GEMINI_API_KEY=...

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/sonu2k1/PetBuddy-App.git

# Navigate to the app directory
cd PetBuddy-App/petbuddy-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app is optimized for **mobile viewport** (430px wide) — use your browser's device emulation for the best experience.

### Build for Production

```bash
npm run build
npm start
```

---

## 📱 Design

- **Mobile-first** layout (max-width 430px) with desktop fallback warning
- **Pink/coral** (`#F05359`) brand color theme
- Premium card-based UI with gradients, shadows, and micro-interactions
- **Bubble UI** design language with rounded corners and soft shadows
- **Paw-print** background patterns on key sections
- Sticky headers and floating action buttons
- Bottom navigation bar with highlighted active tab
- Smooth `animate-slide-up` transitions for modals and drawers
- Voice recording waveform animations
- Heart burst animation on post likes
- Loading skeletons and spinners for async operations

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
