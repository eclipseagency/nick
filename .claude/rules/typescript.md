# TypeScript & Next.js Rules for NICK

## Stack
- Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS 4, Supabase

## Deployment (CRITICAL)
- Deploy via `npx vercel --prod` ONLY
- GitHub integration is BROKEN — do NOT push expecting auto-deploy
- Always test locally with `npm run dev` before deploying

## Supabase
- Use Supabase client for all database operations
- RLS (Row Level Security) policies must be in place
- Never expose service_role key to client-side code

## Components
- Server components by default
- Booking flow is a continuous scroll (not multi-page wizard)
- 20 services + 7 addons in the booking system

## Styling
- Tailwind CSS v4 (new syntax)
- Mobile-first responsive design
- Dark theme with automotive aesthetic
