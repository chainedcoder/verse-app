<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:testing-rules -->
# Strict Testing Requirement
You MUST write tests for ALL changes and implementations you perform on this codebase. 
- Component/Function logic: Write Jest tests in `__tests__`
- Page/Flow logic: Write Playwright tests in `e2e`
Do not consider a task complete until it is fully covered by automated tests and verified to pass.
- Ensure elements match the existing styles and aesthetic, if they do not match, apply the correct styles to the elements.

This project enforces high-fidelity fronts and strict clean-code architecture. Keep these rules active in all feature
implementations:

## 1. UI Select Dropdowns
* **No Browser-Native `<select>` elements**: Never use browser-native select elements. Always implement state-driven, fully custom
React dropdown menus/popovers.
* **Theme Accent Compatibility**: Ensure that trigger focus rings, hover indicators, and item selections adapt to dynamic active
theme accents (`var(--accent)` and `var(--accent-soft)`).

## 2. Browser Alerts & Modals
* **No Browser-Native `alert()` / `confirm()` / `prompt()`**: Never use default browser window actions. Always construct custom
React-state-driven Modals, Popovers, and Toast notifications.
* **Transitions**: Use smooth animations (e.g. keyframe `fadeIn` and `slideUp` transitions) for all modal overlays and toasts.

## 3. Scoped Layout & Styles
* **No Global CSS leaks**: Never write global styling classes in page components.
* **Component-Level Styles**: Strictly use Component-scoped CSS modules (`*.module.css`) or inline-scoped styles. All styles must reside strictly within their corresponding component scope and theme aware.


<!-- END:testing-rules -->
