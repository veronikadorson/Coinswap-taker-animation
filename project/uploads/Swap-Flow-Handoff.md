# Coinswap Taker — Swap Flow Handoff

> Paste this as the first message of a new chat to continue work on the **Swap flow** (Initiate Swap → Swap Progress → Swap Success). Everything below describes only this flow and the design system pieces it relies on.

---

## 1. Design system context

The app is a desktop Bitcoin wallet — Coinswap Taker — rendered inside a macOS-styled rounded shell with traffic lights, mono titlebar, and a collapsible sidebar. Aesthetic is dark, dense, terminal/CLI heritage. Audience is Bitcoin-native power users.

### 1.1 Color palette

Wallet pages use **orange** as primary; the Swap flow remaps that token to **blue** so the three Swap screens read as a distinct sub-system. Semantic colors (green/red/amber/purple) stay constant across both.

| Token | Hex | Used for |
|---|---|---|
| `--bg` | `#08080a` | Body bg behind the shell |
| `--surface-1` | `#101014` | Shell + sidebar inner surface |
| `--surface-2` | `#16161a` | Cards |
| `--surface-3` | `#1c1c22` | Inset rows, picker section containers, fee block, auto-note |
| `--surface-4` | `#1f1f25` | Row hover |
| `--border` | `rgba(255,255,255,0.08)` | Default 1px border |
| `--border-strong` | `rgba(255,255,255,0.14)` | Hover border, ghost button border |
| `--text` | `#f5f5f7` | Primary text |
| `--text-2` | `#a7a7ad` | Secondary text, addresses |
| `--text-3` | `#6c6c72` | Tertiary, mono caps eyebrow, dim values, captions |
| `--orange` (Swap remap) | `#5b8def` | Swap-flow primary: buttons, active states, accents, sidebar active, ETA pill, "You receive" green stays separate |
| `--orange-hover` (Swap remap) | `#7da3f5` | Hover state for primary |
| `--green` | `#2fbf71` | Success, "Received", "Settled", "You receive" amount, Swappable Balance value/accent |
| `--red` | `#ff4d5a` | Outgoing only |
| `--amber` | `#ffb547` | Warning, HTLC-locked, unconfirmed, "Outgoing Contract" accent line, hop=2 warn |
| `--blue` | `#5b8def` | (Same as primary on Swap pages) — explicitly used for SegWit pill, in-progress state |
| `--purple` | `#a979ff` | Taproot pill only |

**Tinted recipe** — for every brand/semantic color the pill/badge/banner pattern is fixed:
`background: rgba(token, 0.10–0.14); border: 1px solid rgba(token, 0.25–0.30); color: var(--token);`

**Gradients** — disallowed except for the hero balance card bg and progress bar fill (`linear-gradient(90deg, var(--orange) 0%, var(--orange-hover) 100%)` with `box-shadow: 0 0 12px var(--orange)`).

### 1.2 Typography

```css
--f-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
          'Helvetica Neue', Helvetica, Arial, sans-serif;
--f-mono: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas,
          'Liberation Mono', monospace;
```

`font-feature-settings: "ss01", "cv11"` on at body level.

**Rule:** mono for any **data-shaped** content (addresses, txids, BTC/sats + unit suffix, eyebrows, counts, pills, timestamps, formulas, log lines). Sans for UI chrome (page titles, card titles, button labels, body copy, hint text).

| Use | Size · weight · letter-spacing · family |
|---|---|
| Page H1 ("Initiate Swap", "Swap Completed") | 34px · 700 · -0.035em · sans |
| Hero amount (Swap Success, animation) | 54px · 700 · -0.035em · mono |
| Section h2 / Swap Summary | 28px · 600 · -0.025em · sans |
| Modal title | 18px · 600 · -0.02em · sans |
| Card h3 / Summary card title | 15px · 600 · -0.01em · sans |
| Section title inside card (`.fld-label.section`) | 13px · 500 · 0.06em uppercase · sans |
| Body / nav | 13px · 500 · -0.005em · sans |
| Button | 12.5px · 600 · sans |
| Filter / tab label | 11.5px · 500 · sans |
| Mono data value (SRow, FeeRow) | 12.5–13px · 500 · mono |
| Mono eyebrow / section label | 10.5px · 500 · 0.10em uppercase · mono |
| Pill / status / count | 9.5px · 500 · 0.04–0.06em uppercase · mono |
| Hint / caption (default) | 10.5px · mono · `--text-3` |
| Hint / caption (error) | 10.5px · mono · `--amber` |

