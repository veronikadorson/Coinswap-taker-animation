# Coinswap Taker — Swap Progress Animation

**Author: Veronika Dorson**

A circular swap routing animation for the Coinswap Taker Bitcoin wallet. Visualizes a privacy-preserving Bitcoin swap through multiple maker peers over Tor.

## How to run

Serve the `project/` folder with a local server and open `SwapProgress.html`:

```bash
cd project
python3 -m http.server 8000
```

Then visit `http://localhost:8000/SwapProgress.html` in your browser.

## Animation phases

1. **Handshake** (0–8.5s) — Each maker fades from hazy to clear as Tor connections are established
2. **Contract Establishment** (8.5–14s) — Each maker turns amber as HTLC contracts are locked one by one
3. **Settlement** (14–23s) — Makers blink during routing; a coin packet traverses the circular path; all turn green on completion

## Files

| File | Role |
|---|---|
| `project/SwapProgress.html` | Entry point |
| `project/animations.jsx` | Animation engine (Stage, Sprite, playback controls) |
| `project/swap-progress.jsx` | Circular swap animation |
