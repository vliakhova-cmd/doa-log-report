# doa-log — eTMF Index screen

React implementation of the Figma frame
**eTMF | IN PROGRESS | 10.9.1-10.9.2 → Index** (`JUX5FXuaKQlnfeH2hM4PMl`, node `33696:25047`).

```bash
npm install
npm run dev      # http://localhost:5175
```

**Live:** https://vliakhova-cmd.github.io/doa-log-report/

Pushing to `main` builds and publishes it — `.github/workflows/pages.yml`. The build sets
`GITHUB_PAGES=1`, which switches Vite's `base` to `/doa-log-report/`; every reference to a
`public/` asset goes through `import.meta.env.BASE_URL` so it resolves under that prefix rather
than at the domain root.

The Training Requirements opens at `/cross-module-check.html` on its own, without the surrounding app.

## Where the values come from

`src/tokens.ts` is the single source of design values. Every entry was resolved with the
Figma MCP `get_variable_defs` call on the frame above, and carries the Figma variable name
in a comment beside it — e.g. `color.statusOrange` is `status/solid/orange`, `table.cellMinHeight`
is `table/cell/medium-min-height`. Nothing here is eyeballed from a screenshot; if a value
needs to change, change it in Figma and re-resolve rather than editing the hex directly.

Components come from **DS - Base | IN PROGRESS | 2.0** and **DS - Advanced | IN PROGRESS | 2.0**
(`Table/Cell`, `Table/Header`, `Status`, `Control/Checkbox`, `Button/Flat`, `Button/Outline`,
`Controls/View Switcher`, `Tree/Row`, `Navigation`, `Top Header`, `Pagination`).

## Reused from `ai-course-authoring-flow`

`src/appShell/` is lifted from the sibling project and retargeted to this frame's variables:

| File | Change |
|---|---|
| `SplitterBar.tsx` | unchanged |
| `ResizableTree.tsx` | widths → `navigation-tree/{width,min-width,max-width}` (300/300/500), bg → `navigation-tree/bg` |
| `TopHeaderBar.tsx` | same slanted `CrumbDivider`, retargeted to `header-top/*`, eTMF crumbs |
| `LeftIconNav.tsx` | same 60px rail shape, eTMF icon set |
| `ContentTree.tsx` | caret moved to its own slot, indents 15/30/45, `tree-list/*` colors |

House style matches that project: inline styles only, Open Sans, FontAwesome React, no Tailwind.

## Layout

Follows the **Design Patterns | IN PROGRESS | 2.0** page pattern (`cUXexxyj0YxDJIayGtm27F`,
node `2021:8233`): the page header spans the tree and the content, to the right of the rail,
and carries view selection.

```
TopHeaderBar                        header-top/height 60
└ LeftIconNav        60px           navigation-main/collapsed-width (full height)
  └ column
    ├ PageHeader                    header/bg, padding 10/15, gap 15
    │   "Documents"                 Headings/H1 28/40
    │   Views ▼                     Button/Outline/Primary
    │   Index · View 2…6            Button/Outline/Tertiary — Index first + selected
    │   sliders · Layout            Button/Outline/Tertiary
    └ row
      ├ ContentTree     300px       navigation-tree/width — Search only, no View By
      └ content         flex        page/padding 15
        ├ PrimaryToolbar            toolbar/height 40, toolbar/bg
        ├ ResultsBar                count + view switcher + column/view/filter controls
        └ DocumentGrid              table/radius 10, 10 columns, pagination bottom-right
```

View selection lives in `PageHeader`, not the tree — the tree's `Tree/Heading` is reduced to
the search row. `VIEWS` in `DoaLogPage.tsx` drives the chips; the first entry is selected.

## Document preview

Clicking a row's file-type glyph opens the preview (eTMF node `32984:13253`). It replaces the
page header, tree and grid; the top header and nav rail stay put. Back returns to the grid.

```
DocHeader          header/bg — back · id · INDEXING · QC status · markers
                   favorite · title (Headings/H4) · [Preview | Training Requirements]
                   · Approve / Clarify / Reject / ···
Action toolbar     toolbar/bg — Start Page Manipulation · Open in New Window · More
├ Viewer           ribbon · tool strip · the PDF · "Page 1 of 1"
├ QvNav      75px  qv-panel/navigation — Metadata · Automate · Workflow · 3 Versions
│                  · 3 Related · Doc History
└ QvPanel   1/3vw  qv-panel — Automate / AI Suggested Flags / Cross-Doc Check tabs,
                   confidence bar, automate actions, system message,
                   4 Mapped Fields, 2 Extracted Fields
```

The decision buttons use the semantic outline variants: `button/outline/success` (`#25861e`),
`button/outline/warning` (text `#af620b` on a `#d1862e` border) and `button/outline/error`
(`#d23c2d`). The QV rail's selected item is `qv-panel/navigation/item/selected-bg` (`#5391c6`)
with white icon and label.

**Doc header** is `Header/Doc` from DS - Advanced (node `86:146439`). Corrected against it:

| | was | is |
|---|---|---|
| marker icons | `icons/solid/s` 15 | `header/doc/icon-size` **20** |
| id pill | padding 5 / 2.5, gap 5 | `id/{padding-x,padding-y,gap}` = **1 / 1 / 2** |
| row gap | borrowed `header/padding-y` via pageHeader | its own `docHeader.rowGap` (10) |
| additional text | missing | `header/doc/additional-text` `#576581` — the "Submitted Name" label |

