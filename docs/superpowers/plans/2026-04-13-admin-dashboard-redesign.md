# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all 6 admin pages (login + 4 admin pages + layout) from inline styles to Tailwind CSS with proper 3-breakpoint responsive design.

**Architecture:** Each page is a self-contained `"use client"` component. The rewrite replaces all inline `style={{}}` objects and embedded `<style>` tags with Tailwind utility classes. Business logic, data fetching, and API calls stay identical. The admin layout provides the sidebar/topbar shell; child pages render inside `<main>`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4 (via `@tailwindcss/postcss`). Theme colors: `--color-gold: #F6BE00` already in `globals.css`. Breakpoints: default (mobile), `sm:` (640px), `lg:` (1024px).

---

### File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/globals.css` | Modify (add admin keyframes) | Add sidebar transition + skeleton pulse keyframes |
| `src/app/login/page.tsx` | Rewrite | Login form with Tailwind |
| `src/app/admin/layout.tsx` | Rewrite | Responsive sidebar/topbar shell |
| `src/app/admin/page.tsx` | Rewrite | Dashboard: stats, chart, calendar, bookings |
| `src/app/admin/bookings/page.tsx` | Rewrite | Bookings list: table (desktop) / cards (mobile) |
| `src/app/admin/services/page.tsx` | Rewrite | Services CRUD with category tabs |
| `src/app/admin/settings/page.tsx` | Rewrite | Account settings, user management |

---

### Task 1: Add Admin CSS Utilities to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add admin-specific keyframes and utility classes to globals.css**

Append to the end of `globals.css`:

```css
/* Admin skeleton loader */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.admin-skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Admin sidebar transition */
.admin-slide-enter {
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.admin-slide-enter.open {
  transform: translateX(0);
}
```

- [ ] **Step 2: Verify dev server compiles**

Run: `cd C:/Users/acer/nick && npm run dev`

Open `http://localhost:3000` — confirm no build errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(admin): add skeleton and sidebar keyframes to globals.css"
```

---

### Task 2: Rewrite Login Page

**Files:**
- Rewrite: `src/app/login/page.tsx`

- [ ] **Step 1: Rewrite login/page.tsx with Tailwind**

Full rewrite. Keep all logic (useState, handleSubmit, fetch to /api/auth, router.push). Replace every `style={{}}` with Tailwind classes.

Key classes:
- Outer: `min-h-screen bg-[#050505] flex items-center justify-center p-5`
- Form card: `bg-[#111] border border-white/[0.06] rounded-2xl p-10 w-full max-w-[400px]`
- Title: `text-[28px] font-extrabold text-gold tracking-widest`
- Subtitle: `text-white/50 text-sm`
- Labels: `block text-xs text-white/50 mb-1.5 uppercase tracking-wider`
- Inputs: `w-full px-3.5 py-3 bg-[#050505] border border-white/10 rounded-xl text-white text-sm outline-none transition focus:border-gold/50 focus:ring-1 focus:ring-gold/20`
- Error alert: `bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5 mb-5 text-red-500 text-sm`
- Submit button: `w-full py-3.5 px-7 bg-gold hover:bg-gold-light text-black font-bold text-sm uppercase tracking-wider rounded-xl border-none cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed`
- Add a password visibility toggle button (eye icon SVG) inside the password field wrapper using `relative` positioning.

Remove `onFocus`/`onBlur` inline handlers — Tailwind `focus:` handles this.

- [ ] **Step 2: Test in browser**

Open `http://localhost:3000/login` — verify:
1. Centered card, dark bg, NICK branding
2. Input focus shows gold ring
3. Password show/hide toggle works
4. Error state shows red alert
5. Responsive: card stays centered and readable on mobile (squeeze to 320px width)

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat(admin): rewrite login page with Tailwind"
```

---

### Task 3: Rewrite Admin Layout

**Files:**
- Rewrite: `src/app/admin/layout.tsx`

- [ ] **Step 1: Rewrite admin/layout.tsx with Tailwind**

Full rewrite. Keep all logic (auth check, useEffect fetch to /api/auth, handleLogout, NAV_ITEMS, NavIcon component, isActive, sidebarOpen state).

Structure:

```
<div className="flex min-h-screen bg-[#050505]">
  {/* Mobile overlay backdrop */}
  {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={close} />}

  {/* Sidebar */}
  <aside className={`
    fixed top-0 left-0 bottom-0 z-50 flex flex-col
    bg-[#111] border-r border-white/[0.06]
    w-[260px] transition-transform duration-250 ease-out
    max-lg:-translate-x-full        /* hidden by default on mobile+tablet */
    ${sidebarOpen ? '!translate-x-0' : ''}
    lg:translate-x-0                 /* always visible on desktop */
  `}>
    {/* Logo section */}
    <div className="px-5 py-6 border-b border-white/[0.06]">
      <span className="text-[22px] font-extrabold text-gold tracking-widest">NICK</span>
      <span className="text-[11px] text-white/40 ml-2 uppercase tracking-wider">Admin</span>
    </div>

    {/* Nav */}
    <nav className="flex-1 p-3 space-y-1">
      {NAV_ITEMS.map → <a> with:}
      active: "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gold bg-gold/[0.08]"
      inactive: "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition"
    </nav>

    {/* Logout */}
    <div className="p-3 border-t border-white/[0.06]">
      <button className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.03] transition">
        logout icon + "Logout"
      </button>
    </div>
  </aside>

  {/* Main area */}
  <div className="flex-1 lg:ml-[260px] min-w-0">
    {/* Mobile/tablet top bar */}
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/[0.06] lg:hidden">
      <button hamburger />
      <span className="font-bold text-gold tracking-wider">NICK Admin</span>
      <button logout text />
    </div>

    <main className="p-4 sm:p-6">{children}</main>
  </div>