Line-height defaults: 1.1 for display/hero, 1.5 for body, 1.45 for warning/log lines.

**Italic accent rule** — wrap the last word of a welcome H1 in `<span class="accent">` (orange italic 600). Swap Success uses `<span class="accent-success">Completed</span>` (green, non-italic) as the only deviation. Don't italicize anywhere else.

### 1.3 Spacing & grid

No formal 4-/8-px scale; the values in active use are:
`4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 40 · 54 · 62`. Treat this as the de-facto scale.

Shell geometry:
- Body padding: `28px 24px 32px`
- Shell width: `min(1320px, 100%)`, radius 24, border 1px `--border`
- Sidebar: 68px collapsed / 200px expanded, `transition: 0.3s ease`
- Titlebar: 42px tall, absolute
- Main padding: `62px 28px 28px`, vertical gap `18px`

Swap-page grid: `1fr 360px`, gap `14px` (right column fixed). Stacks at `≤1100px`.

### 1.4 Borders & radii

| Token | px | Where |
|---|---|---|
| `--r-sm` | 8 | Inputs |
| `--r-md` | 12 | Input wraps, fee block, picker section containers |
| `--r-pill` | 999 | Buttons, filter tabs, eyebrow chips, ETA pill |
| (ad-hoc) | 24 | Shell |
| (ad-hoc) | 18 | Balance card, modal |
| (ad-hoc) | 14 | Card, summary card |
| (ad-hoc) | 10 | Row, nav item, hop button, warn banner |
| (ad-hoc) | 7 | Icon button |
| (ad-hoc) | 6 | Pills |

Cards never carry a drop shadow — only the **shell** does:
```css
--shell-shadow:
  0 1px 0 rgba(255,255,255,0.05) inset,
  0 40px 120px -20px rgba(0,0,0,0.7);
```

Everything else is delineated by 1px borders.

### 1.5 Locked components (Swap-flow inventory)

These are already implemented in `swap.css` and used across all three swap screens. Don't recreate; reuse.

| Component | Selector | Spec |
|---|---|---|
| **Shell + Titlebar + Sidebar** | `.shell.expanded`, `.titlebar`, `.sidebar`, `.nav a` | macOS chrome, mainnet pip top-right, collapsible 68/200 sidebar. Swap nav item is active on all three swap screens. |
| **Page head** | `.page-head h1`, `.subtitle` | 34/700/-0.035em sans + 13/`--text-2` subtitle |
| **Primary button** | `.btn` | 40px tall · `0 20px` · pill · bg `--orange` · `+translateY(-1px)` on hover. Disabled: bg `--surface-3`, text `--text-3`. |
| **Ghost button** | `.btn.ghost` | transparent · 1px `--border-strong` · no transform on hover |
| **Block button** | `.btn.block` | full-width, 46px (Swap CTA) / 48px (Back to Swap) |
| **Card** | `.card` (head/body/foot) | `--surface-2`, 1px `--border`, radius 14, no shadow |
| **Balance card** | `.bcard` + variant | 2px left accent-line, mono caps label, mono value (28px/54px hero), sentence sub. **No icons. No vertical labels.** Variants: `.green` (Swappable), `.blue`, `.orange`, `.amber`, `.white`, `.purple` |
| **Pills/badges** | `.pill.taproot`, `.pill.segwit` | tinted bg + tinted border + colored text. 9.5px mono caps. |
| **Sats/BTC seg toggle** | `.seg` (`#unitSeg`) | pill container with 2 buttons, active = solid `--orange` bg + white |
| **Auto/Manual link toggle** | `.am-links` | two text links separated by faint `/`, active link has 1.5px brand underline |
| **Hop button** | `.hop-btn` | 5-col grid, 10px radius, mono 18/600 number + 9.5px caps sub. Active = solid brand. |
| **Warning banner** | `.warn-banner` | amber tint, 10px radius, mono 11.5px with `<strong>WARNING:</strong>` lead |
| **ETA pill** | `.eta` | blue-tinted pill, mono 11.5px, 9.5px caps label |
| **Fee block** | `.fee-block`, `.fee-row` (`.total`) | surface-3 inset, dashed dividers, `.total` row has solid top border + larger value in brand color |
| **Receive strip** | `.receive` | green-tinted highlighted row at bottom of summary card |
| **Modal** | `.modal-backdrop` + `.modal` | `rgba(0,0,0,0.62)` backdrop + 2px blur, 480px wide, radius 18, opens 0.2s opacity + transform |
| **Icon button** | `.icon-btn` | 26×26, 7px radius, transparent default; hover = `rgba(255,255,255,0.04)` bg + `--border` + `--text` |
| **Picker section** | `.picker-section`, `.picker-section-body` | new outlined container for UTXO/Maker picker; `--surface-3` bg, 1px `--border`, 12px radius, padding `14px 16px 16px` |

