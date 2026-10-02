# PR Sentinel — Design System & UX Specification

**Document:** `design.md`  
**Product:** PR Sentinel — AI Engineering Risk & Review Orchestration Platform  
**Design Direction:** Awwwards-inspired editorial / experimental engineering interface  
**Status:** Design specification for implementation  
**Primary Frontend:** React + TypeScript + Vite  
**UI:** Tailwind CSS + shadcn/ui  
**Visualization:** Recharts + React Flow

---

## 1. Design Intent

PR Sentinel should not look like a conventional SaaS admin dashboard.

The product is an **engineering command center**. Its visual language should communicate:

- precision
- technical intelligence
- controlled complexity
- trust
- speed
- evidence
- developer tooling
- high information density without visual clutter

The design takes inspiration from the qualities commonly seen in award-oriented editorial web experiences:

- strong typography
- oversized type used as composition
- deliberate grid systems
- dark visual modes
- restrained but meaningful motion
- unconventional section transitions
- strong visual hierarchy
- interaction as part of the design rather than decoration

The goal is **not to reproduce another website or copy an Awwwards trend**. The interface should have its own identity around the central PR Sentinel concept:

> **Turn every Pull Request into a measurable engineering risk surface.**

Awwwards material itself highlights typography in motion, interaction/animation, navigation and dark mode as important design areas, while also warning against blindly reproducing trends without a clear concept. PR Sentinel therefore uses these principles as inspiration, not as a visual template.

---

# 2. Design Philosophy

## 2.1 Core Principle

### Make complexity feel simple.

PR Sentinel processes:

- GitHub events
- diffs
- repository history
- static analysis
- AI analysis
- risk scoring
- reviewer recommendation
- fix generation
- isolated validation

The UI must never expose all of that complexity at once.

The user should first see:

```text
WHAT NEEDS ATTENTION?
        ↓
WHY?
        ↓
WHAT SHOULD I DO?
        ↓
WHAT EVIDENCE SUPPORTS IT?
```

---

## 2.2 Editorial Engineering

The visual system should combine:

**Editorial design**
- oversized headlines
- asymmetric layouts
- generous whitespace
- strong typographic contrast
- intentional cropping

with:

**Engineering UI**
- data tables
- status indicators
- code blocks
- risk meters
- graphs
- logs
- technical metadata

The result should feel closer to a **high-end technical publication + developer control room** than a generic dashboard.

---

## 2.3 Visual Personality

PR Sentinel should feel:

| Attribute | Direction |
|---|---|
| Serious | High |
| Technical | High |
| Experimental | Medium–High |
| Playful | Low |
| Corporate | Medium |
| Minimal | High |
| Information Dense | High |
| Decorative | Low |
| Motion | Medium |
| Visual Contrast | High |

Avoid:

- generic purple-gradient SaaS styling
- excessive glassmorphism
- floating cards everywhere
- excessive rounded corners
- rainbow gradients
- meaningless animations
- dashboard template aesthetics
- decorative 3D objects that do not explain the product

---

# 3. Brand Concept

## 3.1 Primary Concept — "Risk Surface"

The interface should repeatedly use the idea of a **surface**.

A Pull Request is treated as a surface containing:

```text
Files
Functions
Dependencies
Findings
Risk
History
Reviewers
Fixes
Validation
```

This can become the visual foundation of the product.

### Visual metaphor

A PR detail page can visually behave like an inspection surface:

```text
┌────────────────────────────────────────────────────────────┐
│ PR #184                         RISK SURFACE               │
│ Payment service refactor                         78 / 100 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│        ● auth.ts                                           │
│       /                                                    │
│  ● payment.ts ─────── ● checkout.ts                       │
│       \                    \                               │
│        ● database.ts       ● stripe.ts                    │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  CRITICAL     IMPORTANT      MINOR                         │
│      2             3           4                           │
└────────────────────────────────────────────────────────────┘
```

---

# 4. Design Tokens

## 4.1 Color Philosophy

Use a **near-black canvas** rather than pure black.

Recommended base palette:

```text
Background:
#080808
#0D0D0D
#111111

Surface:
#151515
#1A1A1A
#202020

Primary text:
#F5F5F0

Secondary text:
#A5A5A0

Muted:
#686863

Borders:
#292929

Primary accent:
#D8FF3E

Secondary accent:
#8B5CF6

Information:
#60A5FA

Success:
#65D69A

Warning:
#F4C95D

Critical:
#FF5C5C
```

### Accent philosophy

Use **one dominant accent** for the brand.

Recommended:

```text
PR Sentinel Lime
#D8FF3E
```

The lime accent represents:

- detection
- signal
- attention
- machine intelligence
- engineering telemetry

Red should remain reserved for actual critical/security states.

Purple should not become the primary brand color.

---

## 4.2 Semantic Colors

Never use color as the only indication of state.

| State | Visual |
|---|---|
| Critical | Red + icon + label |
| High | Orange/amber + icon + label |
| Medium | Yellow + icon + label |
| Low | Blue/neutral + icon + label |
| Validated | Green + check |
| Failed | Red + failure icon |
| Running | Accent + animated indicator |
| Queued | Muted + queue icon |
| AI-generated | Accent outline + AI label |

---

# 5. Typography

Typography is one of the most important parts of the visual identity.

## 5.1 Font Roles

Recommended:

### Display

`Space Grotesk` or `Sora`

Used for:

- hero headlines
- page titles
- large metrics
- section statements

### UI

`Inter`

Used for:

- navigation
- controls
- labels
- tables
- metadata
- body text

### Code

`JetBrains Mono`

Used for:

- code
- commit SHA
- file paths
- function names
- risk calculations
- logs
- technical metadata

---

## 5.2 Type Scale

```text
Display XL     96–128px
Display L      72–88px
Display M      48–64px
Heading XL     36–48px
Heading L      28–36px
Heading M      22–28px
Body L         18px
Body M         15–16px
Body S         13–14px
Caption        11–12px
Code           12–14px
```

Do not use large typography everywhere.

Oversized typography should create **hierarchy and rhythm**.

---

# 6. Layout System

## 6.1 Grid

Desktop:

```text
12-column grid
Maximum width: 1440px
Outer margin: 32–64px
Column gap: 16–24px
```

Large screens:

```text
┌──────────────────────────────────────────────────────┐
│  01                    PR SENTINEL          MENU     │
│                                                      │
│  ┌──────────────┬──────────────────────┬──────────┐  │
│  │              │                      │          │  │
│  │   Navigation │     Main Content     │ Context  │  │
│  │              │                      │          │  │
│  └──────────────┴──────────────────────┴──────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 6.2 Asymmetric Layouts

Do not force every section into equal cards.

Prefer:

```text
Large visual area
        +
small metadata area
        +
technical detail
```

Example:

```text
┌───────────────────────────────┬──────────────┐
│                               │  RISK        │
│       PR #184                 │  78          │
│       Payment Refactor        │  HIGH        │
│                               │              │
│       + large typography      │  Security    │
│                               │  Regression  │
├───────────────────────────────┴──────────────┤
│  06 findings      12 files      04 reviewers │
└──────────────────────────────────────────────┘
```

---

# 7. Global Navigation

## Desktop

Use a compact fixed navigation rail.

```text
┌──────┐
│  PR  │
│  S   │
├──────┤
│  ◉   │ Overview
│  ◇   │ Pull Requests
│  ⚠   │ Findings
│  ◎   │ Reviewers
│  ⬡   │ Risk Graph
│  ✓   │ Validation
│  ≡   │ Audit
├──────┤
│  ?   │
│  ○   │ User
└──────┘
```

The rail should remain visually quiet.

Selected navigation:

- accent line
- subtle background
- icon + label
- no heavy shadow

---

## Mobile

Replace the rail with:

- top navigation
- page title
- compact menu
- bottom navigation for primary actions where appropriate

Never compress the desktop sidebar into an unusable tiny rail.

---

# 8. Landing / Overview Dashboard

The overview should feel like a **command center**, not an analytics template.

## Hero

Large statement:

```text
ENGINEERING
RISK,
BEFORE IT
BECOMES
INCIDENT.
```

Supporting copy:

```text
PR Sentinel analyzes Pull Requests,
surfaces meaningful engineering risk,
and connects evidence to action.
```

Primary CTA:

```text
VIEW REVIEW QUEUE →
```

Secondary CTA:

```text
CONNECT GITHUB
```

---

## 8.1 Overview Composition

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│ ENGINEERING                                             │
│ RISK,                                                   │
│ BEFORE IT                                               │
│ BECOMES INCIDENT.                                      │
│                                                         │
│                           ┌──────────────────────────┐  │
│                           │  ACTIVE RISK              │  │
│                           │                          │  │
│                           │       78                 │  │
│                           │       HIGH               │  │
│                           └──────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 12 OPEN PRs     05 CRITICAL     18 FINDINGS    91% ↓   │
├──────────────────────────┬──────────────────────────────┤
│ RISK QUEUE               │ RISK TREND                  │
│                          │                              │
│ #184   78 HIGH           │       ╱╲                    │
│ #179   71 HIGH           │  ╲___╱  ╲___               │
│ #176   62 MED            │                              │
├──────────────────────────┴──────────────────────────────┤
│ RECENT ANALYSIS                                         │
│ ✓ #184 completed                         24 sec         │
│ ✓ #181 completed                         31 sec         │
│ ! #179 validation failed                 42 sec         │
└─────────────────────────────────────────────────────────┘
```