</div>
```

Remove the entire `<style>{``}` block at the bottom. No inline styles remain.

Loading state: Replace the plain "Loading..." div with a skeleton:
```
<div className="min-h-screen bg-[#050505] flex items-center justify-center">
  <div className="flex flex-col items-center gap-3">
    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    <span className="text-white/40 text-sm">Loading...</span>
  </div>
</div>
```

- [ ] **Step 2: Test in browser at all 3 breakpoints**

Open `http://localhost:3000/admin`:
1. Desktop (1200px): sidebar visible, content shifted right 260px
2. Tablet (800px): no sidebar, top bar with hamburger, tap hamburger opens sidebar overlay
3. Mobile (375px): same as tablet but tighter padding
4. Sidebar close: tap backdrop or nav link closes sidebar
5. Active nav item highlighted gold
6. Loading spinner shows while auth checking

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat(admin): rewrite layout with Tailwind responsive sidebar"
```

---

### Task 4: Rewrite Dashboard

**Files:**
- Rewrite: `src/app/admin/page.tsx`

- [ ] **Step 1: Rewrite admin/page.tsx with Tailwind**

Full rewrite. Keep ALL business logic (useState, useEffect, useMemo for bookingsByDate, calendarDays, weeklyRevenue, todayBookings, selectedBookings, prevMonth/nextMonth/goToday, STATUS_COLORS, MONTHS, DAYS). Only replace presentation.

**Loading skeleton:**
```
<div className="space-y-5">
  <div className="admin-skeleton h-7 w-32 rounded-lg" />
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
    {[1,2,3,4].map(i => <div key={i} className="admin-skeleton h-24 rounded-xl" />)}
  </div>
  <div className="admin-skeleton h-40 rounded-xl" />
  <div className="admin-skeleton h-80 rounded-xl" />