### 1.6 Iconography

- Style: **stroke** SVG only, `currentColor`, `stroke-linecap/linejoin: round`.
- Stroke width: 1.6 for chrome/sidebar/info; 2 for actions (refresh, copy, mempool, modal close); 3 for the green success check.
- Sizes: 9–11px inline link arrows · 12–13px icon buttons / modal close · 14px button icons · 16px sidebar nav · 22–24px hero / animation nodes.
- **Banned placements:** inside balance cards (`.bcard .label`), inside filter tabs, inside pills/badges, anywhere as decorative filler. Allowed: sidebar nav, refresh, copy, external/mempool, view-all chevron, modal close, animation nodes, success check.

### 1.7 Motion

| Duration | Use |
|---|---|
| 120ms | Icon-button hover |
| 150ms (default) | All bg/border/color transitions on buttons, nav, rows, tabs |
| 200ms | Modal open/close (opacity + transform) |
| 300ms ease | Sidebar collapse/expand |
| 400ms | Refresh icon rotate (60deg) |
| 2400ms ease-in-out infinite | Status pip pulse, success ripple |

Easing primitives bundled in `animations.jsx` (for Swap Progress only): `easeOutCubic`, `easeOutBack` (entrances), `easeInOutCubic` (travel), `easeInCubic` (exits).

**Interaction principles:**
- Primary button hover lifts 1px. Ghost button hover never lifts.
- Refresh button: icon rotates, parent doesn't lift.
- Filter tabs/nav/rows: color+bg crossfade only.
- Modal enters with `0.98→1` scale + 8px translate-up.

---

## 2. Flow overview

**What it does.** Lets a user route a private Bitcoin swap through 1–N maker peers over Tor. The user picks an amount, source UTXOs, makers, and a hop count; submits; watches the routing animate; lands on a settlement summary.

**Who it's for.** Bitcoin-native power users who care about routing details, can read txids, understand fidelity bonds, and want to inspect on-chain contracts and fees after the fact.

**Where it sits.** Sidebar item `Swap`. Reachable from any wallet page or from the Market page's "Swap with selected makers" handoff.

**Entry points:**
1. Sidebar **Swap** link → starts at Swap.html with default state (Auto UTXOs, Auto Makers).
2. Market page **"Swap with selected makers"** button → stores selected `.onion` addresses in `localStorage['coinswap:selectedMakers']` and navigates to Swap.html. Swap.html reads the key on mount, auto-flips the Makers section to **Manual**, and pre-checks those makers.

**Exit points:**
1. **Start Swap** (only enabled when validation passes) → SwapProgress.html.
2. SwapProgress.html runs 18s of animation, then `setTimeout(18500ms)` auto-navigates → SwapSuccess.html. (No user input required during the animation.)
3. SwapSuccess.html **Back to Swap** → clears the maker handoff key and returns to Swap.html with a fresh state.

**Primary user goal.** Submit a privacy-preserving swap with confidence — they should always see, on one screen, exactly which UTXOs fund the swap, which makers will route it, the hop count, the estimated time, the fee breakdown, and what they'll receive at the end.

---

## 3. Screens in this flow

### 3.1 Swap.html — Initiate Swap

**Purpose.** Configure a swap. All inputs live on one screen; user clicks one button at the bottom.

**Layout.** Two-column grid `1fr 360px`, gap 14. Stacks at `≤1100px`.

