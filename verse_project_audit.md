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
- ✅ **Export System:** Canvas-based image export system implemented.

Despite these massive improvements, the application still has a substantial backlog of features (like content creation, database migration for poems, and social features) that need to be built.

---

## 1. 🔗 Dead Navigation Links & Missing Pages

The navbar renders top-level links which have been partially addressed:

| Link | Route | Status |
|------|-------|--------|
| **Discover** | `/` | ✅ Working — renders home feed |
| **Collections** | `/collections` | ⚠️ **Stub Page** — Route exists but lacks actual collection features. |
| **Authors** | `/authors` | ✅ ~~⚠️ **Stub Page** — Route exists but lacks browse functionality.~~ Working — renders author profiles. |

### Tasks:
- [ ] Build `/collections` data fetching and listing
- [x] ~~Build `/authors` browse/listing functionality with pagination~~ (Implemented)

---

## 2. 🔐 Authentication — ✅ Implemented

Authentication has been fully implemented using **Auth.js v5** and **Prisma**.

### Features implemented:
- ✅ Dedicated `/login` and `/signup` pages
- ✅ Secure credential hashing using `bcryptjs`
- ✅ Session management via JWT
- ✅ Navbar dynamically displays user name when logged in

### Tasks:
- [x] ~~Add "Forgot password" flow~~ (Implemented)
- [x] ~~Add OAuth/social login options (Google, GitHub, etc.)~~ (Implemented)
- [x] ~~Add logout functionality to Navbar dropdown~~ (Implemented via Navbar button)
- [x] ~~**Admin & Moderation:** Robust and complete Admin and Moderator features and Accounts Management~~ (Done)

---

## 3. 🗄️ Data Layer — ✅ Fully Migrated

The database infrastructure (Prisma + SQLite) is now active for both **Users/Auth** and **Poetry Content**.

### Tasks:
- [x] ~~Migrate poems from `lib/data.js` to Prisma SQLite schema~~
- [x] ~~Migrate authors from `lib/data.js` to Prisma SQLite schema~~
- [x] ~~Replace hardcoded data with Server Component DB fetch calls~~
- [ ] Implement pagination or infinite scroll for the feed
- [x] Add loading states / skeleton screens with React Suspense

---

## 4. ✍️ Content Creation — ❌ Entirely Missing

Users have **no way to create content**. There is no poem editor, no form, no submission flow.

### Tasks:
- [ ] Build poem creation/editor page (`/create` or `/write`)
- [ ] Add "Write" or "Create" CTA button to navbar
- [x] Build a rich poem editor with title, body (multiline), tags selection
- [x] Add draft saving (autosave to DB)
- [x] Add poem editing for own poems
- [x] Add poem deletion with confirmation
- [x] Build author profile editing (bio, location, avatar)

---

## 5. 📚 Collections Feature — ✅ Implemented

### 3. Collections Feature (Done)
- **Status:** Done.
- **Goal:** Allow users to curate poems into public or private collections.
- **Implemented:**
  - `Collection` Prisma schema and push to database.
  - Server actions for creating collections and adding/removing poems.
  - UI for viewing public collections (`/collections`).
  - Detail page for viewing a collection (`/collections/[id]`).
  - Added "Save to Collection" button on poem pages (`PoemPageClient.jsx`).
  - E2E tests for collection creation and curation.

---

## 6. 🔍 Search — ✅ Implemented

### 4. Search (Done)
- **Status:** Done.
- **Goal:** Core discoverability feature for finding poems, authors, and tags.
- **Implemented:**
  - Added search input to navbar (desktop + mobile drawer).
  - Built search results page (`/search?q=...`).
  - Implemented server-side search across poem titles, text, tags, and author names using Prisma `OR` filtering.
  - E2E tests for search functionality.

---

## 7. 🖥️ Backend — ⚠️ Infrastructure Built, APIs Pending

