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
<!-- END:testing-rules -->
