# Verse — Complete Project Audit

> Full analysis of incomplete, missing, unimplemented, stub, and pending features across the entire Verse poetry platform.

---

## Executive Summary

Verse is currently a **static, client-side SPA** with hardcoded sample data, no backend, no authentication, and several navigation links that lead nowhere. While the UI design is polished and the export/download feature is well-built, the application is missing the vast majority of features needed for a production platform. **~80+ items** are identified below across 14 categories.

---

## 1. 🔗 Dead Navigation Links & Missing Pages

The navbar renders three top-level links, but **two of them are non-functional**:

| Link | Route | Status |
|------|-------|--------|
| **Discover** | `#/` | ✅ Working — renders home feed |
| **Collections** | `#/` → dead link | ❌ **Links to `#/` (home). No collections page exists.** No route in router. |
| **Authors** | `#/` → dead link | ❌ **Links to `#/` (home). No authors listing page exists.** Route exists for individual authors (`#/author/:id`) but no browse/listing page. |

### Files affected:
- [nav.js](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L17-L19) — `href="#/"` on both Collections and Authors links
- [nav.js](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L41-L46) — Same dead links in mobile drawer
- [app.js](file:///Users/steve/Documents/projects/posts/js/app.js#L27-L36) — Router `parseRoute()` has no case for `collections` or `authors`

### Tasks:
- [ ] Create `#/collections` route in router
- [ ] Create `#/authors` route in router
- [ ] Build `js/pages/collections.js` — Collections listing page
- [ ] Build `js/pages/authors.js` — Authors browse/listing page (distinct from individual author profile)
- [ ] Update nav links to point to `#/collections` and `#/authors`
- [ ] Update mobile drawer links accordingly
- [ ] Add page CSS styles for both new pages

---

## 2. 🔐 Authentication — Completely Stubbed

The navbar renders **"Log in"** and **"Sign up"** buttons on both desktop and mobile, but they have **zero functionality**:

### Files affected:
- [nav.js](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L26-L27) — Desktop buttons `#nav-login`, `#nav-signup`
- [nav.js](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L52-L53) — Mobile buttons `#mobile-login`, `#mobile-signup`
- [nav.js](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L58-L99) — `initNav()` attaches **no click handlers** to login/signup buttons

### Tasks:
- [ ] Design login/signup UI (modal or dedicated pages)
- [ ] Build `#/login` route and page
- [ ] Build `#/signup` route and page
- [ ] Implement authentication flow (see [Backend section](#7--backend--completely-absent))
- [ ] Add session management / JWT token handling
- [ ] Show logged-in user avatar/name in navbar when authenticated
- [ ] Hide login/signup buttons when already logged in
- [ ] Add logout functionality
- [ ] Add "Forgot password" flow
- [ ] Add OAuth/social login options (Google, GitHub, etc.)

---

## 3. 🗄️ Data Layer — Static & Non-Persistent

All data is **hardcoded in** [data.js](file:///Users/steve/Documents/projects/posts/js/data.js). No API calls, no dynamic content.

### Critical Issues:

| Issue | Location | Detail |
|-------|----------|--------|
| **Hardcoded poems** | [data.js:86-186](file:///Users/steve/Documents/projects/posts/js/data.js#L86-L186) | 9 poems statically defined |
| **Hardcoded authors** | [data.js:6-84](file:///Users/steve/Documents/projects/posts/js/data.js#L6-L84) | 7 authors statically defined |
| **sessionStorage for state** | [data.js:200](file:///Users/steve/Documents/projects/posts/js/data.js#L200) | Likes & follows use `sessionStorage` — **lost on tab close** |
| **No user-generated content** | — | Users cannot create, edit, or delete poems |
| **Fake metrics** | [data.js:95-96](file:///Users/steve/Documents/projects/posts/js/data.js#L95-L96) | `likes`, `date`, `readers` etc. are all static numbers/strings |
| **No pagination / infinite scroll** | [home.js](file:///Users/steve/Documents/projects/posts/js/pages/home.js) | All poems rendered at once |

### Tasks:
- [ ] Migrate state persistence from `sessionStorage` to `localStorage` (minimum) or backend API
- [ ] Replace hardcoded data with API fetch calls
- [ ] Implement pagination or infinite scroll for the feed
- [ ] Add loading states / skeleton screens (CSS class `.skeleton` exists in [components.css:416-431](file:///Users/steve/Documents/projects/posts/styles/components.css#L416-L431) but is **never used anywhere**)
- [ ] Add error states for failed data loads
- [ ] Implement proper date handling (real timestamps, relative formatting)

---

## 4. ✍️ Content Creation — Entirely Missing

Users have **no way to create content**. There is no poem editor, no form, no submission flow.

### Tasks:
- [ ] Build poem creation/editor page (`#/create` or `#/write`)
- [ ] Add "Write" or "Create" CTA button to navbar
- [ ] Build a rich poem editor with title, body (multiline), tags selection
- [ ] Add draft saving (autosave to localStorage or backend)
- [ ] Add poem editing for own poems
- [ ] Add poem deletion with confirmation
- [ ] Build author profile editing (bio, location, avatar)

---

## 5. 📚 Collections Feature — Completely Missing

"Collections" is referenced in the navbar ([nav.js:18](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L18), [nav.js:41-43](file:///Users/steve/Documents/projects/posts/js/components/nav.js#L41-L43)) but **no code exists** for this feature.

### Tasks:
- [ ] Design collections data model (name, description, poem IDs, author, visibility)
- [ ] Build create collection flow
- [ ] Build collection detail page (listing poems in a collection)
- [ ] Build collections listing/browse page
- [ ] Add "Save to collection" action on poem cards and poem detail page
- [ ] Add collection sharing
- [ ] Support public/private collections

---

## 6. 🔍 Search — Completely Missing

There is **no search functionality anywhere** in the application.

### Tasks:
- [ ] Add search input to navbar (desktop + mobile)
- [ ] Build search results page (`#/search?q=...`)
- [ ] Implement client-side search across poem titles, text, author names, and tags
- [ ] Add search suggestions / autocomplete
- [ ] Future: server-side full-text search

---

## 7. 🖥️ Backend — Completely Absent

> [!CAUTION]
> The application has **no backend whatsoever**. It runs entirely as static files served by `python3 -m http.server`. There is no API, no database, no server-side logic.

### Backend Services Needed:

#### 7.1 API Server
- [ ] Choose backend framework (Node.js/Express, Python/FastAPI, etc.)
- [ ] Set up project structure
- [ ] Implement RESTful or GraphQL API
- [ ] Add request validation and error handling
- [ ] Add rate limiting and security middleware
- [ ] Add CORS configuration

#### 7.2 Database
- [ ] Choose database (PostgreSQL, MongoDB, etc.)
- [ ] Design schema: users, poems, authors, collections, likes, follows, comments
- [ ] Set up migrations
- [ ] Add seed data for development

#### 7.3 Authentication Service
- [ ] Implement user registration (email/password)
- [ ] Implement login / JWT token issuance
- [ ] Password hashing (bcrypt/argon2)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session management / refresh tokens
- [ ] OAuth2 integration (optional)

#### 7.4 User Management
- [ ] User profiles CRUD
- [ ] Avatar upload and storage
- [ ] Account settings (email, password change)
- [ ] Account deletion

#### 7.5 Content API
- [ ] Poems CRUD (create, read, update, delete)
- [ ] Author profiles CRUD
- [ ] Collections CRUD
- [ ] Tags management
- [ ] Content moderation / reporting

#### 7.6 Social Features API
- [ ] Like/unlike poems (persist to database)
- [ ] Follow/unfollow authors (persist to database)
- [ ] Comments on poems
- [ ] Activity feed / notifications

#### 7.7 File Storage
- [ ] Image upload service (avatars, exported poem images)
- [ ] Cloud storage integration (S3, GCS, Cloudinary)
- [ ] CDN for static assets

#### 7.8 Email Service
- [ ] Transactional emails (verification, password reset)
- [ ] Notification emails (new follower, poem liked)
- [ ] Newsletter / digest emails

---

## 8. 🤝 Social Features — Stub / Incomplete

### 8.1 Likes
- **Current**: Client-only, uses `sessionStorage` in [data.js:214-222](file:///Users/steve/Documents/projects/posts/js/data.js#L214-L222). Lost on tab close.
- [ ] Persist likes to backend
- [ ] Show who liked a poem (likers list)
- [ ] Real-time like count updates

### 8.2 Follows
- **Current**: Client-only, uses `sessionStorage` in [data.js:229-237](file:///Users/steve/Documents/projects/posts/js/data.js#L229-L237). Lost on tab close.
- [ ] Persist follows to backend
- [ ] Show follower/following lists on author profiles
- [ ] Add "Following" feed filter (show only poems from followed authors)

### 8.3 Sharing
- **Current**: Copy link to clipboard works ([home.js:130-141](file:///Users/steve/Documents/projects/posts/js/pages/home.js#L130-L141), [poem.js:150-152](file:///Users/steve/Documents/projects/posts/js/pages/poem.js#L150-L152)). Instagram share is a **toast-only stub** ([poem.js:171-173](file:///Users/steve/Documents/projects/posts/js/pages/poem.js#L171-L173)).
- [ ] Implement Web Share API for native sharing on mobile
- [ ] Add Twitter/X share integration
- [ ] Add Facebook share integration
- [ ] Implement actual Instagram integration (deep link to app with exported image)
- [ ] Add embed code generation for poems

### 8.4 Comments — Missing
- [ ] Build comment system UI on poem detail page
- [ ] Comments CRUD API
- [ ] Nested replies / threading
- [ ] Comment moderation

### 8.5 Notifications — Missing
- [ ] Build notification center in navbar
- [ ] Real-time notifications (WebSocket or polling)
- [ ] Notification preferences

---

## 9. ♿ Accessibility Issues

| Issue | Location | Severity |
|-------|----------|----------|
| Poem cards use `div` + click handler instead of semantic `<a>` or `<button>` | [poemCard.js](file:///Users/steve/Documents/projects/posts/js/components/poemCard.js#L23), [home.js:89-98](file:///Users/steve/Documents/projects/posts/js/pages/home.js#L89-L98) | High |
| Work cards same issue | [author.js:30](file:///Users/steve/Documents/projects/posts/js/pages/author.js#L30) | High |
| No skip-to-content link | [index.html](file:///Users/steve/Documents/projects/posts/index.html) | Medium |
| No ARIA landmarks on main content areas | [app.js:79](file:///Users/steve/Documents/projects/posts/js/app.js#L79) | Medium |
| No `aria-live` region for dynamic feed updates | [home.js](file:///Users/steve/Documents/projects/posts/js/pages/home.js) | Medium |
| Toast has no `role="alert"` or `aria-live` | [toast.js](file:///Users/steve/Documents/projects/posts/js/toast.js) | Medium |
| `document.execCommand('copy')` is deprecated | [poem.js:188](file:///Users/steve/Documents/projects/posts/js/pages/poem.js#L188) | Low |
| No keyboard navigation for template selection on export page | [export.js](file:///Users/steve/Documents/projects/posts/js/pages/export.js) | Medium |

### Tasks:
- [ ] Add skip-to-content link
- [ ] Use semantic elements or proper ARIA roles on clickable cards
- [ ] Add `role="alert"` and `aria-live="polite"` to toast
- [ ] Add ARIA landmarks (`role="main"`, `role="navigation"`, etc.)
- [ ] Add keyboard support for template card selection
- [ ] Remove deprecated `document.execCommand('copy')` fallback
- [ ] Add focus management on route changes
- [ ] Test with screen readers

---

## 10. 🔎 SEO & Meta Tags — Minimal

### Current state:
- [index.html](file:///Users/steve/Documents/projects/posts/index.html#L6) has one generic meta description
- No Open Graph tags
- No Twitter card meta
- No structured data (JSON-LD)
- Hash-based routing (`#/`) is **invisible to search engines** (SPA with no SSR/SSG)
- No sitemap.xml
- No robots.txt
- No favicon / apple-touch-icon

### Tasks:
- [ ] Add favicon and apple-touch-icon
- [ ] Add Open Graph meta tags (og:title, og:description, og:image, og:url)
- [ ] Add Twitter card meta tags
- [ ] Add structured data (JSON-LD) for poems and authors
- [ ] Generate sitemap.xml
- [ ] Add robots.txt
- [ ] Consider SSR/SSG for SEO (or switch to path-based routing with History API)
- [ ] Add per-page dynamic document titles

---

## 11. 📱 PWA & Offline Support — Missing

### Current:
- [index.html](file:///Users/steve/Documents/projects/posts/index.html#L9-L10) has `apple-mobile-web-app-capable` and `meta theme-color`, but **no service worker, no manifest, no offline support**.

### Tasks:
- [ ] Create `manifest.json` (app name, icons, display mode, colors)
- [ ] Generate PWA icons (192×192, 512×512)
- [ ] Implement service worker for offline caching
- [ ] Add install prompt handling
- [ ] Offline fallback page

---

## 12. 🐛 Code Quality & Technical Debt

| Issue | Location | Detail |
|-------|----------|--------|
| **Cache-busting query string on import** | [app.js:11](file:///Users/steve/Documents/projects/posts/js/app.js#L11) | `import ... from './pages/export.js?v=6'` — should use a build system instead |
| **Skeleton CSS class unused** | [components.css:416-431](file:///Users/steve/Documents/projects/posts/styles/components.css#L416-L431) | `.skeleton` and `@keyframes shimmer` defined but never referenced in any JS |
| **Color customizer CSS unused** | [pages.css:393-438](file:///Users/steve/Documents/projects/posts/styles/pages.css#L393-L438) | `.color-customizer`, `.color-swatch-row`, `.color-swatch` all defined but never rendered |
| **No build system** | — | No bundler, no minification, no tree-shaking. Served as raw ES modules. |
| **No linting / formatting** | — | No ESLint, Prettier, or Stylelint configuration |
| **No tests** | — | Zero unit tests, integration tests, or E2E tests |
| **No error boundaries** | [app.js](file:///Users/steve/Documents/projects/posts/js/app.js) | Router has no try/catch; a bad poem ID crash could blank the page |
| **Canvas text doesn't auto-fit** | [export.js:377-553](file:///Users/steve/Documents/projects/posts/js/pages/export.js#L377-L553) | Long poems overflow the canvas vertically — no auto-sizing |
| **Inline styles extensively used** | Multiple files | Many components use heavy inline `style="..."` instead of CSS classes |

### Tasks:
- [ ] Remove cache-busting query string; implement proper build system (Vite or similar)
- [ ] Remove or use dead CSS classes (`.skeleton`, `.color-customizer`)
- [ ] Add ESLint + Prettier configuration
- [ ] Set up a test framework (Vitest, Jest, or Playwright for E2E)
- [ ] Add error handling in router for invalid routes/IDs
- [ ] Implement canvas auto-sizing for long poems in export
- [ ] Migrate inline styles to CSS classes
- [ ] Add a build/bundle step for production (minification, hashing)

---

## 13. 📊 Analytics & Monitoring — Missing

- [ ] Add analytics integration (Google Analytics, Plausible, or similar)
- [ ] Add error tracking (Sentry or similar)
- [ ] Add performance monitoring (Web Vitals reporting)
- [ ] Add event tracking for key user actions (like, follow, download, share)

---

## 14. 🚀 Deployment & DevOps — Missing

- [ ] Set up CI/CD pipeline (GitHub Actions, etc.)
- [ ] Configure production deployment (Vercel, Netlify, or cloud hosting)
- [ ] Set up staging environment
- [ ] Add environment variable management
- [ ] Configure custom domain and SSL
- [ ] Add CDN for static assets
- [ ] Set up database backups
- [ ] Add health check endpoints

---

## Summary Matrix

| Category | Status | Items |
|----------|--------|-------|
| Dead Nav Links / Missing Pages | ❌ Critical | 7 |
| Authentication | ❌ Not started | 10 |
| Data Layer | ⚠️ Static/Hardcoded | 6 |
| Content Creation | ❌ Not started | 7 |
| Collections Feature | ❌ Not started | 7 |
| Search | ❌ Not started | 5 |
| Backend Services | ❌ Not started | 20+ |
| Social Features | ⚠️ Stub only | 12 |
| Accessibility | ⚠️ Partial | 8 |
| SEO & Meta | ⚠️ Minimal | 8 |
| PWA & Offline | ❌ Not started | 5 |
| Code Quality | ⚠️ Debt | 9 |
| Analytics | ❌ Not started | 4 |
| Deployment | ❌ Not started | 8 |
| **TOTAL** | | **~80+ items** |

---

## Recommended Priority Order

1. **Fix dead nav links** — Collections and Authors links (quick wins, users see broken navigation immediately)
2. **Build Authors listing page** — Route + page already partially supported
3. **Build Collections page** — Even as a "coming soon" placeholder with design
4. **Backend API + Database** — Foundation for everything else
5. **Authentication** — Unlocks user-generated content
6. **Content creation** — Poem editor
7. **Persist social features** — Likes/follows to database
8. **Search** — Core discoverability feature
9. **Comments** — Community engagement
10. **PWA + SEO** — Growth and distribution