```
PageHead          H1 "Initiate Swap" · subtitle "Route a private Bitcoin swap through multiple makers over Tor."

Left card (Initiate Swap)
  ├── Section: Amount to Swap
  │     • Hint (mono 10.5px text-3): "Enter the amount you want to send through the swap."
  │     • Amount input + inline Sats/BTC seg toggle
  │     • amt-meta row: "= 0.00000000 BTC" (left) · "Use max swappable: 1,248,300 sats" (orange link, right)
  │
  ├── Section: Select UTXOs            ← outlined picker-section container
  │     section title (right meta: "Auto · 3 selected")
  │     ├── Auto / Manual link toggle
  │     ├── auto-note (visible only in Auto mode):
  │     │     "Wallet picks UTXOs to minimize change" · "3 UTXOs · 1,248,300 sats"
  │     └── manual panel (visible only in Manual mode):
  │           "Pick UTXOs to fund the swap" · "Total: N sats"
  │           checkbox list of UTXOs (id · script-pill · sats)
  │
  ├── Section: Select Makers           ← outlined picker-section container
  │     section title (right meta: "Auto · 3 selected")
  │     ├── Auto / Manual link toggle
  │     ├── auto-note (Auto only): "Wallet picks good makers from the market" · "3 makers from 8 candidates"
  │     └── manual panel (Manual only): "Pick makers to route the swap" · "Selected: N makers"
  │           checkbox list of makers (tor · "Fee 0.030" · "0.180 BOND")
  │
  ├── Section: Number of Hops
  │     section title (right meta: "3 makers required")
  │     warn banner: "WARNING: If swap with only one maker, the maker can deanonymize you. Recommended minimum hop = 2."
  │     5 hop buttons: 2 · 3 (active default) · 4 · 5 · 6+ (Custom)
  │     hop-help (mono 10.5 text-3): "More hops = better privacy, higher fees."
  │     hop-help (when 2 hops): amber + alert-triangle icon: "With 2 hops, a colluding maker could deanonymize the swap. 3+ is recommended."
  │
  ├── Start Swap button (.btn.block) — disabled by default
  └── ctaHint (mono 10.5 text-3, centered): "Enter an amount to begin"

Right column
  ├── Swappable Balance card (.bcard.green-style; accent-line + value are blue via flow remap; sub line "≈ 0.01248300 BTC")
  └── Swap Summary card
        ├── head: h3 "Swap Summary" + ETA pill ("Estimated Time · — : —")
        ├── body: SRows (Swap amount · Hops · Makers · Top maker candidates · Funding tx · Avg tx size)
        ├── fee-block: maker fee + network fee (with sat/vB sub) + total
        └── receive strip: "You receive" · green 22/600 value
```

**States:**

| State | Behavior |
|---|---|
| Default load | Sats unit, Auto UTXOs (3 selected from wallet), Auto Makers (3 from pool), 3 hops, amount=0, **CTA disabled** with hint "Enter an amount to begin" |
| Load with localStorage handoff | Makers section opens in **Manual** with the incoming `.onion` set pre-checked. UTXOs stay Auto. |
| Amount valid (≤ swappable, manual selections cover amount if Manual) | CTA enabled. ctaHint shows "Routing N sats through H hops". |
| Amount exceeds swappable | CTA disabled. Amount hint turns amber: "Amount exceeds swappable balance". ctaHint mirrors. |
| Manual UTXOs but none selected | CTA disabled with "Pick at least one UTXO". |
| Manual UTXOs selected < amount | CTA disabled with "Selected UTXOs are less than swap amount". |
| Manual Makers but none selected | CTA disabled with "Pick at least one maker". |
| 2 hops selected | Hop-help flips to amber warning (above). Form still submittable. |
| Loading wallet balances (real RPC) | `[future]` Replace Swappable Balance value with skeleton; CTA shows "Loading wallet…" hint. |
| Wallet locked | `[future]` Inline red caption + CTA disabled with "Wallet locked · Unlock to swap". |

**Microcopy:**
- Hint above amount input: `"Enter the amount you want to send through the swap."`
- Max link: `"Use max swappable: 1,248,300 sats"` (or BTC equivalent based on unit)
- Warn banner: `WARNING: If swap with only one maker, the maker can deanonymize you. Recommended minimum hop = 2.`
- Hop help (default): `"More hops = better privacy, higher fees."`
- ETA pill label: `"Estimated Time"`
- Receive strip label: `"You receive"`
- CTA states: `"Enter an amount to begin"` / `"Routing N sats through H hops"` / `"Amount exceeds swappable balance"` / `"Pick at least one UTXO"` / etc.

**Tweaks panel** (toolbar Tweaks toggle):
- Auto-note when Manual is selected → `Hide` (default) / `Show`. When set to Show, the "Wallet picks…" boxes stay visible in Manual mode.
- Default unit → Sats / BTC
- Default hop count → 2 / 3 / 4 / 5
- Primary color → 4 swatches (blue default, orange, green, purple); live-updates `--orange` + `--orange-hover` via lightening helper