</div>
```

**Stats row:**
```
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
  {stats.map → 
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">{label}</div>
      <div className="text-[28px] font-extrabold text-white leading-none">{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  }
</div>
```

**Revenue chart:**
```
<div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 mb-5">
  <h2 className="text-sm font-semibold text-white mb-4">Weekly Revenue</h2>
  <div className="flex items-end gap-1.5 h-[120px]">
    {weeklyRevenue.map → bar divs with Tailwind}
  </div>
</div>
```

**Calendar:**
```
<div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_360px] gap-3">
  {/* Calendar card */}
  <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
    {/* Month nav */}
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        <button className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:text-white transition">prev</button>
        <h2 className="text-[15px] font-bold text-white min-w-[150px] text-center sm:text-base">{month year}</h2>
        <button>next</button>
      </div>
      <button className="px-3 py-1.5 border border-gold/30 rounded-lg text-[11px] text-gold hover:bg-gold/5 transition">Today</button>
    </div>

    {/* Day headers */}
    <div className="grid grid-cols-7 gap-0.5 mb-0.5">
      {DAYS.map → <div className="text-center text-[10px] text-white/30 py-1 font-semibold">}
    </div>

    {/* Day cells */}
    <div className="grid grid-cols-7 gap-0.5">
      {calendarDays.map → <button className={`
        flex flex-col items-center justify-center gap-0.5 
        py-1.5 px-0.5 rounded-lg text-[13px] sm:text-sm
        min-h-[42px] sm:min-h-[44px] cursor-pointer transition
        ${conditional classes for selected/today/inactive}
      `}>}
    </div>

    {/* Legend */}
    <div className="flex flex-wrap gap-2.5 mt-3 pt-2.5 border-t border-white/[0.06]">
      {Object.entries(STATUS_COLORS).map → dot + label}
    </div>
  </div>

  {/* Side panel (when selectedBookings) */}
  {selectedBookings && (
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 max-h-[60vh] min-[900px]:max-h-[calc(100vh-280px)] overflow-y-auto">
      ...booking cards with Tailwind...
    </div>
  )}
</div>
```

**Today's bookings section:** Same structure, Tailwind classes.

Remove the entire `<style>{``}` block. No inline styles.

- [ ] **Step 2: Test in browser at all breakpoints**

Open `http://localhost:3000/admin`:
1. Skeleton shows briefly while loading
2. Stats: 2x2 on mobile, 4x1 on desktop
3. Revenue chart renders with gold bars
4. Calendar: 7-col grid, touch-friendly cells, click a day shows side panel
5. Side panel: beside calendar on 900px+, below on mobile
6. Today's bookings show when no date selected
7. Call/WhatsApp buttons work

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): rewrite dashboard with Tailwind responsive design"
```

---

### Task 5: Rewrite Bookings Page

**Files:**
- Rewrite: `src/app/admin/bookings/page.tsx`

- [ ] **Step 1: Rewrite admin/bookings/page.tsx with Tailwind**

Full rewrite. Keep ALL business logic (useState, useCallback, useEffect, fetchBookings, deleteBooking, updateStatus, getServiceName, getPackageName, filtered computation, exportCSV, formatDate, ADDON_NAMES, SERVICE_NAMES, interfaces, STATUS_COLORS, STATUSES).

**Loading skeleton:**
```
<div className="space-y-5">
  <div className="admin-skeleton h-8 w-40 rounded-lg" />
  <div className="flex flex-wrap gap-2">
    {[1,2,3,4,5,6].map(i => <div key={i} className="admin-skeleton h-9 w-24 rounded-full" />)}
  </div>
  {[1,2,3,4].map(i => <div key={i} className="admin-skeleton h-20 rounded-xl" />)}
</div>
```

**Header:**
```
<div className="flex justify-between items-center mb-6 flex-wrap gap-3">
  <h1 className="text-2xl font-bold text-white">Bookings</h1>
  <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 border border-white/15 rounded-lg text-white/70 text-sm hover:border-gold hover:text-gold transition">
    download icon + Export CSV
  </button>