---

# 9. Pull Request Queue

The queue is the most important operational screen.

## Design Goal

A developer should be able to answer in under 10 seconds:

1. Which PR needs attention?
2. Why?
3. Who should review it?
4. What happens next?

---

## 9.1 Queue Row

Avoid conventional table-only layouts.

Use structured horizontal rows:

```text
┌───────────────────────────────────────────────────────────────┐
│ #184  Payment refactor                            78  HIGH   │
│       feature/payment-v2 → main                              │
│       6 findings · 14 files · 3 reviewers                    │
│                                                               │
│       SECURITY 2     REGRESSION 2     COMPLEXITY 1     +1    │
│                                                               │
│       A. Singh · 12m ago                      OPEN →          │
└───────────────────────────────────────────────────────────────┘
```

Hover:

- expand metadata
- reveal action
- subtle horizontal movement
- no aggressive card scaling

---

# 10. PR Detail Page

This is the core product experience.

## 10.1 Header

```text
PULL REQUEST / #184

Payment service refactor

feature/payment-v2 → main

78 / 100
HIGH RISK

Analyzed 24 seconds ago
```

Actions:

```text
RE-RUN
COMMENT ON GITHUB
GENERATE FIX
```

---

## 10.2 Risk Hero

Use a large numerical score.

```text
                  78
             ───────────
               HIGH RISK

       SECURITY       82
       REGRESSION     74
       COMPLEXITY     61
       DEPENDENCY     57
```

Do not use a circular progress chart if a strong number can communicate the same thing.

The score should feel like a **measurement**, not a decoration.

---

# 11. Findings

PRD requirement:

Every finding must explain:

1. What?
2. Why?
3. Where?
4. Impact?
5. Fix?

The UI should explicitly follow this structure.

## Finding Card

```text
CRITICAL / SECURITY

SQL query built from user-controlled input

WHAT
User-controlled input reaches the query builder
without parameterization.

WHY
The value can alter SQL execution.

WHERE
src/api/users.ts
Line 84

IMPACT
Potential SQL injection and unauthorized
data access.

FIX
Use the parameterized query interface.

[VIEW DIFF]       [GENERATE FIX]
```

---

## 11.1 Finding Hierarchy

Show:

```text
Critical
    ↓
Important
    ↓
Minor
```

Never dump dozens of equally weighted warnings onto the screen.

The PRD explicitly emphasizes reducing overwhelming warning counts into meaningful categories.

---

# 12. Code Diff Viewer

The diff should feel like an IDE component embedded inside an editorial interface.

Requirements:

- syntax highlighting
- line numbers
- added/removed indicators
- finding markers
- inline explanations
- collapsible context
- keyboard-friendly navigation

Example:

```text
84 │ - query = "SELECT * FROM users WHERE id=" + id
85 │ + query = db.query("SELECT * FROM users WHERE id=?", [id])
      ▲
      └── SECURITY FINDING
```

