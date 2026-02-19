# 🐾 PetBuddy App

🔗 **Live Preview:** [https://petbuddy-app-nine.vercel.app](https://petbuddy-app-nine.vercel.app)

**PetBuddy** is a modern, mobile-first pet care companion app built as a single-page application. It brings together pet management, veterinary services, shopping, community, and animal rescue — all in one beautiful interface.

---

## ✨ Features

### 🏠 Home Dashboard
- Personalized greeting with location
- Smart reminders for pet health events (e.g. upcoming vaccinations)
- Quick actions grid for fast navigation
- Special offers carousel with gradient cards
- Featured nearby services with ratings and tags

### 🐕 Pet Management
- Pet profile with photo, breed, age, and health status
- Health tracking timeline (vaccinations, weight)
- AI-powered diet chat with suggested prompts
- Smart reminders for vaccinations and feeding schedules

### 🩺 Veterinary Services
- Browse nearby veterinarians with doctor cards
- Filter by specialty (General, Dental, Surgery, Vaccination)
- SOS emergency button for urgent care
- Multi-step appointment booking with calendar and time slot picker

### 🛒 Shop & Store
- Browse products by category and subcategory
- Product detail pages with image gallery, reviews, and subscription toggle
- Shopping cart with delivery estimates and address management
- Store section with flash delivery banner and pet essentials
- Floating cart indicator

### 🚨 Animal Rescue
- Report distressed animals with photo evidence and live location
- Anti-fake news verification system with authenticity checklist
- Track report status (In Progress / Rescued)
- View past reports with progress indicators

### 👥 Community
- Social feed with posts from vets, pet lovers, and organizations
- Category tabs (All, Health, Adoption, Rescue)
- Post engagement (likes, comments, shares)
- Expert and verified user badges
- Fundraiser progress tracking

### 👤 Profile
- User profile with avatar and settings
- Profile menu for account management

### 🔔 Notifications Hub
- Filter tabs: All, Activity, Rescue, Offers
- Notification types: Pet Updates, Rescue Alerts, Limited Offers, Community replies, Support tickets
- Actionable cards with CTAs (View Details, Claim Now)

---

## 🏗️ Architecture

PetBuddy is built as a **Single Page Application (SPA)** — all sections live on one page and are switched via React context state, with no route changes.

```
src/
├── app/
│   ├── page.tsx              # SPA orchestrator with SectionRenderer
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── sections/             # All page-level section components
│   │   ├── HomeSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ShopSection.tsx
│   │   ├── CartSection.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── CommunitySection.tsx
│   │   ├── PetsSection.tsx
│   │   ├── RescueSection.tsx
│   │   ├── StoreSection.tsx
│   │   ├── BookingSection.tsx
│   │   ├── ProductSection.tsx
│   │   └── NotificationsSection.tsx
│   ├── layout/               # MobileContainer, BottomNav
│   ├── booking/              # Stepper, Calendar, TimeSlots, etc.
│   ├── home/                 # GroomingInfo, RecentlyOrdered
│   ├── product/              # Gallery, Info, Reviews, Quantity
│   ├── profile/              # ProfileHeader, ProfileMenu
│   ├── services/             # DoctorCard
│   └── store/                # StoreHeader, CategoryPills, etc.
├── context/
│   └── SectionContext.tsx     # Active section state management
├── lib/
│   └── utils.ts              # Utility functions (cn)
└── types/
    └── index.ts              # Shared type definitions
```

### How Navigation Works

- **`SectionContext`** holds the `activeSection` state
- **`BottomNav`** renders 5 tabs (Home, Pets, Store, Rescue, Community) using buttons that call `setActiveSection()`
- **`SectionRenderer`** in `page.tsx` conditionally renders the active section component
- Internal navigation (e.g. Shop → Cart, Services → Booking) also uses `setActiveSection()`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **clsx / tailwind-merge** | Conditional class names |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**

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
- Sticky headers and floating action buttons
- Bottom navigation bar with highlighted Store tab

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