The tweaks are wired via the host edit-mode protocol; values persist in the file's `EDITMODE-BEGIN/END` JSON block.

**Transition to next screen:**
Click Start Swap (only if not disabled) → `window.location.href = 'SwapProgress.html'`. No transition animation between pages.

---

### 3.2 SwapProgress.html — Swap routing animation

**Purpose.** Visualize the swap as it executes. Pure presentation — no controls, no user input during the 18-second run.

**Layout.** Fixed 1920×1080 stage that auto-scales to viewport via the bundled `animations.jsx` engine (Stage component). Black letterboxing outside. Built with Babel-in-browser; ports to a JSX file at build time.

```
Background: dark bg + faint dot grid + radial blue glow
Chrome:     "C" brand mark + Coinswap wordmark (top-left) · Mainnet pip (top-right)
TopBar:     eyebrow "Step N of 5 · Swap in progress"
            phase title (52px sans 700) with a colored trailing period
            420px progress bar with gradient fill + blue glow
Connectors: 4 horizontal lines between the 5 nodes; fill animates per phase
TorCircuits: 3 curved SVG arcs from You → each Maker, briefly during phase 2
Nodes:      5 cards (You · M1 · M2 · M3 · Receiving)
              each card has icon + type chip + label + sub + status pill
              status pill cycles through tones: dim → blue → amber (HTLC-locked) → green (done)
              check or lock icon appears next to the pill when relevant
CoinPackets: glowing dots traveling between nodes during funding (6–9s) and routing (10–14s)
ActivityLog: bottom-center mono panel with rolling 6 lines
              cols: timestamp (mono 11.5) · [tag] (signal-color caps) · message
BottomStrip: 5-stat bar — Amount · Hops · Fee · You receive · ETA (countdown)
SuccessBurst: at t≥15s — concentric ripple rings from the Receiving node + "Swap complete" badge
```

**Phases (timeline keyframes):**

| t | Phase | What happens |
|---|---|---|
| 0–3s | Initiating | 5 nodes pop in left→right with `easeOutBack`. Log lines populate (`init`, `wallet`, `market`). |
| 3–6s | Establishing Tor circuits | TorCircuits arcs draw with traveling dots; connectors fill; nodes flip to blue→amber→green. |
| 6–9.5s | Funding HTLC contracts | 3 CoinPackets fly You→M1, You→M2, You→M3 in sequence; each maker shows a lock icon + amber "HTLC locked" pill. |
| 9.5–14s | Routing atomic swap | One CoinPacket hops down the chain (You→M1→M2→M3→Dest), each maker turns green with check icon when forwarded. |
| 14–18s | Finalizing | Receiving node flips to green "Received"; preimage propagates; ripple rings emerge from Receiving node; "Swap complete" badge fades in. |

**States:**

| State | Behavior |
|---|---|
| Default playback | 18s, non-looping. Starts from `t=0` every time (`localStorage['swap-progress:t']` cleared on mount). |
| Auto-navigate complete | `setTimeout(18500ms)` → `window.location.href = 'SwapSuccess.html'`. |
| User scrubs via scrubber | Engine allows seeking; auto-navigate still fires at 18.5s real time. |
| User refreshes mid-run | Resets to t=0; auto-navigate timer restarts. |
| Network error mid-swap | `[future]` TopBar flips to red status, nodes freeze at last state, Retry button surfaces, auto-navigate cancelled. |
| Maker rejection | `[future]` Offending node turns red, log shows reason, "Resume with different maker" appears. |
| `prefers-reduced-motion` | `[MUST ADD]` Render final frame statically; skip ripples, packets, and traveling dots. Still auto-navigate after a delay. |

**Microcopy:**
- Phase titles: `"Initiating"` · `"Establishing Tor circuits"` · `"Funding HTLC contracts"` · `"Routing atomic swap"` · `"Finalizing"`
- Log tag tokens: `[init] [wallet] [market] [tor] [handshake] [tx] [hop] [preimage] [complete]` — each tag has its own signal color
- Stat strip labels: `Amount · Hops · Fee · You receive · ETA`
- Final badge: `"Swap complete"` (mono caps 12px, green tinted pill)

**Transition to next screen:**
Hard navigation via `setTimeout(18500ms)` in inline `<script>` in `SwapProgress.html`. No back button; if user navigates away mid-animation, the timer is lost.