The finding marker should connect visually to the explanation panel.

---

# 13. AI Review Brief

The AI review should never look like a generic chatbot.

Use an **editorial brief**.

```text
AI REVIEW BRIEF

The PR changes the payment flow across
three modules.

The primary risk is not the amount of code
changed, but the new dependency between
payment validation and checkout state.

01  SECURITY
    Payment token reaches logging layer.

02  REGRESSION
    Existing retry behavior is modified.

03  COMPLEXITY
    Checkout state is now distributed across
    four modules.

RECOMMENDATION
Review payment validation and retry logic first.
```

Avoid:

- chat bubbles
- fake human typing
- chatbot UI
- conversational filler

PR Sentinel is an engineering analysis product, not an AI chat product.

---

# 14. Reviewer Recommendation

The dashboard must explain recommendations.

Example:

```text
RECOMMENDED REVIEWER

Aarav Singh

94% relevance

WHY

File Expertise              ██████████  96
Recent Activity              █████████  89
Review History               ████████   83
Module Affinity              █████████  91

Evidence

• 17 previous changes to payment/
• 8 previous reviews in this module
• Active contributor in the last 14 days

[ASSIGN REVIEWER]
```

Do not expose irrelevant personal attributes.

The recommendation must remain based on repository activity and review evidence.

---

# 15. Risk Graph

Use React Flow for the repository/code-risk graph.

## Visual Language

Nodes:

```text
PR
│
├── File
│    ├── Function
│    └── Class
│
├── Dependency
│
├── API
│
└── Test
```

Node appearance:

```text
┌──────────────────────┐
│ payment.ts           │
│ RISK 82              │
│ 2 findings           │
└──────────────────────┘
```

Riskier nodes become visually more prominent.

Do not use random colors for graph nodes.

Use:

- size
- border intensity
- accent
- labels
- controlled semantic colors

---

# 16. Fix Generation

Fix generation is an optional capability.

The interface should communicate that the output is **proposed**, not automatically trusted.

## Fix View

```text
AI GENERATED FIX

Status
PROPOSED — NOT APPLIED

Problem
SQL query is constructed from raw input.

Proposed change

────────────────────────────────────
- query = "SELECT ..."
+ query = db.query("SELECT ...")
────────────────────────────────────

Expected behavior
Input is passed as a parameter rather than
being interpolated into the query.

Potential side effects
Existing query adapter must support
parameterized execution.

[VALIDATE FIX]
```

---

# 17. Validation Experience

Validation should feel like a controlled experiment.

```text
PATCH VALIDATION

RUN #3812

┌───────────────────────────────────────┐
│ TESTS                    ✓ PASSED     │
│ LINT                     ✓ PASSED     │
│ SECURITY                 ✓ PASSED     │
│ BUILD                    ✓ PASSED     │
└───────────────────────────────────────┘

Environment
Ephemeral Docker sandbox

Network
DISABLED

Duration
18.4s

RESULT
VALIDATED

Human approval still required.
```

Never imply that validation equals automatic approval.

---

# 18. Audit Trail

Use a vertical event timeline.

```text
ANALYSIS TIMELINE

14:31:08   GitHub webhook received
14:31:09   Analysis job created
14:31:14   Worker started
14:31:21   Static analysis completed
14:31:28   AI analysis completed
14:31:31   Risk score calculated
14:31:33   Reviewer recommendation generated
14:31:42   Analysis completed
```

Use monospace timestamps.

The timeline should visually communicate causality.

---

# 19. Motion Design

Motion should communicate **state, hierarchy and causality**.

Never animate simply because animation is possible.

## 19.1 Motion Principles

### Fast

For direct interactions:

```text
120–180ms
```

### Standard

For panels and navigation:

```text
200–300ms
```

### Dramatic

For hero/section transitions:

```text
500–900ms
```

Use easing such as:

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

---

## 19.2 Page Entry

Recommended sequence:

```text
Page shell
    ↓
Heading
    ↓
Primary metric
    ↓
Content blocks
    ↓
Secondary metadata
```

Use slight vertical translation + opacity.