> The `id/*` values are the one place the two files disagree: the DS component resolves them
> to 1 / 1 / 2, the eTMF product frame to 5 / 2.5 / 5 under its own mode. The DS wins, per the
> rule that the libraries are the source of truth for a component.

Two parts of `Header/Doc` the eTMF instance does **not** show and that are therefore not
built: a third row carrying the file icon + submitted name in `Headings/H6/Bold`, and the
`Open Index` link + close (✕) at the far right of row 1. `status/flat/purple` (`#7349aa`) and
`status/solid/green` (`#c0dcbf`) are in `tokens.ts` for the STAGE / STATUS variants.

**Panel tabs** are `Tab` from DS - Advanced (node `86:270983`). Three things were wrong:

| | was | is |
|---|---|---|
| underline | a `border-bottom` on the tab with a `5px 5px 100px 100px` radius hack | its own absolutely-positioned bar on the inner **Tab Part**, `bottom: -5`, 2px, radius 100 — so it spans the label, not the tab's 2px padding |
| hover | **missing** | `tabs/hover-bg` `#e5f1fb`, applied whether or not the tab is selected |
| indicator | an inline flex child that pushed the label | absolute at `right: -6` / `top: -4` on the Tab Part |

`tabs/{dragging-bg,disabled-opacity}` and `Counters/Large` (the optional per-tab count) are in
`tokens.ts`; this screen uses neither.

**Doc header row 2** — the favorite star is a **20px `icons/regular` (outline) glyph inside a
`favorite/icon-size-m` (30) box**, not a 30px solid glyph, and the Button Group sits directly
after the title: gaps are `header/doc/gap-x-xs` (5) star→title and `gap-x-m` (15) title→group.

**Button Group** (eTMF node `34312:227297`) — the Preview / Training Requirements toggle in the doc
header. Segments are `button/solid/tertiary`: selected `#5391c6` + white label, resting white +
`#1f6aac` label, `Buttons/Small` with 10 × 5 paddings and a 45px min width, sharing one
`button-group` border (`#dce1eb`, radius 5). Preview shows the PDF; **Training Requirements has no
content wired** — it shows a neutral System Message rather than invented report data.

## Header and grid content

**The top header is rebuilt against General Nav `3977:115987`**, and pulling that node corrected
five things that had been derived or approximated:

| | was | node says |
|---|---|---|
| switcher mark | 30px of inline dots | the **burger** asset — nine r=2.5 circles on a 7px pitch in a 19 viewBox, drawn at **19px inside** the 30px `action/icon-size` box, which is why it reads smaller than its slot |
| logo | `fa-layer-group` stand-in | the real vector, `public/ti-logo.svg`, 25.004x40 in a 40px box, drawn `scaleY(-1)` because Figma flips the group |
| eTMF crumb glyph | `circle-nodes`, then `share-nodes` | **`cubes`** |
| favourite star | invented `#f0b323` at 15px | `favorite/resting-active-icon` **`#f0d37e`** at `icons/solid/xs` **12** |
| offering chip | base grey, then brand tint | `chip/solid/info/resting-bg` `#c5e7fd` with a *lighter* `bg/accent/blue/solid/subtlest/resting` `#e3f4ff` border |
| crumb divider | `#dce1eb` | `header-top/crumb/border` **`#dee1e6`** |

Neither glyph guess was close: `circle-nodes` has four nodes and a long diagonal, `share-nodes`
three. Only the design context names the actual icon, and it took several attempts — the Figma
MCP timed out twice and reported "Server Figma unavailable" before succeeding.

> **Contrast deviation.** The DS pairs `status/flat/blue` `#367ca0` with the info chip's
> `#c5e7fd` fill, which measures **3.57:1** — under AA for a 12px semibold label. The fill is
> kept exactly; only the label darkens along the same hue to `#255a74` (5.81:1). Same treatment
> as the Card/Overview labels on their accent fills.

**The document rows are real TMF artifacts**, not the frame's placeholder strings. Row 1 is the
Delegation of Authority log; the rest are what actually sits beside it in `02.2_Delegation` — a
site signature sheet, Form FDA 1572, a sub-investigator delegation addendum, a staff training and
delegation log, and **the superseded v1.0 of the DOA log itself**, which is why row 1 is the one
in QC. Names are no longer pre-truncated with "…": the cell ellipsis does that, and the full
title now reaches `title` instead of being lost in the data.

**Status carries a tone, and every state is `Status/Solid`** — one fill per state, all in the
same lightness band, all with `status/solid/text` on them, so the column reads as one set of
states rather than two kinds of thing. An earlier pass used `status/flat` for the terminal states
(no fill, coloured text); solid throughout is what the column actually wants.

| state | fill | source | contrast |
|---|---|---|---|
| QC1 / QC2 IN PROGRESS | `#f2cea4` | `status/solid/orange` | 12.27 |
| QC PASSED | `#c0dcbf` | `status/solid/green` | 12.35 |
| QC REJECTED | `#f5c9c4` | **derived** | 12.18 |
| SUPERSEDED | `#dce1eb` | `chip/solid/base/resting-bg` | 13.90 |

> **Two fills could not be read.** `status/solid/red` and `status/solid/grey` are not carried by
> any node this project can open, and the Figma search connector is invalidated. The red is
> placed in the same lightness band as the three fills that *were* read (L 0.63–0.66) so the
> column stays even; the grey reuses a real DS grey surface rather than inventing a second one.
> Both are worth confirming.

> Deviation from the frame: row 2 is drawn there with **no** status at all. A document in QC
> always carries one, so it is given the state its date implies.

## Report-ready badge on the grid row

