# Verse — Complete Project Audit

> Full analysis of incomplete, missing, unimplemented, stub, and pending features across the entire Verse poetry platform.

---

## Executive Summary

Verse has recently undergone a major architectural migration from a **static, client-side SPA** to a **modern full-stack Next.js 16 (App Router)** application.

### Major Achievements:
- ✅ **Full-Stack Architecture:** Migrated to React Server Components.
- ✅ **Authentication:** Auth.js v5 (NextAuth) integrated with credentials provider (bcrypt).
- ✅ **Database:** Prisma 7 with `better-sqlite3` driver implemented.
- ✅ **Testing Suite:** Jest, RTL, and Playwright integrated and passing.

Despite these massive improvements, the application still has a substantial backlog of features (like content creation, database migration for poems, and social features) that need to be built.

---

## 1. 🔗 Dead Navigation Links & Missing Pages

The navbar renders top-level links which have been partially addressed:

| Link | Route | Status |
|------|-------|--------|
| **Discover** | `/` | ✅ Working — renders home feed |
| **Collections** | `/collections` | ⚠️ **Stub Page** — Route exists but lacks actual collection features. |
| **Authors** | `/authors` | ⚠️ **Stub Page** — Route exists but lacks browse functionality. |

### Tasks:
- [ ] Build `/collections` data fetching and listing
- [ ] Build `/authors` browse/listing functionality with pagination

---

## 2. 🔐 Authentication — ✅ Implemented

Authentication has been fully implemented using **Auth.js v5** and **Prisma**.

### Features implemented:
- ✅ Dedicated `/login` and `/signup` pages
- ✅ Secure credential hashing using `bcryptjs`
- ✅ Session management via JWT
- ✅ Navbar dynamically displays user name when logged in

### Tasks:
- [ ] Add "Forgot password" flow
- [ ] Add OAuth/social login options (Google, GitHub, etc.)
- [ ] Add logout functionality to Navbar dropdown

---

## 3. 🗄️ Data Layer — ⚠️ Partially Migrated

While the database infrastructure (Prisma + SQLite) is active for **Users/Auth**, the actual poetry content is still **hardcoded in** `lib/data.js`.

### Tasks:
- [ ] Migrate poems from `lib/data.js` to Prisma SQLite schema
- [ ] Migrate authors from `lib/data.js` to Prisma SQLite schema
- [ ] Replace hardcoded data with Server Component DB fetch calls
- [ ] Implement pagination or infinite scroll for the feed
- [ ] Add loading states / skeleton screens with React Suspense

---

## 4. ✍️ Content Creation — ❌ Entirely Missing

Users have **no way to create content**. There is no poem editor, no form, no submission flow.

### Tasks:
- [ ] Build poem creation/editor page (`/create` or `/write`)
- [ ] Add "Write" or "Create" CTA button to navbar
- [ ] Build a rich poem editor with title, body (multiline), tags selection
- [ ] Add draft saving (autosave to DB)
- [ ] Add poem editing for own poems
- [ ] Add poem deletion with confirmation
- [ ] Build author profile editing (bio, location, avatar)

---

## 5. 📚 Collections Feature — ❌ Completely Missing

"Collections" route `/collections` exists but **no code/logic exists** for this feature.

### Tasks:
- [ ] Design collections Prisma schema (name, description, poem IDs, author, visibility)
- [ ] Build create collection flow
- [ ] Build collection detail page (listing poems in a collection)
- [ ] Add "Save to collection" action on poem cards and poem detail page
- [ ] Support public/private collections

---

## 6. 🔍 Search — ❌ Completely Missing

There is **no search functionality anywhere** in the application.

### Tasks:
- [ ] Add search input to navbar (desktop + mobile)
- [ ] Build search results page (`/search?q=...`)
- [ ] Implement server-side search across poem titles, text, author names, and tags
- [ ] Add search suggestions / autocomplete

---

## 7. 🖥️ Backend — ⚠️ Infrastructure Built, APIs Pending

> [!TIP]
> The backend infrastructure is now robustly built on **Next.js Server Actions, Route Handlers, and Prisma 7**.

### Backend Services Needed:

#### 7.1 Content API (Server Actions)
- [ ] Poems CRUD (create, read, update, delete)
- [ ] Author profiles CRUD
- [ ] Collections CRUD
- [ ] Tags management

