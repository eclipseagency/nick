# NICK - High Performance Automotive Film

Website and booking system for NICK RIYADH, a premium automotive protection brand (est. 1999).

- **Live**: https://nick.sa
- **GitHub**: https://github.com/eclipseagency/nick.git
- **Deploy**: `npx vercel --prod` (GitHub integration is broken, always use Vercel CLI)

## Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.9, strict mode
- **UI**: React 19, Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Custom JWT (jose) with HTTP-only cookies, admin-only
- **Hosting**: Vercel
- **Analytics**: @vercel/analytics, @vercel/speed-insights
- **Images**: next/image with sharp, AVIF/WebP, device-responsive sizes

## Architecture

```
src/
  app/
    layout.tsx          # Root layout: fonts, metadata, JSON-LD, LanguageProvider
    page.tsx            # Homepage
    globals.css         # Tailwind v4 @theme (gold palette, font vars)
    booking/page.tsx    # Booking wizard page
    services/page.tsx   # Services listing
    gallery/page.tsx    # Photo gallery
    about/page.tsx      # Certifications page
    contact/page.tsx    # Contact info
    login/page.tsx      # Admin login
    admin/
      layout.tsx        # Auth-gated sidebar layout
      page.tsx          # Dashboard
      bookings/         # Manage bookings
      services/         # Manage services
      packages/         # Manage packages
      settings/         # Site settings
    api/
      auth/route.ts     # Login/logout/session check (GET/POST/DELETE)
      booking/route.ts  # Submit booking
      bookings/route.ts # List/manage bookings (admin)
      services/route.ts # CRUD services
      packages/route.ts # CRUD packages
      availability/route.ts  # Date availability
      upload/route.ts   # Image upload (Supabase storage)
      users/route.ts    # User management
    robots.ts           # Robots.txt generation
    sitemap.ts          # Sitemap generation
  components/
    Navbar.tsx          # Sticky nav with language toggle
    Hero.tsx            # 2-slide image slider with locale variants
    About.tsx           # Company history section
    Services.tsx        # Service cards (PPF, tint, ceramic, wrapping)
    Gallery.tsx         # Photo grid
    Booking.tsx         # Multi-step booking wizard (services + addons + form)
    BeforeAfter.tsx     # Before/after comparison
    WhyNick.tsx         # Value propositions
    Testimonials.tsx    # Customer reviews
    FAQ.tsx             # Accordion FAQ
    Contact.tsx         # Contact section
    Footer.tsx          # Site footer
    FloatingButtons.tsx # WhatsApp + scroll-to-top FABs
    CursorGlow.tsx      # Cursor glow effect
    Marquee.tsx         # Scrolling text marquee
    PageHero.tsx        # Reusable page hero banner
  hooks/
    useReveal.ts        # Intersection Observer reveal animations
    useCountUp.ts       # Animated number counter
  i18n/
    LanguageContext.tsx  # React Context provider (AR/EN), localStorage + URL param
    types.ts            # Dictionary type definition (298 keys)
    en.ts               # English translations
    ar.ts               # Arabic translations
  lib/
    supabase.ts         # Supabase clients (public + admin/service-role)
    auth.ts             # JWT sign/verify/session (jose, HS256, 7-day expiry)
public/
  images/               # Hero slides, service diagrams, car silhouettes, certs
    certs/              # 10 certification images
```

## Key Patterns

### i18n (Arabic/English)
- Client-side language switching via React Context (`useLanguage()`)
- Locale stored in `localStorage("nick-lang")` and synced to `?lang=ar` URL param
- Dictionary is a flat typed object (`Dictionary` in `types.ts`) -- add keys to both `en.ts` and `ar.ts`
- HTML `dir` attribute flips to `rtl` for Arabic; body font swaps to Tajawal
- Blocking inline script in `<head>` prevents flash of wrong language

### Styling
- Tailwind CSS 4 with `@theme inline` block in `globals.css`
- Brand colors: `--color-gold: #F6BE00`, `--color-gold-dark: #D4A300`, `--color-gold-light: #FFD54F`
- Fonts: Inter (body), Space Grotesk (display headings), Tajawal (Arabic)
- Dark theme: background `#050505`, text `#f5f5f5`
- Custom scrollbar (gold thumb on dark track)

### Admin Panel
- JWT auth via `lib/auth.ts` -- cookie `nick-admin-token`, 7-day expiry
- Admin layout checks auth on mount via `GET /api/auth`, redirects to `/login` if unauthorized
- Sidebar nav: Dashboard, Bookings, Services, Settings
- All admin API routes should verify session via `getSession()`

### Booking Flow
- 3-step wizard: Vehicle Size -> Services & Addons -> Contact Details
- Services organized by category: PPF, Tint, Ceramic
- Car size toggle (Small/Large) affects pricing
- Addons: ozone, rim ceramic, engine clean, tint removal, polish, steam wash
- Packages: predefined bundles with discount badges
- Submits to `/api/booking` then shows WhatsApp confirmation link

### Images
- Service diagrams use `{name}-small.png` / `{name}-large.png` naming (car size variants)
- Hero slides have locale + device variants: `hero-{name}.webp`, `hero-{name}-en.webp`, `hero-{name}-mobile.webp`
- WebP versions alongside PNG originals
- Certifications in `public/images/certs/cert-{1-10}.jpg`

### SEO
- JSON-LD structured data: AutoRepair business + WebSite schema
- Per-page breadcrumb JSON-LD
- Dynamic robots.ts and sitemap.ts
- OpenGraph + Twitter Card metadata

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (next/core-web-vitals + typescript)
npx vercel --prod    # Deploy to production (REQUIRED -- do NOT use git push)
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
ADMIN_JWT_SECRET=                # Secret for admin JWT signing (HS256)
```

## Conventions

- All pages are `"use client"` -- the site is fully client-rendered with SEO handled via metadata exports and JSON-LD
- Path alias `@/*` maps to `src/*`
- Component files are PascalCase, one component per file
- API routes use Next.js Route Handlers (`route.ts` with named exports)
- All user-facing text goes through the i18n dictionary -- never hardcode strings in components
- Images go in `public/images/` -- use `next/image` with explicit width/height
- Admin pages live under `src/app/admin/` and are protected by the admin layout auth check

## Gotchas

- **Deploy is Vercel CLI only**: `npx vercel --prod`. GitHub integration is broken. Never rely on git push to deploy.
- **metadataBase URL**: Currently set to `https://nick-fawn.vercel.app` in layout.tsx -- should be `https://nick.sa` for production SEO. Same in booking/page.tsx JSON-LD.
- **RLS is permissive**: Supabase RLS on `nick_` tables is permissive; auth is enforced at the API route level, not the database level.
- **No middleware auth**: Admin auth is checked client-side in the admin layout, not via Next.js middleware. API routes must independently verify the session.
- **Arabic font swap**: The body font-family is set via inline style in `LanguageContext.tsx`, not via CSS classes. This is intentional to avoid FOUC.
- **Service images**: Must provide both `-small.png` and `-large.png` variants for the car size toggle to work in the booking wizard.
- **Inline `<style>` in admin layout**: Mobile responsive styles for the admin sidebar use an inline `<style>` tag, not Tailwind utilities.
- **Env files gitignored**: All `.env*` files are in `.gitignore`. Use `.env.local` for local development.