</div>
```

**Status filters:**
```
<div className="flex flex-wrap gap-2 mb-5">
  {STATUSES.map → 
    <button className={`px-4 py-1.5 rounded-full border text-sm transition capitalize
      ${active ? 'border-gold bg-gold/10 text-gold font-semibold' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
      {status} ({count})
    </button>
  }
</div>
```

**Search + date filters:**
```
<div className="flex flex-wrap gap-2.5 mb-5 items-center">
  <input className="w-full max-w-[280px] px-3.5 py-2.5 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 outline-none focus:border-gold/50 transition" />
  <div className="flex items-center gap-1.5">
    <label className="text-xs text-white/40 whitespace-nowrap">From</label>
    <input type="date" className="px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none [color-scheme:dark]" />
  </div>
  <div className="flex items-center gap-1.5">
    <label className="text-xs text-white/40 whitespace-nowrap">To</label>
    <input type="date" ... />
  </div>
  {(dateFrom || dateTo) && <button className="px-3 py-2 border border-white/10 rounded-lg text-white/40 text-xs hover:text-white/60 transition">Clear dates</button>}
</div>
```

**Empty state:**
```
<div className="bg-[#111] rounded-xl py-16 text-center">
  <svg ... calendar icon ... className="w-10 h-10 mx-auto text-white/15 mb-3" />
  <p className="text-white/30 text-sm">No bookings found</p>
</div>
```

**Desktop booking rows (lg+):**
```
<div className="hidden lg:block">
  {/* Table header */}
  <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-white/30">
    <span>Customer</span><span>Car</span><span>Services</span><span>Total</span><span>Status</span><span>Date</span>
  </div>
  {/* Rows */}
  {filtered.map → 
    <div className="bg-[#111] border border-white/[0.06] rounded-xl mb-2 overflow-hidden">
      <div onClick={toggle} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition">
        ...columns...
      </div>
      {expanded && <div className="px-4 pb-4 border-t border-white/[0.06]">...details grid...</div>}
    </div>
  }
</div>
```

**Mobile booking cards (<lg):**
```
<div className="lg:hidden space-y-2">
  {filtered.map →
    <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
      <div onClick={toggle} className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-white/[0.02]">
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-xs text-white/40 mt-0.5">{phone} · {total} SAR</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusBadgeClasses}>{status}</span>
        </div>
      </div>
      {expanded && <div className="px-4 pb-4 border-t border-white/[0.06] space-y-4 pt-4">
        ...detail sections stacked vertically...
        ...actions stacked: call/wa row, then status dropdown row, then delete...
      </div>}
    </div>
  }
</div>
```

**Expanded details (shared between desktop and mobile):**
```
<div className="grid grid-cols-1 sm:grid-cols-2 min-[900px]:grid-cols-3 gap-4 pt-4">
  {/* Services */}
  <div>
    <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Services</div>
    <div className="flex flex-wrap gap-1.5">
      {service_ids.map → <span className="px-2.5 py-1 bg-white/5 rounded-md text-xs text-white/70">}
    </div>
  </div>
  {/* Package, Car Details, Addons, Pricing, Notes, Payment — same pattern */}
</div>

{/* Actions bar */}
<div className="flex items-center gap-3 flex-wrap mt-4 pt-4 border-t border-white/[0.06]">
  <a href={tel} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-medium">Call</a>
  <a href={wa} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm font-medium">WhatsApp</a>
  <div className="flex-1" />
  <label className="text-xs text-white/40">Status:</label>
  <select className="px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none cursor-pointer">
  <button delete className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/[0.08] border border-red-500/20 rounded-lg text-red-500 text-xs font-medium hover:bg-red-500/15 transition">
</div>
```

Remove the `<style>{``}` block. No inline styles.

- [ ] **Step 2: Test in browser at all breakpoints**

Open `http://localhost:3000/admin/bookings`:
1. Loading skeleton shows briefly
2. Status filter pills with counts, active state gold
3. Search filters bookings by name/phone
4. Date range filters work, clear button appears
5. Desktop: table-like rows with hover, click expands details
6. Mobile: card list, tap expands, actions stacked
7. Status dropdown updates booking
8. Delete with confirm works
9. CSV export downloads file
10. Empty state shows when no results

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/bookings/page.tsx
git commit -m "feat(admin): rewrite bookings page with Tailwind responsive table/cards"
```

---

### Task 6: Rewrite Services Page

**Files:**
- Rewrite: `src/app/admin/services/page.tsx`

- [ ] **Step 1: Rewrite admin/services/page.tsx with Tailwind**

Full rewrite. Keep ALL business logic (useState, useEffect, useRef, startEdit, cancelEdit, saveEdit, startCreate, cancelCreate, saveCreate, toggleField, ImageUpload sub-component, CATEGORY_COLORS, Service interface).

**Add category filter state** (new feature from spec):
```tsx
const [categoryFilter, setCategoryFilter] = useState<string>("all");
const [searchQuery, setSearchQuery] = useState("");

const filteredServices = services.filter(s => {
  if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    if (!s.name_en.toLowerCase().includes(q) && !s.name_ar.includes(q)) return false;
  }
  return true;
});
```

**Category tab counts:**
```tsx
const categoryCounts = {
  all: services.length,
  ppf: services.filter(s => s.category === "ppf").length,
  tint: services.filter(s => s.category === "tint").length,
  ceramic: services.filter(s => s.category === "ceramic").length,
};
```

**Header + filters:**
```
<div className="flex items-center justify-between mb-6 flex-wrap gap-3">
  <h1 className="text-2xl font-bold text-white">Services</h1>
  <div className="flex items-center gap-3">
    {saveMsg && <span className="text-sm text-green-500">{saveMsg}</span>}
    {!creating && <button onClick={startCreate} className="px-5 py-2 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition">+ New Service</button>}
  </div>
</div>

{/* Category tabs + search */}
<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
  <div className="flex gap-2">
    {["all", "ppf", "tint", "ceramic"].map(cat =>
      <button className={`px-4 py-1.5 rounded-full border text-sm transition capitalize
        ${categoryFilter === cat ? 'border-gold bg-gold/10 text-gold font-semibold' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
        {cat} ({categoryCounts[cat]})
      </button>
    )}
  </div>
  <input placeholder="Search services..." className="w-full sm:w-auto sm:max-w-[240px] px-3.5 py-2 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 outline-none focus:border-gold/50 transition" />
</div>
```

**Create form:**
```
{creating && (
  <div className="bg-[#111] border border-gold/30 rounded-xl p-5 mb-4">
    <div className="text-base font-bold text-gold mb-4">New Service</div>
    <div className="grid gap-3">
      ...form fields with Tailwind input classes...
    </div>
  </div>
)}
```

**Service grid:**
```
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
  {filteredServices.map(s => {
    const isEditing = editingId === s.id;
    return (
      <div className={`bg-[#111] border rounded-xl overflow-hidden ${s.active ? 'border-white/[0.06]' : 'border-red-500/20 opacity-60'}`}>
        {/* Thumbnail */}
        {s.image && <div className="h-[120px] bg-cover bg-center border-b border-white/[0.06]" style={{backgroundImage: `url(${s.image})`}} />}

        <div className="p-4">
          {!isEditing ? (
            /* View mode */
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${categoryBadgeClass(s.category)}`}>{s.category}</span>
                {!s.active && <span className="text-[10px] text-red-500 font-semibold">INACTIVE</span>}
              </div>
              <div className="text-[15px] font-semibold text-white mb-0.5">{s.name_en}</div>
              <div className="text-sm text-white/40 mb-2.5" dir="rtl">{s.name_ar}</div>
              <div className="flex gap-4 mb-2">
                <div>
                  <div className="text-[10px] text-white/30 uppercase">Small</div>
                  <div className="text-sm font-semibold text-white">{price_small} SAR</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase">Large</div>
                  <div className="text-sm font-semibold text-white">{price_large} SAR</div>
                </div>
              </div>
              {s.warranty && <div className="text-xs text-white/40 mb-2.5">Warranty: {s.warranty}</div>}
              <div className="flex gap-3 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                  <input type="checkbox" className="accent-gold" ... /> Popular
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                  <input type="checkbox" className="accent-green-500" ... /> Active
                </label>
              </div>
              <button onClick={startEdit} className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-xs font-semibold hover:bg-gold/20 transition">Edit Details</button>
            </>
          ) : (
            /* Edit mode — same form fields as create, with save/cancel */
          )}
        </div>
      </div>
    );
  })}
</div>
```

**ImageUpload sub-component:** Replace inline styles with Tailwind. Label: `text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block`. Preview: `w-full h-20 rounded-lg mb-2 bg-cover bg-center border border-white/[0.08]`. Upload button: `px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-md text-gold text-[11px] font-semibold hover:bg-gold/20 transition disabled:opacity-50 disabled:cursor-not-allowed`.

Remove all `inputStyle` / `labelStyle` objects. No inline styles.

- [ ] **Step 2: Test in browser at all breakpoints**

Open `http://localhost:3000/admin/services`:
1. Category tabs filter correctly with counts
2. Search filters by name
3. Grid: 1 col mobile, 2 col tablet, 3 col desktop
4. Service cards show thumbnail, category badge, pricing, toggles
5. Edit mode expands card with form
6. Create form appears at top with gold border
7. Image upload works
8. Popular/Active toggles save immediately
9. Inactive services show red border and dimmed

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/services/page.tsx
git commit -m "feat(admin): rewrite services page with Tailwind, add category filters"
```

---

### Task 7: Rewrite Settings Page

**Files:**
- Rewrite: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: Rewrite admin/settings/page.tsx with Tailwind**

Full rewrite. Keep ALL business logic (useState, useEffect, handleChangePassword, handleAddUser, handleDeleteUser, User interface, deleteConfirm state).

```
<div>
  <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

  <div className="grid gap-5 max-w-[640px] mx-auto lg:mx-0">
    {/* Change Password */}
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-base font-semibold text-white mb-1">Change Password</h2>
      <p className="text-sm text-white/40 mb-5">
        Logged in as <span className="text-gold">{currentUser}</span>
      </p>
      <div className="grid gap-3.5">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">New Password</label>
          <input type="password" className="w-full px-3 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition" />
        </div>
        <div>
          <label ...>Confirm New Password</label>
          <input type="password" ... />
        </div>
        {pwMsg && (
          <div className={`text-sm px-3 py-2 rounded-lg ${pwError ? 'text-red-500 bg-red-500/[0.08]' : 'text-green-500 bg-green-500/[0.08]'}`}>
            {pwMsg}
          </div>
        )}
        <button onClick={handleChangePassword} disabled={pwSaving}
          className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
          {pwSaving ? "Saving..." : "Change Password"}
        </button>
      </div>
    </div>

    {/* Add New User */}
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-base font-semibold text-white mb-4">Add New User</h2>
      <div className="grid gap-3.5">
        <div>
          <label ...>Username</label>
          <input ... />
        </div>
        <div>
          <label ...>Password</label>
          <input type="password" ... />
        </div>
        {userMsg && <div className={...}>{userMsg}</div>}
        <button ...>Add User</button>
      </div>
    </div>

    {/* Admin Users */}
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-base font-semibold text-white mb-4">Admin Users</h2>
      {users.length === 0 ? (
        <p className="text-sm text-white/40">No users found</p>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div>
                <span className="text-sm text-white font-medium">{u.username}</span>
                {u.username === currentUser && <span className="ml-2 text-[10px] text-gold font-semibold uppercase">You</span>}
                <div className="text-[11px] text-white/30 mt-0.5">Created {date}</div>
              </div>
              {u.username !== currentUser && (
                deleteConfirm === u.username ? (
                  <div className="flex gap-1.5">
                    <button className="px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-md text-red-500 text-[11px] font-semibold">Confirm</button>
                    <button className="px-3 py-1 border border-white/10 rounded-md text-white/40 text-[11px]">Cancel</button>
                  </div>
                ) : (
                  <button className="px-3 py-1 border border-white/[0.08] rounded-md text-white/30 text-[11px] hover:text-white/50 transition">Delete</button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

Remove `inputStyle`, `labelStyle`, `cardStyle` objects. No inline styles.

- [ ] **Step 2: Test in browser**

Open `http://localhost:3000/admin/settings`:
1. Three card sections stacked, max-width 640px
2. Change password form works with validation messages
3. Add user form works
4. Users list shows with "You" badge, delete confirm flow
5. Responsive: cards fill width on mobile, centered on desktop

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat(admin): rewrite settings page with Tailwind"
```

---

### Task 8: Final Verification & Deploy

- [ ] **Step 1: Run build to check for TypeScript/compilation errors**

```bash
cd C:/Users/acer/nick && npm run build
```

Fix any errors. All 6 files should compile cleanly.

- [ ] **Step 2: Full responsive test**

Test all pages at 3 widths (375px, 768px, 1280px):
- `/login` — centered card, readable on all sizes
- `/admin` — sidebar behavior correct per breakpoint
- `/admin` — dashboard stats/calendar/chart respond
- `/admin/bookings` — table on desktop, cards on mobile
- `/admin/services` — grid columns adjust, filters work
- `/admin/settings` — cards stack, max-width applies

- [ ] **Step 3: Deploy to production**

```bash
cd C:/Users/acer/nick && npx vercel --prod
```

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(admin): polish responsive issues from final review"
```