The Delegation of Authority row advertises that a cross-module check has already run against it,
so you learn a report is waiting without opening the document. `src/TrainingReportBadge.tsx`.

- **The mark** is a labelled pill, not a bare glyph. A first pass used a 20px flat icon button
  with an `indicator/*` dot; the row already carries four small icons and a fifth disappeared
  among them. It is `bg/accent/purple/solid/subtlest/selected` `#dcc8f5` with `#4b2d70` text
  (**7.14:1**) — the light, true violet of the accent family the report already uses for "needs
  review", so the badge and what it opens read as the same thing. Not `status/solid/purple`
  `#edc7e9`, which is that family's pink-leaning cousin. `chip/round-radius` 100,
  `chip/small-padding-y` 2.5 with `button/small-padding-x` 10, `Buttons/Small` 12/15/600, AI
  glyph at `icons/solid/s`. Measured 117×22.
- **Hover deepens the border, not the fill** — `chip/border-width` 1, transparent at rest so
  nothing resizes, becoming `bg/accent/purple/solid/saturated/resting` `#7349aa`. That keeps the
  interaction on real tokens rather than a derived darker fill.
- **It sits under the document name**, the way a role sits under a person's name elsewhere. That
  takes the row to `table/cell/large-min-height` **55** — the only row in the grid that is not
  45 — which is a real DS cell size rather than an arbitrary stretch.
- **One attention pulse**, three cycles then rest, in the violet at 45% — decorative, `aria-hidden`,
  and switched off under `prefers-reduced-motion`. Keyframes cannot be inline, so this file
  injects one `<style>` element once; everything else stays inline like the rest of the app.
- **The popover** opens on click, is `role="dialog"`, and closes on Esc (returning focus to the
  badge) or a click outside — the same two exits the change-log dialog gives, so they behave
  alike. It states when the check ran, the three counts with their semantic glyphs, what the
  check read, and the one action that follows: **Open training report**.
- **It opens straight onto the report.** `onOpen` takes an optional `DocView`, so the badge lands
  on the Training Requirements segment while clicking the file icon or the name still lands on Preview.

**It is portalled to `document.body`.** The name cell clips to an ellipsis and the grid scrolls
horizontally, so an absolutely-positioned panel was cut off by both — the first attempt rendered
correctly in the DOM at 320×251 and was invisible on screen. It now positions against the
button's viewport rect, re-placing on scroll and resize, and clamps to stay on screen when the
row sits near the right edge.

> **The counts are mirrored, not read.** The report is a self-contained HTML document in an
> iframe with its own copy of the scenario, so the grid cannot read them out of it. `report` on
> the row in `documentsData.ts` duplicates them and **must be kept in step with `TEAM` in
> `public/cross-module-check.html`** — currently 9 people, 6 / 2 / 1.

## Training Requirements — cross-module check demo

`public/cross-module-check.html` is a **self-contained** interactive demo: one file, inline CSS
and vanilla JS, no build step and no backend. It fills the Training Requirements segment via an
`<iframe>`, and also opens standalone at `/cross-module-check.html` — so it screen-records
without the surrounding app.

It dramatizes one idea: the AI doesn't just read the document, it reaches into contacts and
training records to answer a question no single document can answer.

**Scenario** (hardcoded): a delegation log for Site: Madrid listing 9 delegated team members —
6 resolve cleanly with training complete, 2 are flagged (Dr. Elena Ruiz, missing "Protocol
Training — Eligibility Criteria & Assessment" at 80%; Carmen Ortega, missing "Sample Handling &
Processing" at 36%), and 1 is ambiguous (two similar names at the site, deliberately not
auto-resolved). The two flagged people sit at very different points in their outstanding course,
which is what puts the progress bar in more than one state.

**Nothing about a named person is hardcoded in the copy.** The warning callout, the assign/query
confirmations, the change log's Flagged list and its Action taken lines are all built from the
record — `ACT.msg` and `ACT.audit` are functions of `(person, gap)`, and `Flagged` maps over
`flagged()`. A first pass had "Elena Ruiz" and her missing course written into those strings,
which broke the moment a second person was flagged.

Each person holds **one or more** delegated duties — 36 assignments in total, from 2 duties up
to 6 — and a duty is qualified by **at most one** LMS course. The duties are numbered 1–9 once, at load
(`DUTY_ORDER.forEach(… d.no = i + 1)`), and every surface uses those same numbers.

**A duty may have no course linked** (`course: null` — "Source data entry" is the case in the
data). That is a gap in the training catalogue, not in anybody's record, so it is reported on
the duty and never charged to the people holding it: `dutyState` returns `nocourse`, the
coverage row leaves **Trained and Coverage both empty**, and the tiles are unaffected. No status
is shown for it in either dashlet: the course cell already says "— none linked —", and a status
there would be inventing a training state for training that does not exist.
It is also why the Required-training counter counts *courses* (`courseCount`), not duties — the
two numbers deliberately differ for the people who hold that duty.

> The original brief also asked for an **unmatched** example state — a name with no contact
> behind it. It was built, then removed on request along with the toggle that reached it; the
> `stop` status and its styles went with it rather than being left as unreachable code. Two of
> the three outcomes remain.

**One screen, built to scan.** Four count tiles that double as the filter — click one to narrow
the table to that outcome, click it again to go back to all — then two dashlets over the same
36 assignments, pivoted two ways. Each independently reports "36 assignments", so the two
totals cross-check each other.

