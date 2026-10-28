// The active root app uses plain CSS and CSS Modules, not Tailwind.
// Leave CSS imports to the bundler: Tailwind's import processing can resolve
// them against the project root when Turbopack supplies a virtual input file.
const config = {
  plugins: {},
};

export default config;
