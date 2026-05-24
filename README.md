# Verse

Verse is a modern, full-stack poetry platform where users can discover, read, and export beautiful poetry. 

![Verse Logo](public/file.svg) <!-- Replace with actual logo if available -->

## 🌟 Features

- **Dynamic Feed:** Discover trending authors and the latest poetry in a beautiful, responsive layout.
- **Customizable Themes:** Switch effortlessly between light, dark, and custom accent colors (Indigo, Rose, Emerald, Amber, Violet, Ocean).
- **Poem Exporting:** Download poems in beautifully designed formats (Site view, Minimal, Dark cinematic, Love letter, Instagram story).
- **Authentication:** Secure user registration and login handled by NextAuth (Auth.js v5).
- **Responsive Design:** A seamless reading experience across desktop, tablet, and mobile devices.

## 🚀 Tech Stack

Verse has recently been migrated from a vanilla JavaScript SPA to a robust, modern full-stack application:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI / Components:** React 19, [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** SQLite with [Prisma 7 ORM](https://www.prisma.io/)
- **Authentication:** [Auth.js v5](https://authjs.dev/) with `bcryptjs`
- **Testing:**
  - Unit/Component Tests: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/react)
  - End-to-End Tests: [Playwright](https://playwright.dev/)

## 🛠️ Getting Started

To run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chainedcoder/verse-app.git
   cd verse-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the Database:**
   Verse uses a local SQLite database (`dev.db`). Generate the Prisma client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 🧪 Testing

We ensure platform stability through a comprehensive testing suite.

**Run Unit Tests (Jest):**
```bash
npm run test
```

**Run End-to-End Tests (Playwright):**
```bash
npx playwright test
```

## 🤝 Contributing

We welcome contributions! Verse is actively being developed and there are many features on our roadmap.

- Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.
- Check out the [Project Audit](verse_project_audit.md) to see a comprehensive list of pending features, missing pages, and technical debt that needs addressing.

## 📄 License

This project is open-source and available under the MIT License.