**Training Log** carries the full chain per person — name on document → resolved
contact → delegated duty → required training → status. Rows expand in place for the detail; the
flagged row's expansion holds the gap sentence and the two actions, the ambiguous row's holds
the side-by-side candidate picker.

**The expansion is the Table's expanded-row pattern** (node `86:211185`), and it holds **only the
nested table** — # · delegated duty · linked LMS course · course status. It has its own
`table/row/expand-*` tokens rather than borrowed ones:

| | token | applied |
|---|---|---|
| padding | `expand-padding-y` 15 · `-left-x` 45 · `-right-x` 15 | `15px 15px 15px 45px` |
| rule | `expand-element` `#1f6aac` · `-width` 2 · `-radius-left` 5 | 2px bar, outer end rounded |

**The grouping is the rule and the indent, not borders.** The child rows carry *no* separators of
their own; only the `.detail` cell's own bottom border closes the block. The 2px rule runs from
the top of the open parent row to the bottom of its expansion, drawn as a `::before` on each half
(the parent's rounds top-left, the expansion's bottom-left, so the two meet flush). It replaces
the row's orange/purple accent while the row is open.

Those selectors use the child combinator — `.detail > td`, not `.detail td`. As a descendant
selector it also matched every cell of the nested table inside, so each one drew its own copy of
the 2px rule down its left edge.

The nested table carries **no cell rules of its own**: it sits inside `.dash`, so
`.dash thead th`, `.dash tbody td`, `.dash .no` and `.dash .course` apply to it unchanged. Its
selectors are prefixed `.dbox` only to outrank the later `.dash tbody td` rules, which match at
equal specificity and would otherwise win on source order.

> **What used to live here.** The expansion once also held a warning callout, an Assign
> training / Query the site pair, a provenance note, and — for the ambiguous row — a side-by-side
> candidate picker that actually resolved the row, moved the tiles and rewrote the change log.
> All of it was removed. `ACT`, both handlers, `.callout`, `.acts`, `.note` and the `I.ok` /
> `I.warn` glyphs went with it rather than being left dead. The resolution flow came back later
> as a dialog off the Select contact button, which is where it belonged.

- **Linked LMS course** is a link button into the training system — the same
  `Table/Cell/Value type=Link` (node `86:208598`) the resolved contact uses, so the two records
  this check reaches out to from the document are opened the same way: `Buttons/Medium-Link`
  14/20/400 in `button/link/primary/resting-text`, underline revealed on hover, and the
  component's own focus treatment rather than the page outline. Applied in both dashlets. A duty
  with no course keeps the plain italic "— none linked —": there is nothing to open.

  Neither the training system nor the contacts module exists in a self-contained demo, so both
  links announce the navigation through the `aria-live` region instead of faking a destination.
- **Resolved contact** is a link button to the contact record — label only, no icon, and
  `display:inline-flex; max-width:100%` so the button hugs its text and the hover underline
  spans the name rather than the whole cell (measured: 71px button inside a 208px cell). When
  the contact isn't settled the cell instead shows a text status and the action that fixes it —
  "2 possible matches / **Select**", or "No contact found / **Create**".
- **Delegated duty** is the duty *numbers* as chips (`1 2 5`), not names — a row with three
  duties stays one line high, and each chip carries the full duty name as its `title`. This
  column and Required training are both **centred**, header included; centring one and leaving
  the other left-aligned beside it would read as a mistake rather than a choice.
- **Required training** is the **count alone** — `Chip / Outline · base · round · medium`
  (node `86:208605`) **without the icon**: `chip/medium-padding` 2.5/5, `chip/round-radius` 100,
  a 1px `chip/outline/base/resting-border` `#dce1eb` rule, a *transparent* fill
  (`chip/outline/base/resting-bg` is `#ffffff00`) and `Body/Regular` 14/20 in
  `chip/outline/base/secondary-text`. The transparent fill is what keeps it from competing with
  the status pills in the next column. `chip/medium-min-width` 30 makes every chip the same
  30×27 box regardless of digit, so the column reads as one straight edge.

  The column header already says what is being counted, so "linked course(s)" is dropped from
  the visible label but kept in the chip's `title` **and** in a `.sr` span — the accessible name
  is still "3 linked courses", not a bare "3". The ambiguous row is the exception: it has no
  count yet, so it keeps the muted "Pending contact selection" sentence rather than an empty chip.

**Duty → course coverage** is the other pivot: one row per duty, `#` first so the chip numbers
decode against it, then the linked LMS course, how many people are assigned, how many are
trained, and the coverage status.

> The **Create** branch is implemented but currently unreachable — the unmatched example it
> belonged to was removed on request. It is left in place because the state is one click of
> data away, unlike the `stop` status, which was deleted outright.

The audit trail lives in a **change-log dialog**, opened by the **Change Log** button in the
app's action toolbar. It is `Dialog` from DS - Advanced (node `35:11233`): `dialog/bg` `#f8faff`,
`dialog/radius` 10, `sizes/dialog/width-m` 800 capped at 90vw, the two-layer `Dialog` shadow,
`dialog/overlay/bg` `#0b152899` on the backdrop, a titlebar at `dialog/titlebar/paddings` 15/30
with a `Headings/H3/Semibold` title and a 20px close, and a white `dialog/content` panel inset
15px with `dialog/content/radius` 5. Built on a native `<dialog>`, so the focus trap and
background inertness come from the platform. It rebuilds on open, so it always reflects the
current state — taking an action adds its "Action taken" line.

> **Note on the brief.** The original spec asked for seven sequential screens with one decision
> each. That was built first, then replaced on request with this single scannable view. The step
> sequence is gone; every state it covered is still reachable, now as expansions and filters.