#### 7.2 Social Features API
- [ ] Like/unlike poems (persist to database)
- [ ] Follow/unfollow authors (persist to database)
- [ ] Comments on poems

#### 7.3 File Storage
- [ ] Image upload service (avatars, exported poem images)
- [ ] Cloud storage integration (S3, GCS, Cloudinary)

---

## 8. 🤝 Social Features — ⚠️ Stub / Incomplete

### 8.1 Likes & Follows
- **Current**: Client-only state memory.
- [ ] Persist likes and follows to backend Prisma DB
- [ ] Show who liked a poem (likers list)
- [ ] Add "Following" feed filter

### 8.2 Sharing
- **Current**: ✅ Copy link uses custom Toast UI. ✅ Export generates Canvas.
- [ ] Implement Web Share API for native sharing on mobile
- [ ] Add Twitter/X and Facebook share integration
- [ ] Add embed code generation for poems

### 8.3 Comments & Notifications
- [ ] Build comment system UI on poem detail page
- [ ] Build notification center in navbar

---

## 9. ♿ Accessibility Issues

### Tasks:
- [ ] Use semantic elements or proper ARIA roles on clickable cards
- [ ] Add `role="alert"` and `aria-live="polite"` to toast UI
- [ ] Add ARIA landmarks (`role="main"`, `role="navigation"`, etc.)
- [ ] Add keyboard support for template card selection
- [ ] Test with screen readers

---

## 10. 🔎 SEO & Meta Tags — ⚠️ Partially Addressed

### Current state:
- ✅ With Next.js Server Components, the app is now fully crawlable and SSR-ready!
- ❌ Missing dynamic Next.js Metadata API implementations.

### Tasks:
- [ ] Add dynamic `generateMetadata` for Poem and Author pages (Open Graph, Twitter Cards)
- [ ] Add structured data (JSON-LD) for poems and authors
- [ ] Generate sitemap.xml and robots.txt

---

## 11. 📱 PWA & Offline Support — ❌ Missing

- [ ] Create `manifest.json` (app name, icons, display mode, colors)
- [ ] Generate PWA icons
- [ ] Implement service worker for offline caching

---

## 12. 🐛 Code Quality & Technical Debt — ✅ Greatly Improved

### Completed:
- ✅ Replaced vanilla JS with Next.js App Router (React).
- ✅ Replaced raw CSS hacks with Tailwind CSS via PostCSS.
- ✅ ESLint + Next config added.
- ✅ Full Testing Suite: Jest, RTL (Unit Tests), and Playwright (E2E).

### Tasks:
- [ ] Migrate inline styles remaining in React Components to Tailwind classes.
- [ ] Implement React Suspense Error Boundaries for invalid DB routes/IDs.
- [ ] Implement canvas auto-sizing for long poems in export.

---

## 13. 📊 Analytics & Monitoring — ❌ Missing

- [ ] Add analytics integration (Google Analytics, Plausible)
- [ ] Add error tracking (Sentry)
- [ ] Add Web Vitals reporting

---

## 14. 🚀 Deployment & DevOps — ❌ Missing

- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure production deployment (Vercel, Netlify)
- [ ] Add environment variable management for production
- [ ] Configure custom domain and SSL

---

## Summary Matrix

| Category | Status |
|----------|--------|
| Dead Nav Links / Missing Pages | ⚠️ Stubbed |
| Authentication | ✅ Implemented |
| Data Layer | ⚠️ Partially Migrated (Auth Only) |
| Content Creation | ❌ Not started |
| Collections Feature | ❌ Not started |
| Search | ❌ Not started |
| Backend Services | ⚠️ Infrastructure Built |
| Social Features | ⚠️ Stub only |
| Accessibility | ⚠️ Partial |
| SEO & Meta | ⚠️ SSR Implemented, Meta pending |
| PWA & Offline | ❌ Not started |
| Code Quality | ✅ Complete |
| Analytics | ❌ Not started |
| Deployment | ❌ Not started |

---

## Recommended Priority Order

1. **Migrate Content Data Layer** — Move poems and authors to Prisma schema.
2. **Build Content Creation** — Implement Poem Editor.
3. **Persist Social Features** — Store likes/follows to the database.
4. **Implement User Profiles** — Enable editing of author profiles.
5. **Search** — Core discoverability feature.