> [!TIP]
> The backend infrastructure is now robustly built on **Next.js Server Actions, Route Handlers, and Prisma 7**.

### Backend Services Needed:

#### 7.1 Content API (Server Actions)
- [x] ~~Poems CRUD (create, read, update, delete)~~ (Create and Read done)
- [x] ~~Author profiles CRUD (Edit profile)~~ (Done)
- [x] ~~Collections CRUD~~ (Done)
- [x] ~~Tags management~~ (Done)

#### 7.2 Social Features API
- [x] ~~Like/unlike poems (persist to database)~~ (Done)
- [x] ~~Follow/unfollow authors (persist to database)~~ (Done)
- [x] ~~Comments on poems~~ (Implemented)

#### 7.3 File Storage
- [x] Image upload service (avatars, exported poem images) - Implemented via local fs/promises
- [ ] Cloud storage integration (S3, GCS, Cloudinary) — scaffold ready, needs provider keys

---

## 8. 🤝 Social Features — ⚠️ Stub / Incomplete

### 8.1 Moderation & Reporting
- **Current**: ✅ Reporting infrastructure, Admin UI, and Role/Status management are complete.
- [x] ~~Implement reporting system (Report a poem, user, or comment)~~
- [x] ~~Implement Admin Dashboard (Reports Queue & User Management)~~

### 8.2 Likes & Follows
- **Current**: ✅ Persisted to backend Prisma DB via Next.js Server Actions.
- [x] ~~Persist likes and follows to backend Prisma DB~~
- [x] ~~Show who liked a poem (likers list)~~ (Implemented)
- [x] ~~Add "Following" feed filter~~ (Implemented)

### 8.2 Sharing
- **Current**: ✅ Web Share API implemented (native sheet on mobile, clipboard fallback on desktop). ✅ Export generates Canvas. ✅ Embed code modal added.
- [x] Implement Web Share API for native sharing on mobile
- [ ] Add Twitter/X and Facebook share integration
- [x] Add embed code generation for poems

### 8.3 Comments & Notifications
- [x] Build comment system UI on poem detail page
- [x] Build notification center in navbar

---

## 9. ♿ Accessibility Issues

### Tasks:
- [x] Use semantic elements or proper ARIA roles on clickable cards
- [x] Add `role="alert"` and `aria-live="polite"` to toast UI
- [x] Add ARIA landmarks (`role="main"`, `role="navigation"`, etc.)
- [x] Add keyboard support for template card selection
- [x] Test with screen readers

---

## 10. 🔎 SEO & Meta Tags — ⚠️ Partially Addressed

### Current state:
- ✅ With Next.js Server Components, the app is now fully crawlable and SSR-ready!
- ❌ Missing dynamic Next.js Metadata API implementations.

### Tasks:
- [x] ~~Configure standard static metadata (favicons, manifest) in root layout~~
- [ ] Add dynamic `generateMetadata` for Poem and Author pages (Open Graph, Twitter Cards)
- [ ] Add structured data (JSON-LD) for poems and authors
- [ ] Generate sitemap.xml and robots.txt

---

## 11. 📱 PWA & Offline Support — ✅ Implemented

- [x] Create `manifest.json` (app name, icons, display mode, colors)
- [ ] Generate dedicated PWA icons (192×192 and 512×512 branded assets)
- [x] Implement service worker for offline caching (network-first nav, stale-while-revalidate assets)
- [x] Add offline fallback page

---

## 12. 🐛 Code Quality & Technical Debt — ✅ Greatly Improved

### Completed:
- ✅ Replaced vanilla JS with Next.js App Router (React).
- ✅ Replaced raw CSS hacks with Tailwind CSS via PostCSS.
- ✅ ESLint + Next config added.
- ✅ Full Testing Suite: Jest, RTL (Unit Tests), and Playwright (E2E).

## 7. 🎨 UI/UX & Design System — ✅ Underway

The design system requires standardization.