Built to the brief's remaining rules:

**Assigned is a `Chip / Outline · base · round · medium`** (node `86:208605`, no
icon) — `chip/medium-padding` 2.5/5, `chip/round-radius` 100, a 1px
`chip/outline/base/resting-border` `#dce1eb` rule and a *transparent* fill, `Body/Regular` 14/20
in `chip/outline/base/secondary-text`. `chip/medium-min-width` 30 makes every chip the same
30×27 box regardless of digit. It is a `<span>`, not a control: the outline says "this is a value
that was counted". Left-aligned like every other column — the DS table has no right-aligned
numeric variant, and a fixed-width chip does not need one to line up.

**The duty pivot ends in a progress bar** — the same `Graphics/Progress Bar/Small` the Training
Log uses, showing how many of the people assigned to that duty have completed its course:
`86% · 6 of 7`. It replaced a Trained count *and* a Coverage
status pill, which between them stated the same fact twice in two vocabularies. A duty with no
course shows an em dash — there is nothing to measure.

That retired the last `st('red', 'Not started')`, so `.st-red` and `status/solid/red` came out
with it rather than being left dead.

**Spacing runs on the DS gap scale.** `sizes/gap/m` 15 is the unit: the page gutters, the gap
between the two dashlets, the gap under the tiles, the dashlet header's `padding-x`, and the
padding inside each dashlet body all sit on it, with `portlet/content-template-padding-y-bottom`
30 at the foot of a scrolling panel.

The grid panels used to be `flush` — zero padding, table running edge to edge into the dashlet's
own border. They now carry the same 15 as everything else, so the table is held off the edges
rather than colliding with them. Measured: table inset 15 left and right from the dashlet edge,
expansion rule at 15, nested table at 60 (15 + `table/row/expand-padding-left-x` 45).

**One action, in the cell that shows its problem.** When the contact does not resolve to a single
record, that cell states the problem and carries the fix beneath it — **Select contact**, which
opens the picker. Nothing else in the Training Log is actionable.

It is `Button/Outline warning`: `button/outline/warning/resting-text` `#af620b` on a
`resting-border` `#d1862e` rule, `Buttons/Small` on `button/solid/small-paddings` 10/5. The fix
carries the same orange as the triangle above it rather than the brand blue every other control
uses, so the flagged cell reads as one thing.

> **Contrast deviation.** `#af620b` measures 4.59:1 on white — over AA for this 12px semibold —
> but 4.08:1 on the `#f9f0e7` hover fill, just under. Both values are the DS's own pairing and
> the shortfall only applies while the pointer is on the button; flagged rather than substituted.

> **Enroll and Send reminder used to live here** and were removed along with their two dialogs,
> `actionFor`, the shared checkbox-list styles and the `ACT2` entries behind them — that flow
> moves elsewhere. The data they acted on stays: `unenrolled` still drives the **Pending
> enrollment** course status in the expansion, so the finding is still reported even though the
> Training Log no longer offers the fix.

**Required training carries the overdue marker.** The cell reads the course count as plain text
(`Body/Regular` in `text/secondary`) beside a red pill when something is past due — `5 Courses`,
or `3 Courses ⚠ 1 Overdue`. The pill is `status/solid/red-subtle` `#f8dbd8` at
`chip/round-radius` 100 with `status/solid/padding-x` 5 and `Statuses/Semibold/Medium`.

It is deliberately **not** a Status component: it counts an exception rather than reporting a
state, which is why it keeps the warning glyph the Status components gave up. The full span is in
its `title`.

That replaced the outline chip that used to hold a bare number, and the overdue line that briefly
sat in the Training status column — which is now back to the state and the date behind it.
`courseChip`, `overdueLine` and the `.chip` style went with them rather than being left dead.

Overdue is reported **once**, in the Required training column, and computed from `RUN_AT` rather
than written down. It briefly also appeared in the expanded detail and again as a per-duty count
in the coverage pivot; both were removed. Overdue is a fact about a person's enrolment, and the
duty pivot measures how far a group has got — mixing the two put the same figure in three places
under three different framings.

> **Contrast deviation.** `status/flat/red` `#d23c2d` measures **3.64:1** on the pill's
> `red-subtle` fill and 4.14:1 on the row-hover fill — both under AA at this size — so the
> overdue red darkens along the same hue to `#b32d22` (4.86 on the pill, 6.33 on white, 5.52 on
> hover). The word "Overdue" and the triangle both carry the meaning, so the colour never has
> to.

**Every status is `Status/Solid` from the library** (DS Base `15380:114618`). All 45 pills in the
demo plus the grid's six audited in the DOM and uniform: `status/gap` 5,
`status/solid/padding-x` 5, `status/radius-s` 5, `status/medium-label-max-width` 200,
`Statuses/Semibold/Medium` 12/20/600, `status/solid/text` `#0b1528` on every fill, 20px tall.

Six deviations were found and fixed:

| | was | library |
|---|---|---|
| **icon** | a 15px glyph before the label | **none** — the label is the whole component |
| **casing** | sentence case, or caps typed into the copy | `text-transform: uppercase` on the component |
| text | three hand-picked tints — `#14520f` / `#6b3c05` / `#4b2d70` | one `status/solid/text` `#0b1528` |
| gap | 6 | `status/gap` 5 |
| padding-x | 8 | `status/solid/padding-x` 5 |
| ambiguous fill | `#edc7e9` — that is `status/solid/pink` | `status/solid/purple` `#dcc8f5` |