Do not make the entire dashboard bounce into existence.

---

## 19.3 Risk Score Animation

On initial load:

```text
0 → 78
```

But keep the animation short.

The final value must appear quickly enough that users do not have to wait for the information.

---

## 19.4 Finding Reveal

Findings may enter sequentially:

```text
Critical
    ↓
Important
    ↓
Minor
```

Maximum stagger:

```text
40–60ms
```

---

## 19.5 Graph Motion

React Flow graph transitions should:

- animate node placement
- preserve node positions when possible
- avoid continuous movement
- use motion only during structural changes

---

# 20. Scroll Experience

Use scroll as a storytelling mechanism only on:

- landing page
- overview
- product explanation pages

Dashboard operational screens should prioritize speed.

### Landing page sequence

```text
Hero
  ↓
Problem
  ↓
Detection
  ↓
Risk
  ↓
Reviewer
  ↓
Fix
  ↓
Validation
  ↓
Human approval
```

Each stage can use pinned visual content with subtle transitions.

---

# 21. Cursor & Hover Language

Optional custom cursor for the marketing/landing experience.

Do **not** use a custom cursor throughout the application.

Dashboard cursor remains native for usability and accessibility.

Hover states:

### Buttons

```text
Idle
──────
Hover → accent shift + 2px movement
Active → return
```

### Finding

```text
Idle
Hover → border becomes more visible
        metadata becomes visible
        action appears
```

### Graph node

```text
Hover → connected edges become emphasized
        unrelated nodes reduce opacity
```

---

# 22. Cards & Surfaces

Avoid a UI composed of 30 floating cards.

Instead use:

- borders
- spacing
- typography
- background shifts
- section dividers

A card should exist only when it groups information with a clear purpose.

Preferred:

```text
────────────────────────────────
RISK
78
HIGH
────────────────────────────────
```

Instead of:

```text
╭──────────────────────────────╮
│        Risk Score            │
│          78                  │
│       High Risk              │
╰──────────────────────────────╯
```

The second pattern should be used sparingly.

---

# 23. Border Language

Borders are important to the PR Sentinel identity.

Use thin borders:

```text
1px solid #292929
```

Accent borders for active states:

```text
1px solid #D8FF3E
```

Critical:

```text
1px solid #FF5C5C
```

Avoid heavy 2–4px borders except for intentional editorial compositions.

---

# 24. Radius

Use restrained rounding.

Recommended:

```text
Buttons:       6–8px
Inputs:        6–8px
Panels:        8–12px
Large hero:    12–16px
```

Avoid:

```text
rounded-full
```

for every UI element.

Pills are reserved for:

- status
- severity
- tags
- compact metadata

---

# 25. Data Visualization

## Recharts

Use for:

- risk trends
- finding counts
- repository trends
- reviewer workload
- analysis duration

Charts should be:

- monochrome by default
- accent-driven
- grid-light
- label-light

Avoid chart junk.

---

## Risk Chart

Prefer:

```text
Risk
100 ┤
 80 ┤          ●
 60 ┤     ●         ●
 40 ┤ ●
 20 ┤
    └────────────────
      Mon Tue Wed Thu
```

over large donut charts unless the donut communicates a meaningful composition.

---

# 26. Responsive Design

## Desktop

Target:

```text
≥ 1280px
```

Full command center experience.

---

## Tablet

Target:

```text
768–1279px
```

- reduce navigation width
- collapse secondary panels
- preserve primary risk information
- convert side-by-side panels to stacked layouts

---

## Mobile

Target:

```text
< 768px
```

Priority order:

```text
Risk
↓
Critical findings
↓
Why
↓
Recommended action
↓
Reviewer
↓
Fix
↓
Validation
↓
Detailed graph
```

Do not attempt to display the entire desktop dashboard on mobile.

---

# 27. Mobile PR Detail

Recommended:

