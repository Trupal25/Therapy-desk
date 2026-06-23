# TherapyDesk

## Register

product

## Users

Solo mental health practitioners (therapists, counselors, clinical psychologists) in independent practice. They are clinically trained, time-poor, and increasingly tech-comfortable. They use TherapyDesk between patient sessions — often on a laptop in a clinic room, sometimes on a phone between appointments. Their primary job is clinical care; documentation is a required burden they want to minimize.

Primary context: 5–15 minute windows between sessions where they need to capture, generate, or review SOAP notes quickly.

## Product Purpose

AI-powered clinical documentation and practice management for independent therapists. The hero feature is one-shot SOAP note generation from raw session notes — turning 10 minutes of typing into 30 seconds of review and a tap to sign. The rest of the app (schedule, client directory, settings) exists to support that core workflow without adding cognitive overhead.

Success looks like: therapist opens app → selects patient → types or dictates raw notes → taps "Generate SOAP" → reviews → signs. Total time: under 3 minutes per session note.

## Brand Personality

Sharp, modern, minimal.

- Precise over expressive
- Calm over busy
- Tool-like over app-like
- Clinical without being clinical-green

The app should feel like a well-designed instrument — a stethoscope, not a dashboard. Every pixel earns its place. Nothing is decorative.

## Core Feeling

**Trust.** The therapist needs to trust that:
- Their notes are secure and private
- The AI-generated SOAP is accurate and editable
- The app won't waste their time
- The data is always there when they need it

## Anti-references

- **Do not** look like a generic SaaS dashboard (rounded cards everywhere, gradient headers, hero metrics)
- **Do not** look like a medical EMR (clinical green, crowded data tables, tiny forms)
- **Do not** look "gentle" or "soothing" — the therapist is a professional, not a patient
- **Do not** look like a startup landing page (big illustration headers, testimonials carousels inside the app)
- **Do not** use gradient text, glassmorphism, side-stripe borders, or tiny uppercase "eyebrow" labels

## Design Principles

1. **Trust through precision.** Every pixel intentional. No decorative flourishes. Alignment, spacing, and typography carry the authority.

2. **Clinical velocity.** The default path from opening the app to signing a SOAP note should be ≤3 interactions. Every extra click is a bug.

3. **Calm tool.** The UI gets out of the way. High information density when needed, empty space when not. The therapist should never feel rushed by the interface.

4. **Progressive substance.** Start simple, reveal depth on demand. The first view shows what matters now; history, settings, and configuration are one click away, not visible by default.

## Accessibility & Inclusion

- Minimum WCAG 2.1 AA contrast (4.5:1 body, 3:1 large text)
- Reduced motion respected via `prefers-reduced-motion`
- No color-only signals (status uses icons + labels + color)
- Focus-visible rings on all interactive elements
- Font sizes start at 14px body minimum