# Front-End Engineering Standard Guidelines

This project enforces high-fidelity fronts and strict clean-code architecture. Keep these rules active in all feature implementations:

## 1. UI Select Dropdowns
* **No Browser-Native `<select>` elements**: Never use browser-native select elements. Always implement state-driven, fully custom React dropdown menus/popovers.
* **Theme Accent Compatibility**: Ensure that trigger focus rings, hover indicators, and item selections adapt to dynamic active theme accents (`var(--accent)` and `var(--accent-soft)`).

## 2. Browser Alerts & Modals
* **No Browser-Native `alert()` / `confirm()` / `prompt()`**: Never use default browser window actions. Always construct custom React-state-driven Modals, Popovers, and Toast notifications.
* **Transitions**: Use smooth animations (e.g. keyframe `fadeIn` and `slideUp` transitions) for all modal overlays and toasts.

## 3. Scoped Layout & Styles
* **No Global CSS leaks**: Never write global styling classes in page components.
* **Component-Level Styles**: Strictly use Component-scoped CSS modules (`*.module.css`) or inline-scoped styles. All styles must reside strictly within their corresponding component scope.