Dropping the icon costs nothing for the never-colour-only rule: every pill still carries a text
label. The glyphs remain where they are *not* Status — the callouts and the unsettled-contact
cell — and `I.amb`, which existed only for the pill, was deleted rather than left dead.

The node also resolved the two fills that had been derived, and both guesses can now be scored:
`status/solid/grey` is `#dce1eb`, which the `chip/solid/base` substitution had matched exactly;
`status/solid/red` is **`#f3bfb8`**, close to but not the `#f5c9c4` placed by luminance. Both are
now the real values, along with the rest of the palette (pink, blue, yellow, aqua, pastel-green,
red-subtle) in `tokens.ts`.

**`Status/Flat`** keeps `status/flat/bg` `#ffffff00` and `status/flat/padding-x` 0, and uses the
real token wherever it clears AA at 12px semibold on **both** white and the row-hover fill —
`status/flat/purple` `#7349aa` (6.44 / 5.61), `status/flat/grey` `#576581` (5.86 / 5.11). Two do
not, and stand in rather than being used:

- `status/flat/green` `#25861e` is 4.66 / **4.06** → COMPLETED uses `#14520f` (9.36 / 8.16)
- `status/flat/blue` `#367ca0` is 4.62 / **4.03** → IN PROGRESS uses brand `#1f6aac` (5.65 / 4.93)