```text
┌────────────────────────────┐
│ ← #184                     │
│ Payment refactor           │
├────────────────────────────┤
│                            │
│          78                │
│        HIGH RISK           │
│                            │
├────────────────────────────┤
│ 2 CRITICAL                 │
│ 3 IMPORTANT                │
│ 4 MINOR                    │
├────────────────────────────┤
│ CRITICAL                   │
│ SQL Injection              │
│                            │
│ WHAT                       │
│ ...                        │
│                            │
│ WHERE                      │
│ users.ts:84                │
│                            │
│ [VIEW FINDING]             │
└────────────────────────────┘
```

---

# 28. Accessibility

Awwwards-style visual experimentation must never compromise accessibility.

Requirements:

- WCAG-aware contrast
- keyboard navigation
- visible focus states
- semantic HTML
- screen-reader labels
- reduced-motion support
- no color-only status communication
- accessible graph alternatives
- accessible tables
- accessible dialogs
- accessible code/diff navigation

---

## 28.1 Reduced Motion

When:

```css
prefers-reduced-motion: reduce
```

disable:

- large page transitions
- graph animations
- cursor effects
- decorative parallax
- number count-up animations

Keep functional state transitions.

---

# 29. Loading States

Never use generic spinners everywhere.

Use contextual states.

### Analysis

```text
ANALYZING PR #184

Extracting diff       ✓
Parsing source        ✓
Running security      …
Building context      …
AI analysis           …
Risk calculation      …
```

### Dashboard

Use skeleton blocks that resemble final content.

---

# 30. Empty States

Avoid:

```text
No data found.
```

Instead:

```text
NO ACTIVE RISK

Your review queue is clear.

When a GitHub Pull Request requires
attention, PR Sentinel will surface it here.

[VIEW REPOSITORIES]
```

---

# 31. Error States

Errors should be direct and actionable.

Bad:

```text
Something went wrong.
```

Good:

```text
ANALYSIS FAILED

The AI provider timed out after the
deterministic analysis completed.

Your PR is unaffected.

Available actions:

[RETRY AI ANALYSIS]
[VIEW DETERMINISTIC FINDINGS]
```

---

# 32. AI Failure UX

AI failure must not make the application feel broken.

The deterministic pipeline remains visible.

Example:

```text
ANALYSIS COMPLETE

STATIC ANALYSIS                 ✓
SECURITY CHECKS                 ✓
RISK CALCULATION                ✓

AI EXPLANATION                  —
Temporarily unavailable

Risk scoring remains available
from deterministic signals.
```

---

# 33. GitHub Integration UX

Connection flow:

```text
CONNECT GITHUB

01  INSTALL APP
        ↓
02  SELECT REPOSITORIES
        ↓
03  VERIFY PERMISSIONS
        ↓
04  RECEIVE TEST EVENT
        ↓
05  READY
```

Show only the permissions actually required.

---

# 34. Status Language

Use consistent verbs.

```text
QUEUED
RUNNING
COMPLETED
FAILED
RETRYING
VALIDATING
VALIDATED
PROPOSED
APPROVED
REJECTED
```

Avoid mixing:

```text
Done
Complete
Finished
Successful
```

for the same state.

---

# 35. Microcopy

PR Sentinel copy should be:

- concise
- technical
- confident
- evidence-oriented
- non-hype

Prefer:

> 3 findings require attention.

over:

> 🚨 Whoa! Your code might be in trouble!

Prefer:

> Reviewer recommended from repository activity.

over:

> AI found the perfect reviewer.

Prefer:

> Proposed fix. Validation required.

over:

> AI fixed your code!

---

# 36. Landing Page Structure

The marketing/landing experience can be more experimental than the dashboard.

Recommended structure:

```text
01  HERO
    ENGINEERING RISK,
    BEFORE IT BECOMES INCIDENT.

02  THE PROBLEM
    Code review produces too much signal.

03  DETECT
    Static analysis + AI

04  EXPLAIN
    What / Why / Where / Impact / Fix

05  SCORE
    Deterministic risk engine

06  ASSIGN
    Evidence-based reviewer recommendation

07  FIX
    AI-generated proposed patch

08  VALIDATE
    Isolated test environment

09  APPROVE
    Human remains in control

10  CTA
    CONNECT GITHUB
```

---

# 37. Hero Interaction

The landing page hero can show an animated PR transformation:

```text
PULL REQUEST
      ↓
      ↓
ANALYZING
      ↓
┌───────────────────┐
│ SECURITY     82   │
│ REGRESSION   71   │
│ COMPLEXITY   56   │
└───────────────────┘
      ↓
RISK 78 / HIGH
      ↓
REVIEWER RECOMMENDED
      ↓
FIX VALIDATED
      ↓
HUMAN APPROVAL
```

This should be an elegant visual sequence rather than a literal chatbot/demo video.

---

# 38. Design System Components

Create reusable components rather than page-specific styling.

Recommended component inventory:

```text
/components
├── layout/
│   ├── AppShell
│   ├── NavigationRail
│   ├── MobileNavigation
│   └── PageHeader
│
├── typography/
│   ├── DisplayText
│   ├── SectionTitle
│   └── MonoLabel
│
├── risk/
│   ├── RiskScore
│   ├── RiskBreakdown
│   ├── RiskBadge
│   └── RiskTrend
│
├── findings/
│   ├── FindingCard
│   ├── FindingSeverity
│   ├── FindingDetail
│   └── FindingFilters
│
├── pull-request/
│   ├── PRCard
│   ├── PRQueue
│   ├── PRHeader
│   └── PRMetadata
│
├── review/
│   ├── ReviewBrief
│   ├── ReviewerRecommendation
│   └── ReviewerEvidence
│
├── fixes/
│   ├── FixProposal
│   ├── DiffViewer
│   └── ValidationStatus
│
├── graph/
│   ├── RiskGraph
│   ├── GraphNode
│   └── GraphLegend
│
├── audit/
│   └── AuditTimeline
│
└── system/
    ├── EmptyState
    ├── ErrorState
    ├── LoadingState
    └── StatusIndicator
```

---

# 39. Tailwind Design Rules

Prefer utility composition through a small token layer.

Example:

```ts
const severityStyles = {
  critical: "...",
  high: "...",
  medium: "...",
  low: "...",
};
```

Do not scatter arbitrary colors throughout components.

Avoid:

```tsx
<div className="bg-[#ff23a1]">
```

Prefer semantic tokens:

```tsx
<div className="bg-critical">
```

---

# 40. shadcn/ui Usage

Use shadcn/ui as the structural foundation, not the final visual identity.

Recommended:

- Dialog
- Sheet
- DropdownMenu
- Tooltip
- Tabs
- Command
- Badge
- Button
- Input
- Select
- Table
- ScrollArea

Customize:

- radius
- typography
- colors
- spacing
- borders
- motion

Do not leave the default shadcn appearance untouched.

---

# 41. Iconography

Use one icon family consistently.

Recommended:

`Lucide`

Icons should be:

- 16px for inline UI
- 18–20px for navigation
- 24px for prominent controls

Avoid mixing:

- emoji
- random SVG icons
- multiple icon libraries

in the same interface.

---

# 42. Performance Rules

Awwwards-inspired motion must not destroy the engineering product's speed.

Requirements:

- animate `transform` and `opacity`
- avoid expensive layout animations
- lazy-load React Flow where possible
- lazy-load heavy graph components
- virtualize long finding lists if needed
- avoid unnecessary chart re-renders
- keep initial bundle focused
- use static assets efficiently
- respect reduced motion
- avoid scroll listeners that execute expensive work every frame

The dashboard should feel fast even on modest hardware.

---

# 43. Interaction Rules

Every interaction should answer one of three questions:

### What changed?

Use motion.

### Where should I look?

Use hierarchy.

### What can I do?

Use affordance.

If an animation answers none of these questions, remove it.

---

# 44. Do / Don't

## DO

- use oversized typography strategically
- use dark editorial layouts
- use strong whitespace
- use asymmetry
- use technical monospace metadata
- use restrained motion
- emphasize risk numbers
- expose evidence
- create visual relationships between findings and code
- make the dashboard feel like an engineering instrument

## DON'T

- copy another Awwwards site
- use animation everywhere
- create giant gradients
- use glassmorphism for every panel
- hide critical information behind animation
- use AI chat bubbles
- make risk scores look like arbitrary gamification
- use color without labels
- sacrifice accessibility
- sacrifice performance for visual effects

---