---

### 3.3 SwapSuccess.html — Settlement summary

**Purpose.** Reassure: the swap settled, here are the artifacts and the cost. Give the user something they can verify on-chain and copy for records.

**Layout.** Two-column grid `1fr 380px`, gap 14. Stacks at `≤1100px`.

```
Main has a soft radial green glow on the top center (.success-glow ::before)

PageHead
  ├── SuccessCheck — 48×48 box, green tinted, 24px stroke-3 check svg.
  │     A ripple ring animates around it (scale 0.9→1.35, 2.4s infinite).
  └── H1 "Swap Completed" — last word wrapped in <span class="accent-success"> (green)
        SuccessMeta line: "Settled" green pip + "·" + mono caps "Session 7fa2e1c8 · Block 824,517"

Left card (Swap Summary)
  ├── card-body
  │     ├── sec-title (sans 15/600): "Swap Summary"
  │     ├── AmtHero
  │     │     "Amount Swapped" label (mono caps 10.5)
  │     │     54px mono 700 value with "sats" unit small
  │     │     sub: "≈ 0.04955000 BTC"
  │     │     DurationPill (blue tinted): clock icon · "Duration" caps · "2m 47s"
  │     ├── ContractBlock
  │     │     sec-title "Transaction Artifacts"
  │     │     Contract.in (green accent-line, arrow-down-left icon, "Incoming Contract", copy + mempool buttons, full txid mono 12 word-break:break-all)
  │     │     Contract.out (amber accent-line, arrow-up-right icon, "Outgoing Contract", same actions, full txid)
  │     └── PartnersBlock
  │           sec-title with right-side count: "Swap Partners · 3 makers"
  │           3 PartnerRows: "MAKER 0N" label (60px) · truncated tor · "View" ext-link
  └── card-foot
        Ghost button "Export report" with download icon, full-width

Right column
  ├── Card "Fee Details"
  │     "Maker fees · 2,550 sats"
  │     "Mining fees · 308 sats"
  │     ".total — Total fee · 2,858 sats (sub: 0.00002858 BTC)" (value blue, 22/600)
  │     fee-pct-strip (blue tinted): "Of swap amount · 0.058%"
  └── Back to Swap button (.btn.back-btn — primary blue, 48px block)
```

**States:**

| State | Behavior |
|---|---|
| Default | Static success page; ripple animates indefinitely. |
| Copy txid clicked | `navigator.clipboard.writeText` with `execCommand('copy')` fallback. Button icon flips to check, button gets `.copied` class (green tint) for 1400ms, then reverts. |
| Export report clicked | `[stub today]` Button briefly shows "Report ready" with check icon for ~1800ms. **TODO:** wire to actual JSON/PDF download. |
| Back to Swap clicked | Clears `localStorage['coinswap:selectedMakers']` and navigates to Swap.html. |
| Mempool external links clicked | Open in new tab. **MUST ADD:** `target="_blank" rel="noopener noreferrer"` + aria-label. |
| Mempool link offline | `[future]` `aria-disabled="true"`, don't navigate. |
| `prefers-reduced-motion` | `[MUST ADD]` Disable ripple animation; render the check static. |

**Microcopy:**
- H1: `"Swap Completed"` (Completed = green)
- Meta: `"Settled · Session 7fa2e1c8 · Block 824,517"`
- AmtHero label: `"Amount Swapped"`, sub `"≈ 0.04955000 BTC"`
- DurationPill: `"Duration · 2m 47s"`
- Contract labels: `"Incoming Contract"` (in), `"Outgoing Contract"` (out)
- Section titles: `"Transaction Artifacts"`, `"Swap Partners · N makers"`
- Fee rows: `"Maker fees"`, `"Mining fees"`, `"Total fee"`, footer strip `"Of swap amount · 0.058%"`
- Buttons: `"Export report"` (ghost), `"Back to Swap"` (primary)

**Transition out:** Back to Swap → Swap.html (fresh state). No forward path defined for this screen — it's a terminal state.

---

## 4. Decisions and rationale

### 4.1 Two-column form

Configure on the left, live summary on the right. Chosen over a wizard because power users want every variable visible at once and a constantly-updating cost preview. The 360px right column is wide enough for a 28px hero value and never wraps below 1100px.

### 4.2 Picker as two separate outlined sections (not tabbed)