- **Never colour-only.** Every status pairs an SVG icon with a text label — verified across all
  rows ("Matched · training complete", "Matched · training incomplete", "Ambiguous · needs
  review"), and in the coverage dashlet ("Fully covered", "1 not trained").
- **Counts are derived, not hardcoded, and the tiles are the filter.** Resolving the ambiguous
  row moves the tiles 6/2/1 → 7/2/0 and rewrites the audit Result line. **An emptied tile leaves
  entirely** rather than lingering greyed out — a disabled zero is still something to read past —
  and the auto-fit grid gives the space back to the tiles that remain. If that tile was the
  active filter when it emptied, the view falls back to All rather than showing a blank table.
- **The summary cards are `Card/Overview`** from DS - Advanced (node `14601:151877`): label on
  top in `Caption/Regular` (`card/overview/label-text`), then the value row — a 20px semantic
  glyph beside the count in `Headings/H3/Bold` (`card/overview/main-text`), `card/gap-x-1` 5
  between them, `card/overview/between-card-gap` 10 between cards. `card/border-width` is 2,
  and the resting card carries the two-layer `Card/Resting` shadow.
- **Each card carries its semantic accent** (node `14620:154155`), using
  `bg/accent/<hue>/solid/subtlest/{resting,hover,selected}` with the glyph *and the left rule*
  in that hue's `saturated/resting`. The rule is the component's `Highlighted=On` variant:
  `border-left: card/border-width (2px)` in the accent colour, and no border on the other
  three sides. The neutral card is `Highlighted=Off` — no rule.

  | card | accent | resting | selected | glyph |
  |---|---|---|---|---|
  | Delegated team members | — (neutral) | `#ffffff` | `#d0e5f6` | `card/overview/default-icon` |
  | Training complete | green | `#e9f3e9` | `#c0dcbf` | `#25861e` |
  | Training incomplete | orange | `#f9f0e7` | `#f2cea4` | `#d1862e` |
  | Needs clarifications | purple | `#f4eefa` | `#dcc8f5` | `#7349aa` |

- **Selected is a fill, not a ring.** The 2px brand outline is the component's separate *focus*
  variant and is deliberately not used — `Card/Selected` adds a same-colour 2px halo, which
  reads as weight rather than an outline. Hover also lifts, via `card/hover-shadow`
  (`0 17px 45px`). `card/disabled-opacity` 40 for an emptied card.

  The count is `Headings/H6/Semibold` (14/20) and the card pads at `sizes/gap/s` (10) — both
  read off the resting card variant (`14593:88467`) rather than guessed.

  **Contrast deviation.** On the accent *selected* fills the `#576581` label measures 3.97 / 3.95
  / 3.80:1 (green / orange / purple) — under AA. The DS backgrounds are kept exactly; only the
  label darkens to `card/overview/main-text` when a card is selected, which takes it to ~12:1.

  Two more deviations, both because the DS card assumes a one-word label like "Completed":
  `card/overview/{min,max}-width` (100/150) would wrap "Delegated team members" over three
  lines, so the grid keeps a 180px minimum; and the card's internal padding has no token in
  that map, so it stays at 11/14.
- **The report has no visible heading or meta line** — inside the app the doc header already
  names the document. The `<h1>` is kept visually hidden so the standalone page still has a
  top-level heading, and the run timestamp lives in the change log's "Run at" row rather than
  being repeated on screen.
- **Real confirmations.** "Assign training" / "Query the site" disable both, flip the clicked one
  to a success state, print a specific message, and add an "Action taken" audit line.
- **Re-run lives in the app's action toolbar**, not inside the report. While the Training Requirements
  is showing, the toolbar carries that single action; the PDF actions (Start Page Manipulation,
  Open in New Window, More) are hidden. It reloads the report iframe, so the check genuinely
  recomputes — expanded rows collapse, counts return to 7/1/0, and any action taken is cleared.
- **WCAG AA basics.** Visible `:focus-visible` rings, keyboard-reachable controls,
  `aria-expanded` on row disclosures, `aria-pressed` on filters, an `aria-live` region, and a
  `prefers-reduced-motion` guard.

**Status is two columns, not one** — matching how the platform reports training elsewhere:

- **Training status** is `Status / Flat` (`status/flat/bg` `#ffffff00`, `status/flat/padding-x` 0)
  — a text-only status with no pill, in `Statuses/Semibold/Medium` 12/20/600, uppercased, with
  the date behind it beneath in `Caption/Regular`. COMPLETED / IN PROGRESS / NOT STARTED /
  PENDING. Uppercasing the word is what keeps this from being colour-only.
- **Training progress** is `Graphics/Progress Bar/Small` — `progress-bar/small/height` 10,
  `progress-bar/radius` 100, `progress-bar/main-bg` `#dce1eb` track, `progress-bar/small/gap` 5
  to the label row, then `100%` in `progress-bar/small/label-text` on the left and `5 of 5` on
  the right. The fill is banded by the `progress-bar/{10,11-99,100}-percent-track-bg` variables.

  **One task, one training.** The denominator is the delegated tasks that actually have a course
  linked — the same number the Required training column shows, so the two agree by construction
  and the gap between the duty chips and that number is exactly the tasks with no course. An
  earlier pass counted training *modules* (31 of 31, 44 of 44); it made the bar look varied but
  the numbers answered a question nobody asked of a delegation log.

  **Status is held per course, not per task.** `missing` is written per task, but two tasks can
  share one course, so an outstanding course makes *both* tasks outstanding — `missingCourses()`
  derives that. Without it the same course rendered "Complete" on one row and "Not completed" on
  the next for the same person. `trainingFor` reads through `dutyState` for the same reason, so
  the bar can never disagree with the rows underneath it; verified across all nine people.

- **Contrast.** The saturated green `#25861e` measures 4.66:1 on white but 4.06 on the row-hover
  fill and 3.60 on selected — under AA for 12px semibold. COMPLETED therefore uses `#14520f`,
  the green the DS already uses for text on its green status pill, which clears every background
  a row can take (9.36 / 8.16 / 7.23). IN PROGRESS and PENDING pass unchanged (4.93 / 5.61 at
  worst).

**An unsettled contact leads with the orange warning triangle**, the same mark an outstanding
course carries, so "2 possible matches" and "No contact found" read as problems at a glance
rather than as ordinary text.

**Type is audited against the DS Base scale**, not eyeballed. Every text style in the demo now
computes to one of the thirteen DS Base combinations — Body/{Regular,Semibold,Bold} 14/20,
Caption/{Regular,Semibold,Bold} 12/15, Statuses/Semibold/{Medium 12/20, Small 10/15},
Table/Header 12/15/600, Table/Cell/Regular 14/20/400, Headings/H5 16/20, H4 18/30, H3 20/30,
H1 28/40 — verified by walking every element with a text node and comparing computed
`font-size/line-height/font-weight` plus family against that set. Two real bugs surfaced:

- **`font: 600 14px/20px inherit` is invalid CSS.** `inherit` is not a family name, so the whole
  shorthand was dropped: every `.btn` rendered in **Arial 13.33px/normal/400**, and every status
  pill at 14/20/400 instead of Statuses/Semibold/Medium 12/20/600. Both are now longhand.
- **Form controls don't inherit `font-family`.** `.clink` is a `<button>` that never set one, so
  the contact links were rendering in Arial while measuring on-scale for size and weight — which
  is why only a family check caught it. A `button,input,select,textarea{font-family:inherit}`
  reset fixes that whole class of bug.

Nine other declarations were off-scale by a line-height or two (12/16, 12/17, 13/19, 12/18) and
were snapped to the nearest real style. The audit now reports zero problems.

**Placeholder data.** The 9 people, contact IDs, training module names, timestamps and record ID
are invented sample data. Product framing is deliberately generic (document module / contacts
module / training module) — no real company or product names.

**Preview chrome.** While the Training Requirements is showing, the QV rail, QV panel, editor ribbon,
viewer tool strip and page footer are hidden, and the action toolbar swaps to the report's single action —
these are all document-preview affordances, and the report is a full-width read.

**Panel width.** The QV panel is `33.3333vw` — a third of the window — rather than the DS's
fixed `qv-panel/width` (600). `qv-panel/{min,max}-width` are kept as clamps, so it is exactly a
third between roughly **1200px and 2700px** of window width and pins to 400 / 900 outside that.
Measured: 1920 → 640, 1400 → 467, 1100 → 400 (clamped).

**The document.** `public/DOA.pdf` is the supplied Delegation of Authority log, served at
`/DOA.pdf` and shown in an `<iframe>` with `#toolbar=0&navpanes=0` so the browser's own PDF
chrome doesn't compete with the viewer's. It is a **single page**, so the footer reads
"Page 1 of 1" rather than the frame's "Page 1 of 8".

## Known deviations from the frame

1. **Row status glyphs** (flag / link / comment / record) have no dedicated variables in the
   frame's map; they are mapped to `text/informational`, `text/discover`, `text/confirmation`
   and `text/brand-saturated`.

### Resolved

**Toolbar background and buttons.** `toolbar/bg` really is `#e5f1fb` — confirmed against the
Toolbars component in DS - Base (node `11403:85686`), which also corrected the buttons:

| | was | is (`Button/Flat`, `Button/Outline/Secondary`) |
|---|---|---|
| flat label | `#0b1528` dark | `button/flat/primary/resting-text` `#1f6aac` — tone applies to icon **and** label |
| flat box | height 30, padding 0/5 | `button/flat/padding-y,-x` = 1/2, `gap` 5, glyph 15 in a 20px box |
| trailing icon button | white bg, `#dce1eb` border | `button/outline/secondary` — transparent, `#d0e5f6` border |

`button/flat/{success,error}/resting-text` (`#25861e` / `#d23c2d`) are in `tokens.ts` for the
Save/Cancel toolbar variants.

**Grid.** Corrected against Table in DS - Advanced (node `86:208584`):

| | was | is |
|---|---|---|
| row hover | `#f8faff` (page bg) | `table/cell/hover-bg` `#e5f1fb` |
| row selected | **missing** — checking a box changed nothing | `table/cell/selected-bg` `#d0e5f6`, selected beats hover |
| glyph column | auto width, rendered 65px | `table/column-4-icon-width` 95 |
| fixed columns | `width` only, shrunk by `table-layout: auto` | `width` + matching `minWidth` |

Row height was already correct: **45px** rows (`table/cell/medium-min-height`) and a **40px**
header row (`table/header/height`), both measured. `table/cell/{small,large}-*` (35/0 and
55/10) and `table/cell/qv-selected-*` are in `tokens.ts` for other densities and states.

**Row actions "···" button** — `Button/Outline` tertiary, per DS - Advanced node `86:208952`.
Applied uniformly to every row (`RowActionsButton` in `DocumentGrid.tsx`):

| | was | is |
|---|---|---|
| fill | white | `button/outline/tertiary/resting-bg` — **transparent**, so the row tint shows through |
| border | `#d0e5f6` (secondary) | `button/outline/tertiary/resting-border` `#dce1eb` |
| sizing | hardcoded 30×24 | padding 5 (`iconbtn-medium-padding-x` / `medium-paddings-y`) around a 20px icon box holding a 15px glyph → 32×32 |
| elevation | — | **none** |

The transparent fill is the load-bearing one: with the old white fill the button punched a
hole through the row's hover and selected tints.

> **Codegen caveat.** Figma's `get_design_context` emits a `drop-shadow-[…]` bound to
> `button/solid/resting-shadow-*` on the Button/Outline wrapper (nodes `86:208952`,
> `86:209151`), but that effect is **disabled** on the component — the rendered component is
> flat. The codegen prints bound effects whether or not they are enabled, so check the render
> or the screenshot before applying one. `button.solidShadow` stays in `tokens.ts` for the
> variants that genuinely carry it.

**Top header.** Corrected against Header Top in DS - Advanced (node `86:154743`):

| | was | is |
|---|---|---|
| bar background | white | `header-top/bg` `#f2f4fa` |
| actions | static | `Button/Flat` primary: hover `#d0e5f6`, pressed/selected `#5391c6` + white glyph |
| action icon box | 20 | `header-top/action/icon-size` 30 |
| crumb value | Body/Semibold 600 | `Buttons/Medium-Link` 14/20 **400** |
| end crumb | same as others | Body/Semibold + `header-top/crumb/end-crumb-text`, no caret |
| role | plain text beside avatar | `Status` small solid orange (`status/solid/orange`, 10/15 600), overlapping the avatar by `header-top/action/role-gap-xs` (−5) |

**Crumbs.** Rebuilt to the real `Crumbs` / `Top Header/Crumb` anatomy (nodes `2326:197559`,
`86:154864`). The whole crumb strip is **base-toned, not brand blue** — this was the main error:

| | was | is |
|---|---|---|
| crumb value | `#0b1528` | `button/link/base/resting-text` `#576581` |
| crumb caret | `#1f6aac` | `button/flat/base/resting-text` `#576581` |
| "TI" logo text | blue, Body/Bold | `#576581`, `Buttons/Medium-Link` 14/20 400 |
| home icon | `#1f6aac` | `#576581` |
| dividers | separate siblings | each crumb owns its leading `Top Header/Crumb/Line` |
| structure | flat label/value stack | Line + Value → Container (label) → Entity row (value · offering chip · caret) |

Only two things stay brand-colored: the app-grid action (`header-top/action/icon`) and the
logo mark. The end crumb is the one dark item (`header-top/crumb/end-crumb-text`).

`Crumb` also takes an optional `offering` prop rendering the `Chip/Solid` base badge
(`chip/solid/base/resting-bg` `#dce1eb`, round radius 100, `Caption/Semibold`) — present in the
component, unused on this screen.

**Documented constraint.** The Figma description on `Top Header/Crumb` (`86:154864`) states:
*"The maximum entity title length is 21 symbols after which it should be truncated."*
Implemented as `truncateEntityTitle` against `header.entityTitleMaxChars`; the full value stays
in the `title` attribute. No current crumb value exceeds 21 characters, so it is not visibly
exercised by the sample data.

**Selected rail item** was briefly implemented as a white block with a brand glyph, read off a
low-resolution render of the product frame. The Navigation component in DS - Advanced
(node `86:184835`) settles it: the glyph is `navigation-main/item/icon-container/icon`
(`#ffffff`) in *every* state and never inverts, and the fill is

| state | variable | value |
|---|---|---|
| resting | `navigation-main/item/resting-bg` | transparent over `navigation-main/bg` |
| hover | `navigation-main/item/hover-bg` | `#164b7a` |
| selected | `navigation-main/item/selected-bg` | `#113a5f` |

The 2px `#5391c6` `icon-container/level-border` is the 2nd-level accent bar on the expanded
(240px) rail and does not apply to these collapsed 1st-level items. The "alter" (light) theme
values are in `tokens.ts` as `color.navAlter*` for when the light rail is needed.

The frame's own header reads "5 Documents" above six rows; both are reproduced as designed
(`DOCUMENT_COUNT` and `DOCUMENTS` in `src/documentsData.ts`).