# 45. Product-Specific Visual Hierarchy

For every PR page, use this hierarchy:

```text
1. Risk
2. Critical findings
3. Explanation
4. Recommended action
5. Reviewer
6. Proposed fix
7. Validation
8. Evidence
9. Raw technical detail
```

This hierarchy should remain consistent across desktop and mobile.

---

# 46. Design-to-Architecture Mapping

The visual design must map cleanly to the technical architecture.

| UI Capability | Source |
|---|---|
| PR queue | PostgreSQL + dashboard API |
| Risk score | deterministic risk engine |
| Findings | static + AI analysis |
| Review brief | AI analysis |
| Reviewer recommendation | repository evidence |
| Fix proposal | AI provider |
| Validation | GitHub Actions + Docker |
| Audit timeline | persisted analysis events |
| Risk graph | analysis graph data |
| GitHub comments | GitHub App/API |
| Auth | Supabase Auth |
| Role visibility | RLS + server checks |

The UI must never invent information that the backend does not provide.

---

# 47. Trust Model

PR Sentinel handles source code and AI-generated recommendations.

Therefore the UI must make trust boundaries visible.

### Deterministic

```text
STATIC ANALYSIS
RISK CALCULATION
VALIDATION RESULT
```

### AI-assisted

```text
EXPLANATION
REVIEW BRIEF
FIX PROPOSAL
```

### Human

```text
FINAL APPROVAL
```

Use subtle labels to communicate this distinction.

---

# 48. Human-in-the-Loop Visual Language

The final state should never imply:

```text
AI → Production
```

The visual workflow should always communicate:

```text
AI
 ↓
PROPOSE
 ↓
VALIDATE
 ↓
HUMAN
 ↓
APPROVE
```

This is central to the product identity.

---

# 49. Design Acceptance Checklist

Before considering the frontend visually complete:

### Visual

- [ ] Strong typography hierarchy
- [ ] Consistent dark visual language
- [ ] Accent used sparingly
- [ ] Editorial asymmetry where appropriate
- [ ] No generic SaaS-card overload
- [ ] Consistent borders and radius
- [ ] Consistent iconography

### UX

- [ ] Risk visible immediately
- [ ] Critical findings prioritized
- [ ] Every finding is explainable
- [ ] Reviewer recommendation exposes evidence
- [ ] Fixes clearly marked as proposed
- [ ] Validation status visible
- [ ] Human approval clearly represented

### Motion

- [ ] Page transitions are subtle
- [ ] Risk score animation is short
- [ ] Finding reveal is restrained
- [ ] Graph transitions are meaningful
- [ ] Reduced motion is supported
- [ ] No decorative animation blocks usability

### Responsive

- [ ] Desktop command center
- [ ] Tablet adaptation
- [ ] Mobile-first information hierarchy
- [ ] No horizontal overflow
- [ ] Graph has a mobile fallback

### Accessibility

- [ ] Keyboard navigation
- [ ] Visible focus
- [ ] Semantic labels
- [ ] Color is not the only status indicator
- [ ] Screen-reader support
- [ ] Reduced motion

### Performance

- [ ] No unnecessary large assets
- [ ] Graph lazy-loaded
- [ ] Charts optimized
- [ ] Motion uses transform/opacity
- [ ] Initial dashboard remains fast

---

# 50. Final Design Direction

PR Sentinel should look like:

> **A high-end editorial interface built for engineers.**

Not:

> another AI dashboard.

The visual system should combine:

```text
EDITORIAL TYPOGRAPHY
        +
ENGINEERING DATA
        +
DARK MODE
        +
CONTROLLED MOTION
        +
ASYMMETRIC GRID
        +
EVIDENCE-FIRST UX
```

The final experience should make a complex analysis pipeline feel visually obvious:

```text
GITHUB
  ↓
DETECT
  ↓
EXPLAIN
  ↓
SCORE
  ↓
PRIORITIZE
  ↓
ASSIGN
  ↓
FIX
  ↓
VALIDATE
  ↓
HUMAN APPROVAL
```

**Design north star:**

> **Make engineering risk feel visible. Make evidence feel tangible. Make action feel obvious.**
