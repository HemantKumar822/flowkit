# Design and browser QA

For substantial UI, understand audience, important journey and navigation first. Inspect the existing design system. Use the installed frontend-design skill for direction; consult UI UX Pro Max for a concrete accessibility/typography/layout question. Avoid stacking several competing aesthetic workflows. React performance guidance is conditional on React; Figma integration needs a supplied design and available connector.

Establish coherent typography, contrast, spacing, responsive rules, reusable tokens/components, loading/empty/error states and restrained motion. Cite design research where it informed choices; use licensed assets. A small label edit needs focused rendered inspection, not an invented design system.

Run the actual app. Use the supported native browser tool for exploration and screenshots; use project-local Playwright tests for repeatable journeys where appropriate. Verify at least a mobile and desktop viewport for significant layouts. Interact with the main task, keyboard focus and error/empty states. Review the screenshots visually and fix observed issues. Capture exact URLs, viewport sizes, checks and limitations in project evidence. A screenshot file alone is not visual review; an HTTP 200 is not interaction evidence.

Use axe with Playwright for automated accessibility gaps where installed, plus manual keyboard/focus/contrast review. Automated checks cannot certify usability/accessibility. Use Storybook only when component isolation helps the project; add hosted visual regression after local baselines become insufficient. Lighthouse is milestone/performance-specific. Impeccable remains a separately reviewed pilot due runtime download and uncertain Windows execution in research. Do not silently add it.