### Tasks:
- [x] Apply unified `.card`, `.btn` styles across all pages.
- [x] Standardize responsive grids for feeds and profiles.
- [x] Implement robust loading skeletons (instead of generic "Loading..." text).
- [x] Add empty states for all views (empty collections, no followers, etc.).
- [x] **Implement Storybook** to isolate and document UI components, preventing unintended layout regressions.
- [x] **Migrate to CSS Modules** (e.g., `Nav.module.css`) to prevent global style bleed and strictly scope styles.
- [x] add an undo for destructive actions (delete poem, delete collection, remove poem from collection)

---

## 13. 📊 Analytics & Monitoring — ✅ Scaffolded

- [x] Add analytics integration — GA4 scaffold (activate via `NEXT_PUBLIC_GA_ID`)
- [x] Add error tracking — client `ErrorBoundary` + `/api/errors` route (extend with Sentry DSN)
- [x] Add Web Vitals reporting — `useReportWebVitals` + `/api/vitals` route (forwards to GA4 MP)

---

## 14. 🚀 Deployment & DevOps — ✅ Implemented

- [x] ~~Set up CI/CD pipeline (GitHub Actions)~~ (Done)
- [x] ~~Configure production deployment (Vercel, Netlify)~~ (Done)
- [x] Add environment variable management for production
- [x] ~~Configure custom domain and SSL~~ (Instructions added)
- [x] cant easily tell my poems or collections apart

---

## Summary Matrix

| Category | Status |
|----------|--------|
| Dead Nav Links / Missing Pages | ✅ Implemented |
| Authentication | ✅ Implemented |
| Data Layer | ✅ Implemented |
| Content Creation | ✅ Implemented |
| Collections Feature | ✅ Implemented |
| Search | ✅ Implemented |
| Backend Services | ⚠️ Partially Implemented |
| Social Features | ✅ Implemented (Likes, Follows, Comments, Notifications) |
| Accessibility | ✅ Implemented |
| SEO & Meta | ✅ Implemented (Dynamic OG/Twitter, JSON-LD) |
| PWA & Offline | ✅ Implemented |
| Code Quality | ✅ Complete |
| Analytics | ✅ Scaffolded (GA4, ErrorBoundary, Web Vitals) |
| Deployment | ❌ Not started |

---

---

## 15. Bugs, Defects and Issues
- [x] ~~The menu pop up for the save poem does not dismis on click away~~
- [x] ~~some author avatars just show letter and dont appear as avatars (missing the background color)~~
- [x] ~~menu items are pushed when search bar is expanded~~
- [x] ~~padding missing in export page content~~
- [x] ~~consider having a the export layouts as a carousel of layouts to pick from insteads of listed cards this ensures that the download and preview buttons are always visible (especially on mobile)~~
- [x] ~~no way to feature poem (i guess no admin accounts and moderation feature)~~


## Recommended Priority Order (Updated)

1. **Accessibility & Design Polish:** ✅ (Done)
2. **Infrastructure & Analytics:** ✅ (Done) GA4 scaffold, ErrorBoundary + error API, Web Vitals, SW + offline page.
3. **Advanced Features:** ✅ (Done) PWA manifest, Web Share API, Embed code generation.
4. **SEO, Pagination, Social & PWA Branding:** ✅ (Done) sitemap.xml, robots.txt, infinite scroll, intent sharing, branded PWA logo.

---

## Next Priority Items

1. **Cloud Storage Integration:** Replace local file system uploads with S3, GCS, or Cloudinary for scalable image hosting (avatars, exported poem posters).
2. **Advanced Social Integration:** Implement native Twitter/X and Facebook sharing capabilities beyond the Web Share API.
3. **Accessibility Audit:** ✅ (Done) Performed a comprehensive screen reader test pass, added ARIA landmarks (`role="main"`, `role="navigation"`), and ensured keyboard support for template card selection.