Earlier iteration used tabbed picker (Select UTXOs ⇄ Select Makers). User pushed back: tabbing hid information. Decision: two stacked sections inside `--surface-3` outlined containers (12px radius, 1px border, `14px 16px 16px` padding). Both visible at all times.

Rationale: power users want to scan both pickers without clicking. The visual outline gives clear scope without using heavy color. Container bg is `--surface-3` to nest cleanly inside the `--surface-2` card.

### 4.3 Auto / Manual = text-link toggle (not segmented button)

The single Auto/Manual control became `Auto select / Manual select` text links separated by a faint `/` with a brand underline under the active link.

Rationale considered and rejected: segmented button grid (felt too heavy for a binary mode switch); single dropdown (hid the second option). Text-link toggle is minimal, mirrors how settings often read on dense CLI-style UIs, and the underline gives a sufficient cue.

### 4.4 Auto-note hides in Manual mode (default)

When user flips to Manual, the "Wallet picks…" auto-note hides; the checkbox list takes its place. Otherwise the user would see contradictory info ("Wallet picks…" while they're manually picking).

Tweaks panel lets this be reversed — `hideAutoNoteInManual: false` keeps the note visible in both modes. Default is `true`.

### 4.5 5 hop buttons (2 · 3 · 4 · 5 · 6+) with inline contextual warning

Earlier version: 4 buttons (3 / 4 / 5 / Custom) + a global amber warning banner at page top. User asked for the warning to be inline below the hop selector and contextual.

Now: 5 buttons including 2 as a valid selection, with a persistent warn-banner above the hop grid stating the rule, plus a contextual amber hint that appears below the grid only when 2 hops is selected. 2 hops doesn't block submission — it's allowed but flagged.

### 4.6 Blue primary for the entire Swap flow (token remap)

Wallet pages are orange-primary. The Swap flow gets remapped to blue via a single change to the `--orange` token in `swap.css` (and a `--blue` already-defined variant). This visually segments the flow without adding new tokens. Semantic green/red/amber/purple stay constant.

The Tweaks panel exposes a Primary color swatch (blue default, orange, green, purple) that updates `--orange` and a computed `--orange-hover` (lighten by 18%) at runtime.

### 4.7 SwapProgress as animation, not a real-time WebSocket stream

The animation is fully deterministic — 18s, predefined keyframes, scrubber-driven via the bundled `animations.jsx` engine. Real RPC integration is `[future work]`.

Rationale: this is a hi-fi prototype; mocking a real Tor swap takes 1–10 minutes. We chose a believable 18s narrative that hits all the conceptual phases (Tor circuit → fund → route → settle). When wiring up real RPC, replace `setTimeout(18500ms)` auto-nav with state-driven transitions and use the engine for visual polish only.

### 4.8 SwapSuccess uses non-italic green accent on H1

Welcome-style H1s use orange italic accent on the last word. Success H1 uses green non-italic. Rationale: keeping the italic rule scoped to welcome screens (per design system); the success page still wants a colored emphasis word but italic felt off-brand for a settlement screen.

### 4.9 Single elevation rule

Only the shell has a drop shadow (`--shell-shadow`). Cards, rows, buttons, pills — all flat with borders. The success page's `success-glow` is a radial gradient hero atmosphere, not a shadow.

### 4.10 Constraints to respect

- **Color budget per card: max 2.** Don't introduce more than one semantic color alongside the brand on a single surface.
- **Mono for data, sans for UI.** Never break this.
- **No icons in balance cards, filter tabs, or pills.** No exceptions.
- **No new colors.** If the palette can't cover something, derive in oklch from existing tokens.
- **No decorative gradients.** Only hero bg and progress-bar fill.
- **Red is for outgoing only.** Use red text on `--surface-3` for destructive UI when it surfaces.
- **Animation engine is in-tree.** Don't pull in framer-motion or Popmotion — `animations.jsx` covers everything needed.
- **localStorage is the only cross-page state today.** Single key: `coinswap:selectedMakers`. Promote to URL params or context if a second flow needs handoff.

---

## 5. Open questions and next steps

### 5.1 Not yet decided

| Area | Question |
|---|---|
| Failure / Error screen | Need a `SwapFailed.html` companion to SwapSuccess. What error categories surface (network, maker rejection, locktime expiry, on-chain double-spend)? Single screen with state variants or per-error pages? |
| Resume / Recovery | If a swap stalls mid-route, can the user resume from the Log? Where does the entry point sit? |
| Real RPC integration | How does the deterministic 18s animation map onto unbounded real-world swap times? Show real-time elapsed + estimate, or stretch animation to actual duration? |
| Detail page per partner | The PartnerRow "View" link doesn't go anywhere yet. Should it open a maker detail modal (with their fee schedule, fidelity bond, reputation) or jump to Market filtered by that maker? |
| Custom hops input | `6+` button currently sets hops to 6. Should it open a number-input modal for 6–20? Or inline-expand to a stepper? |
| Speed vs privacy preset | Worth offering presets (Fast/Balanced/Maximum Privacy) above the hop selector? Currently raw integer control. |
| `Export report` payload | What format? JSON for power users, PDF for tax, or both? What fields? |
| Locale / number formatting | All formatting uses `en-US` (`Intl.NumberFormat('en-US')`). When/who needs locale support? |
| Sats vs BTC default | Tweaks panel exposes it; do we ship Sats default (current) or BTC default? |
| Keyboard shortcuts | Should there be hotkeys (e.g., `A` toggles Auto/Manual, `1–5` selects hops)? |

### 5.2 Concrete next steps in priority order

1. **SwapFailed.html** — same layout vocabulary as SwapSuccess (left summary card + right detail card + bottom action), but red accent, error reason copy, and a Retry/Cancel action pair. Build alongside the Success page so both share the layout primitives.
2. **Focus rings + keyboard nav** — design-system gap. Add `:focus-visible` outlines on all interactive elements in the Swap flow (buttons, hop buttons, picker links, checkboxes, icon buttons, modal close). 2px solid `--orange` with 2px offset.
3. **Real-data wireup spec** — produce a small contract for what the swap-progress engine consumes (start time, current phase, elapsed per phase, maker list, error). Lets backend integration begin without redesigning the animation.
4. **Empty / loading states for the Swap form** — Swappable Balance loading skeleton, UTXO list empty state ("No UTXOs available — Receive funds first"), Maker list empty state, Wallet-locked banner.
5. **Custom hops input** — pick one of the options in 5.1 and ship.
6. **Speaker / hover labels for the animation** — clicking a node in SwapProgress could pin a tooltip with the maker's full Tor addr, current state, and contract txid (so the user can copy mid-swap). Currently nodes are decorative-only.
7. **`prefers-reduced-motion` pass** — Swap Progress, success ripple, refresh icon rotation, status pip pulse.
8. **Accessibility audit** — semantic structure for grids-pretending-to-be-tables, `aria-live` on activity log and amount-validation hint, focus trap in any future modal in the Swap flow, full Tab order.

### 5.3 Files currently in the project

| File | Role |
|---|---|
| `Swap.html`, `swap.css`, `swap.js` | Initiate Swap |
| `SwapProgress.html`, `swap-progress.jsx`, `animations.jsx` | Routing animation |
| `SwapSuccess.html`, `swap-success.css`, `swap-success.js` | Settlement summary |
| `Design-System.md` | Full design-system spec (orange-primary) |
| `Developer-Handoff.md` | Implementation spec for Market + Swap flow |

`Market.html` exists in the project as the entry point for the maker-led path (its "Swap with selected makers" button writes `localStorage['coinswap:selectedMakers']` and navigates to Swap.html), but it's outside the scope of this handoff.

---

**Implementation notes for whoever picks this up:**

- All Swap-flow CSS lives in `swap.css` + `swap-success.css`. They share token definitions; `swap.css` defines the blue remap.
- All Swap-flow JS state is in `swap.js`. Tweaks panel is wired via the host edit-mode protocol (`__edit_mode_available`, `__edit_mode_set_keys`); the `EDITMODE-BEGIN/END` JSON block at the top of `swap.js` is the persistence anchor.
- The animation engine (`animations.jsx`) exposes `Stage`, `Sprite`, `useTime()`, `Easing`, `interpolate()`, `animate()`. Don't extend it without checking — it's intentionally small.
- Babel-in-browser is used in SwapProgress.html for prototype velocity. Compile JSX at build time before production.
- The 18.5s auto-navigate is a `setTimeout` in inline script. When you move to React Router, drive it from a `useEffect` watching `time >= TOTAL - 0.5` inside a Sprite; don't double-fire on remounts.
- Selection in checkbox lists is keyed by stable identifier (UTXO `id`, maker `tor`), not by array index. Preserve that when wiring real data — sorting must not break selection.
