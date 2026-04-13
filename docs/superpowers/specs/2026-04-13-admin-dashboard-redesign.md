# Admin Dashboard Redesign - Design Spec

**Date**: 2026-04-13
**Scope**: Full Tailwind rewrite of all admin pages (login, layout, dashboard, bookings, services, settings) with proper responsive design across mobile/tablet/desktop.

## Goals

1. Convert all inline styles to Tailwind CSS
2. Proper 3-breakpoint responsive design (mobile < 640, tablet < 1024, desktop 1024+)
3. Better data presentation (table on desktop, cards on mobile)
4. Loading skeletons, empty states, consistent patterns
5. Keep dark + gold brand identity (#050505 bg, #F6BE00 gold)

## Pages

### 1. Admin Layout (`admin/layout.tsx`)

**Desktop (lg: 1024+)**: Fixed 260px sidebar with NICK logo, nav items (Dashboard, Bookings, Services, Settings), active gold indicator, user badge + logout at bottom.

**Tablet (sm: 640-1023)**: Icon-only sidebar (72px) by default. Nav items show icon only with tooltip on hover. Can expand to full width as overlay.

**Mobile (<640)**: No sidebar. Sticky top bar with hamburger button + "NICK Admin" title + logout. Hamburger opens full-screen slide-over nav with backdrop overlay.

Smooth CSS transitions between all states. Remove inline `<style>` tags entirely.

### 2. Login Page (`login/page.tsx`)

Centered card with Tailwind. NICK logo, username/password fields, show/hide password toggle, sign-in button. Focus states with gold ring. Error alert with red bg. Same visual identity, just clean Tailwind.

### 3. Dashboard (`admin/page.tsx`)

**Stats row**: 4 metric cards in a row. Each has: small icon, uppercase label, large value, optional subtitle (e.g. "SAR"). Grid: `grid-cols-2 lg:grid-cols-4`. Gap 3 on mobile, 4 on desktop.

**Revenue chart**: Bar chart section. Same 8-week data. Tailwind-styled bars with gold gradient. Axis labels below. Hover tooltip showing exact values.

**Calendar**: 7-column grid. Day cells min 44px height for touch targets. Status dots for bookings. Month navigation with prev/next + today button. Current day highlighted with gold ring. Selected day with gold fill.

**Date detail panel**:
- Desktop (min-width 900px): Appears as right column beside calendar (`grid-cols-[1fr_360px]`)
- Mobile: Appears below calendar as an inline section
- Shows booking cards for selected date with name, phone, status badge, total, call/WhatsApp actions

**Today's bookings**: Shows below calendar when no date is selected. Card list with status left-border, name, car info, total, status badge.

### 4. Bookings (`admin/bookings/page.tsx`)

**Header**: Page title + Export CSV button (ghost style).

**Filters bar**: Sticky below top bar on scroll. Status pills (All, Pending, Confirmed, In Progress, Completed, Cancelled) with counts. Search input. Date range (From/To) inputs. Clear dates button when active.

**Desktop (lg+)**: Data table layout.
- Table headers: Name/Phone, Car Size, Services, Total, Status, Date
- Sortable column headers (click to toggle asc/desc)
- Row hover highlight
- Click row to expand details below
- Expanded: grid of detail sections (Services, Package, Car Details, Addons, Pricing, Notes, Payment) + action buttons (Call, WhatsApp, Status dropdown, Delete)

**Tablet (sm-lg)**: Same table but hide less important columns (Car Size, Services count). Show on expand.

**Mobile (<640)**: Card-based list.
- Each card: customer name, phone, total, status badge, date
- Tap card to expand full details
- Actions stacked vertically in expanded view
- Status dropdown and delete button on their own row

### 5. Services (`admin/services/page.tsx`)

**Header**: Page title + "New Service" gold button.

**Category tabs**: Horizontal tab bar (All, PPF, Tint, Ceramic) with count badges. Search input beside tabs on desktop, below on mobile.

**Service grid**:
- Desktop: `grid-cols-3`
- Tablet: `grid-cols-2`
- Mobile: `grid-cols-1`

**Service card**: Thumbnail image (if exists), category badge, name EN, name AR (rtl), price small/large side by side, warranty text, popular/active toggles, "Edit" button.

**Edit mode**: Same card expands inline to show edit form (name EN/AR, prices, warranty, tier, before-prices, details EN/AR, image uploads, popular/active checkboxes, save/cancel buttons). Form fields use consistent Tailwind input styling.

**Create form**: Appears at top of grid area when creating. Same fields as edit. Gold border to distinguish.

### 6. Settings (`admin/settings/page.tsx`)

Full-width layout. Stacked card sections:

1. **Account**: Current user display, change password form (new pw + confirm + submit)
2. **Add User**: Username + password + submit
3. **Admin Users**: List of users with username, "You" badge for current, created date, delete button with confirm

All cards use consistent styling. Max-width 640px centered on desktop for readability.

## Shared Patterns

These are consistent Tailwind class patterns used across all pages (not extracted as separate component files):

**Inputs**: `bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition`

**Cards**: `bg-[#111] border border-white/[0.06] rounded-xl p-4`

**Status badges**: Pill shape with status-specific bg/text colors:
- pending: `bg-amber-500/10 text-amber-500`
- confirmed: `bg-blue-500/10 text-blue-500`
- in_progress: `bg-orange-500/10 text-orange-500`
- completed: `bg-green-500/10 text-green-500`
- cancelled: `bg-red-500/10 text-red-500`

**Primary button**: `bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-lg px-5 py-2.5 transition`

**Ghost button**: `border border-white/10 hover:border-amber-500/50 hover:text-amber-500 text-white/60 text-sm rounded-lg px-4 py-2 transition`

**Danger button**: `bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-sm rounded-lg px-4 py-2 transition`

**Loading skeletons**: `animate-pulse bg-white/[0.06] rounded-lg` blocks matching the shape of content they replace.

**Empty states**: Centered layout with muted icon (SVG), message text, and optional action button.

**Section labels**: `text-[10px] uppercase tracking-wide text-white/35`

## Breakpoints

- Default: mobile-first (< 640px)
- `sm:` 640px+ (tablet)
- `lg:` 1024px+ (desktop)
- `xl:` 1280px+ (wide desktop, used sparingly)

## What's NOT Changing

- Authentication logic (JWT, cookie, API routes)
- Data fetching patterns (useEffect + fetch)
- Business logic (status updates, CSV export, CRUD operations)
- API routes
- Database schema
- Component file structure (same files, same locations)

## Files to Modify

1. `src/app/admin/layout.tsx` - Full rewrite
2. `src/app/admin/page.tsx` - Full rewrite
3. `src/app/admin/bookings/page.tsx` - Full rewrite
4. `src/app/admin/services/page.tsx` - Full rewrite
5. `src/app/admin/settings/page.tsx` - Full rewrite
6. `src/app/login/page.tsx` - Full rewrite
