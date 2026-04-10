# Ministry of Healing and Deliverance

A modern, production-ready church web application built with Next.js 14+, Firebase, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Lucide Icons
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Rich Text**: TipTap (placeholder, ready to integrate)
- **Auth**: Firebase Auth (email/password + Google)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Client State**: Zustand
- **Server State**: TanStack React Query
- **Auth Middleware**: next-firebase-auth-edge
- **HTML Sanitization**: DOMPurify
- **Image Compression**: browser-image-compression

## Features

- Role-based access control (Admin, Editor, Contributor, User)
- Blog system with categories, likes, and real-time comments
- Prayer request submission and management
- Contact form with message management
- Giving/partnership page with bank details
- Dark mode support
- Responsive mobile-first design
- Smooth Framer Motion animations
- SEO optimization (meta tags, OpenGraph, sitemap, robots.txt)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Firebase project with Auth, Firestore, and Storage enabled

### 1. Clone and Install

```bash
cd mhd-app
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Same as project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key |
| `FIREBASE_API_KEY` | Same as client API key (for middleware) |
| `COOKIE_SECRET_CURRENT` | Random secret for auth cookies |
| `COOKIE_SECRET_PREVIOUS` | Previous cookie secret (rotation) |
| `USE_SECURE_COOKIES` | `true` in production, `false` locally |
| `REVALIDATION_SECRET` | Secret for ISR revalidation API |

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google providers)
3. Create a **Firestore Database**
4. Enable **Firebase Storage**
5. Generate a service account key (Project Settings > Service Accounts)
6. Deploy Firestore security rules from `firestore.rules`

### 4. Set Admin User

After the first user signs up, manually set their role to `"admin"` in the Firestore `users` collection.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (public)/             # Public pages (Home, About, Blog, etc.)
    (auth)/               # Login and Signup
    dashboard/            # Protected dashboard pages
    api/                  # API routes
  components/
    ui/                   # shadcn/ui primitives
    layout/               # Navbar, Footer
    blog/                 # PostCard, LikeButton, CommentSection
    forms/                # Form components
    providers/            # Auth, Query, Theme providers
    shared/               # Reusable shared components
  lib/                    # Utilities, Firebase config, validation
  hooks/                  # Custom React hooks
  stores/                 # Zustand stores
  services/               # Firebase service layer
  types/                  # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy

## RBAC Roles

| Role | Capabilities |
|------|-------------|
| Admin | Full access: manage users, posts, comments, prayer requests, settings |
| Editor | Create/edit/publish posts, moderate comments |
| Contributor | Create/edit drafts only (cannot publish) |
| User | View content, like posts, comment |

## License

Private - Ministry of Healing and Deliverance
