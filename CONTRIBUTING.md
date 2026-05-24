# Contributing to Verse

First off, thank you for considering contributing to Verse! It's people like you that make Verse such a great platform for poetry.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## 🚀 Tech Stack

Verse is built on a modern, full-stack architecture:
- **Framework:** Next.js 16 (App Router)
- **UI & Styling:** React 19, Tailwind CSS v4
- **Database:** SQLite with Prisma 7 ORM (using `better-sqlite3` adapter)
- **Authentication:** Auth.js v5 (NextAuth)
- **Testing:** Jest + React Testing Library (Unit), Playwright (End-to-End)

## 🛠️ Local Development Setup

To get the project running locally on your machine, follow these steps:

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/chainedcoder/verse-app.git
   cd verse-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   The project uses a local SQLite database (`dev.db`). Initialize your database schema with Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be running at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

Familiarize yourself with the core directories:
- `/app` — Next.js App Router (pages, layouts, API routes)
- `/components` — Reusable React components (UI elements, layout parts)
- `/lib` — Shared utilities, Prisma client, theme configuration, and stub data
- `/prisma` — Database schema (`schema.prisma`)
- `/public` — Static assets (fonts, icons, images)
- `/styles` (or `/app/globals.css`) — Global stylesheets and CSS variables
- `/__tests__` — Jest unit tests for React components
- `/e2e` — Playwright end-to-end tests

## 🧪 Testing

We take quality seriously. Before submitting a Pull Request, ensure that all tests pass.

### Running Unit Tests (Jest)
To run the component unit tests:
```bash
npm run test
# or
npx jest
```

### Running End-to-End Tests (Playwright)
Playwright spins up an actual Chromium browser to test the full stack (UI + Database + API).
```bash
npx playwright test
```
*Note: Make sure your development server is stopped before running E2E tests on the same port, or allow Playwright to manage the webserver if configured.*

## 📝 Code Style & Linting

We use ESLint to maintain code quality. Please run the linter before pushing your changes:
```bash
npm run lint
```
* Adhere to React Hooks rules.
* We prefer functional components and Next.js Server Components by default. Add `"use client"` only when interactivity or browser APIs (like `useState`, `window`, `navigator`) are required.

## 🤝 How to Contribute

### 1. Find an Issue
Check out the project's [Project Audit](./verse_project_audit.md) document to see what features are currently pending, unimplemented, or stubbed out.

### 2. Branching
Create a new branch for your feature or bugfix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

### 3. Commit Messages
Write clear, descriptive commit messages. We recommend the [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat: add new author search page`
- `fix: resolve hydration error on export page`
- `docs: update readme with deployment instructions`

### 4. Open a Pull Request
1. Push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. Clearly describe the problem you are solving and the changes you have made.
4. Ensure all CI checks (linting, tests) pass.

## 💬 Getting Help
If you need help or have questions about a specific feature, feel free to open an issue or start a discussion in the repository!
