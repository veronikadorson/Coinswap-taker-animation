// swap-progress.jsx
// Coinswap Taker — Swap routing animation (circular)
// Three phases: Handshake → Contract Establishment → Settlement
// Wallet and Receiver are the same entity → coins traverse a closed loop.

// ─── Constants ──────────────────────────────────────────────────────────

const STAGE_W = 1920;
const STAGE_H = 1080;
const CX = 960;
const CY = 600;
const RADIUS = 270;
const TOTAL_DURATION = 23;

// Position on circle: angle in degrees, 0 = top, going clockwise.
function nodeXY(deg) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + RADIUS * Math.sin(rad),
    y: CY - RADIUS * Math.cos(rad),
  };
}

const MAKERS = [
  {
    id: 'M1',
    label: 'MAKER 01',
    angle: 90,
    tor: '7g5z2xskmnvp···xqj4.onion',
    fee: '0.030% + 250 sats',
    bond: 'bond a1f2···d2e7e8a3',
    tipSide: 'right',
  },
  {
    id: 'M2',
    label: 'MAKER 02',
    angle: 180,
    tor: 'kj4mn5pqrstu···nop6.onion',
    fee: '0.025% + 200 sats',
    bond: 'bond 8b2c···f6e3a7c5',
    tipSide: 'bottom',
  },
  {
    id: 'M3',
    label: 'MAKER 03',
    angle: 270,
    tor: 'xy7z8a9bcdef···67vh.onion',
    fee: '0.035% + 300 sats',
    bond: 'bond 2d5e···c4b8f1e3',
    tipSide: 'left',
  },
];

// Timeline (seconds)
const T = {
  walletIn:    [0.2, 1.0],
  makerIn:     { M1: [0.8, 1.6], M2: [1.2, 2.0], M3: [1.6, 2.4] },
  handshake:   { M1: [2.6, 4.6], M2: [4.4, 6.4], M3: [6.2, 8.2] },
  phase1End:   8.5,
  contract:    { M1: [9.0, 10.5], M2: [10.5, 12.0], M3: [12.0, 13.5] },
  phase2End:   14.0,
  blinkStart:  14.0,
  packet:      [15.0, 19.8],
  greenFlip:   [19.8, 21.0],
  completeIn:  21.0,
};

const PHASES = [
  { from: 0,    to: 8.5,  step: 1, label: 'Handshake',               color: '#5b8def' },
  { from: 8.5,  to: 14.0, step: 2, label: 'Contract Establishment',  color: '#ffb547' },
  { from: 14.0, to: TOTAL_DURATION, step: 3, label: 'Settlement',    color: '#2fbf71' },
];

function currentPhase(t) {
  for (const p of PHASES) if (t < p.to) return p;
  return PHASES[PHASES.length - 1];
}

// ─── Colors ─────────────────────────────────────────────────────────────

const COLORS = {
  hazy:  { r: 108, g: 108, b: 114 },
  blue:  { r:  91, g: 141, b: 239 },
  amber: { r: 255, g: 181, b:  71 },
  green: { r:  47, g: 191, b: 113 },
};
const lerp = (a, b, t) => a + (b - a) * t;
const lerpRGB = (c1, c2, t) => ({
  r: Math.round(lerp(c1.r, c2.r, t)),
  g: Math.round(lerp(c1.g, c2.g, t)),
  b: Math.round(lerp(c1.b, c2.b, t)),
});
const rgb = (c, a = 1) =>
  a === 1 ? `rgb(${c.r}, ${c.g}, ${c.b})` : `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

// Compute a maker's progression through hazy → blue → amber → green
function makerProgress(t, m) {
  const [hs0, hs1] = T.handshake[m.id];
  const hsP = clamp((t - hs0) / (hs1 - hs0), 0, 1);
  const [ct0, ct1] = T.contract[m.id];
  const ctP = clamp((t - ct0) / (ct1 - ct0), 0, 1);
  const [gr0, gr1] = T.greenFlip;
  const grP = clamp((t - gr0) / (gr1 - gr0), 0, 1);

  let tone = COLORS.hazy;
  if (hsP > 0) tone = lerpRGB(COLORS.hazy, COLORS.blue, hsP);
  if (ctP > 0) tone = lerpRGB(COLORS.blue, COLORS.amber, ctP);
  if (grP > 0) tone = lerpRGB(COLORS.amber, COLORS.green, grP);
  return { tone, hsP, ctP, grP };
}

// ─── Backdrop & chrome ─────────────────────────────────────────────────

function Backdrop() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse 1200px 800px at 50% 55%, rgba(91,141,239,0.10), transparent 70%),
        radial-gradient(circle at 50% 50%, #0d0d12 0%, #08080a 75%)`,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        opacity: 0.6,
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
      }} />
    </div>
  );
}

function Chrome() {
  return (
    <React.Fragment>
      <div style={{
        position: 'absolute', top: 36, left: 44,
        display: 'flex', alignItems: 'center', gap: 12,
        color: '#f5f5f7',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#5b8def',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 17, fontWeight: 800, color: '#08080a',
          letterSpacing: '-0.03em',
        }}>C</div>
        <div style={{
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 14, letterSpacing: '0.04em', color: '#f5f5f7',
        }}>
          coinswap<span style={{ color: '#6c6c72' }}> · taker</span>
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 40, right: 44,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 11, letterSpacing: '0.10em',
        color: '#a7a7ad', textTransform: 'uppercase',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#2fbf71', boxShadow: '0 0 8px #2fbf71',
          animation: 'sp-pulse 2.4s ease-in-out infinite',
        }} />
        Mainnet · Block 824,517
      </div>
    </React.Fragment>
  );
}

// ─── Header (eyebrow + title + progress bar) ───────────────────────────

function Header() {
  const t = useTime();
  const phase = currentPhase(t);
  const prog = clamp(t / TOTAL_DURATION, 0, 1);

  return (
    <div style={{
      position: 'absolute', top: 108, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 11, letterSpacing: '0.14em',
        color: '#6c6c72', textTransform: 'uppercase',
      }}>
        Step {phase.step} of 3 · Swap in progress
      </div>
      <div key={phase.label} style={{
        marginTop: 10,
        fontFamily: '-apple-system, "SF Pro Display", sans-serif',
        fontSize: 48, fontWeight: 700, letterSpacing: '-0.035em',
        color: '#f5f5f7', textAlign: 'center', lineHeight: 1.1,
        animation: 'sp-fadein 380ms ease',
      }}>
        {phase.label}<span style={{ color: phase.color }}>.</span>
      </div>
      <div style={{
        marginTop: 22,
        width: 460, height: 6, borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${prog * 100}%`,
          background: 'linear-gradient(90deg, #5b8def 0%, #7da3f5 100%)',
          boxShadow: '0 0 14px rgba(91,141,239,0.65)',
        }} />
      </div>
    </div>
  );
}

// ─── Route circle (path + lit arc + traveling packet) ─────────────────

function RouteCircle({ hoverMaker }) {
  const t = useTime();
  const CIRC = 2 * Math.PI * RADIUS;

  // Tone of the lit arc — blue during phases 1-2, then amber → green
  let arcTone = COLORS.blue;
  if (t >= T.phase1End) arcTone = lerpRGB(COLORS.blue, COLORS.amber, clamp((t - T.phase1End) / 1.5, 0, 1));
  const [gr0, gr1] = T.greenFlip;
  const grP = clamp((t - gr0) / (gr1 - gr0), 0, 1);
  if (grP > 0) arcTone = lerpRGB(COLORS.amber, COLORS.green, grP);

  // How much of the circle is "lit" (white-ish progress trail)
  // 0–8s: gradually as handshakes complete (0/3 → 3/3)
  let litFrac = 0;
  const hsCompletes = MAKERS.reduce((acc, m) => {
    const [a, b] = T.handshake[m.id];
    return acc + clamp((t - a) / (b - a), 0, 1);
  }, 0);
  litFrac = Math.max(litFrac, hsCompletes / 3 * 0.0); // arcs stay subtle until settlement

  // Settlement packet defines the trailing lit segment
  const [pk0, pk1] = T.packet;
  const pkLocal = clamp((t - pk0) / (pk1 - pk0), 0, 1);
  const packetActive = t >= pk0 && t <= pk1 + 0.4;

  // Stepped angle for the packet (pauses briefly at each hop)
  const packetAngle = (() => {
    const stops = [
      [0.00, 0.22,   0,  90],
      [0.22, 0.30,  90,  90],
      [0.30, 0.52,  90, 180],
      [0.52, 0.60, 180, 180],
      [0.60, 0.82, 180, 270],
      [0.82, 0.90, 270, 270],
      [0.90, 1.00, 270, 360],
    ];
    for (const [p0, p1, a0, a1] of stops) {
      if (pkLocal >= p0 && pkLocal <= p1) {
        const local = p1 === p0 ? 0 : (pkLocal - p0) / (p1 - p0);
        const eased = Easing.easeInOutCubic(local);
        return a0 + (a1 - a0) * eased;
      }
    }
    return pkLocal < 0 ? 0 : 360;
  })();

  // Lit length: during settlement packet, lit arc grows behind it
  let litLen = 0;
  if (t >= pk0) litLen = (packetAngle / 360) * CIRC;
  if (t >= gr1) litLen = CIRC;

  const packetPos = nodeXY(packetAngle);

  // Hover-link line (faint) between hovered maker and wallet
  let hoverLink = null;
  if (hoverMaker) {
    const m = MAKERS.find((x) => x.id === hoverMaker);
    const p = nodeXY(m.angle);
    const w = nodeXY(0);
    hoverLink = <line x1={w.x} y1={w.y} x2={p.x} y2={p.y}
      stroke="rgba(91,141,239,0.30)" strokeWidth="1.2" strokeDasharray="4 6" />;
  }

  return (
    <svg
      width={STAGE_W} height={STAGE_H}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id="sp-packetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={rgb(arcTone, 1)} />
          <stop offset="40%" stopColor={rgb(arcTone, 0.6)} />
          <stop offset="100%" stopColor={rgb(arcTone, 0)} />
        </radialGradient>
      </defs>

      {/* Faint outer ring */}
      <circle cx={CX} cy={CY} r={RADIUS + 28}
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Base dashed route */}
      <circle cx={CX} cy={CY} r={RADIUS}
        fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5"
        strokeDasharray="5 10" />

      {/* Lit progress arc — rotated so 0 angle starts at top */}
      <g transform={`rotate(-90 ${CX} ${CY})`}>
        <circle cx={CX} cy={CY} r={RADIUS}
          fill="none"
          stroke={rgb(arcTone)}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${litLen} ${CIRC + 100}`}
          style={{
            filter: `drop-shadow(0 0 6px ${rgb(arcTone, 0.7)})`,
            transition: 'stroke 250ms linear',
          }} />
      </g>

      {hoverLink}

      {/* Packet glow halo */}
      {packetActive && (
        <circle cx={packetPos.x} cy={packetPos.y} r="40"
          fill="url(#sp-packetGlow)" opacity="0.85" />
      )}

      {/* Packet core */}
      {packetActive && (
        <React.Fragment>
          <circle cx={packetPos.x} cy={packetPos.y} r="11"
            fill={rgb(arcTone)}
            style={{ filter: `drop-shadow(0 0 14px ${rgb(arcTone, 0.95)})` }} />
          <circle cx={packetPos.x} cy={packetPos.y} r="5"
            fill="#ffffff" opacity="0.9" />
        </React.Fragment>
      )}
    </svg>
  );
}

// ─── Wallet (center top of circle) ─────────────────────────────────────

function Wallet() {
  const t = useTime();
  const [a0, a1] = T.walletIn;
  const appearP = clamp((t - a0) / (a1 - a0), 0, 1);
  if (appearP <= 0) return null;
  const eased = Easing.easeOutBack(appearP);

  const grP = clamp((t - T.greenFlip[0]) / (T.greenFlip[1] - T.greenFlip[0]), 0, 1);
  const tone = grP > 0 ? lerpRGB(COLORS.blue, COLORS.green, grP) : COLORS.blue;

  const settled = grP >= 1;
  const NODE = 160;
  const { x, y } = nodeXY(0);

  return (
    <div style={{
      position: 'absolute',
      left: x - NODE / 2, top: y - NODE / 2,
      width: NODE, height: NODE,
      opacity: appearP, transform: `scale(${eased})`,
      transformOrigin: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: -10, borderRadius: '50%',
        boxShadow: `0 0 40px ${rgb(tone, 0.35)}`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#0c0c10',
        border: `2.5px solid ${rgb(tone)}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <WalletIcon color={rgb(tone)} />
        <div style={{
          marginTop: 8,
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 10.5, letterSpacing: '0.10em',
          color: '#f5f5f7', textTransform: 'uppercase', fontWeight: 600,
        }}>
          Your Wallet
        </div>
        <div style={{
          marginTop: 2,
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 9.5, letterSpacing: '0.06em',
          color: '#6c6c72', textTransform: 'uppercase',
        }}>
          Origin · Receiver
        </div>
      </div>

      {/* sub-pill */}
      <div style={{
        position: 'absolute', top: -38, left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        padding: '5px 12px', borderRadius: 6,
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 10.5, letterSpacing: '0.08em',
        textTransform: 'uppercase', fontWeight: 600,
        background: rgb(tone, 0.12),
        border: `1px solid ${rgb(tone, 0.30)}`,
        color: rgb(tone),
      }}>
        {settled ? 'Received · 1,245,442 sats' : 'Sending · 1,248,300 sats'}
      </div>
    </div>
  );
}

// ─── Maker node ────────────────────────────────────────────────────────

function Maker({ data, index, hoverId, setHoverId }) {
  const t = useTime();
  const [a0, a1] = T.makerIn[data.id];
  const appearP = clamp((t - a0) / (a1 - a0), 0, 1);
  if (appearP <= 0) return null;
  const eased = Easing.easeOutBack(appearP);

  const { tone, hsP, ctP, grP } = makerProgress(t, data);

  // Blink during settlement (only after contracts are locked, before green flip)
  const inBlink = t >= T.blinkStart && t < T.greenFlip[0] && ctP >= 1;
  const wobble = inBlink ? 0.5 + 0.5 * Math.sin((t - T.blinkStart) * Math.PI * 3) : 1;

  const baseOpacity = 0.35 + 0.65 * hsP;
  const opacity = baseOpacity * (inBlink ? (0.55 + 0.45 * wobble) : 1) * appearP;
  const blur = (1 - hsP) * 4.5;

  // Status label
  let statusLabel = 'Connecting…';
  if (hsP > 0 && hsP < 1) statusLabel = 'Handshaking';
  if (hsP >= 1 && ctP === 0) statusLabel = 'Handshake OK';
  if (ctP > 0 && ctP < 1) statusLabel = 'Locking HTLC';
  if (ctP >= 1 && grP === 0) statusLabel = 'HTLC Locked';
  if (grP > 0 && grP < 1) statusLabel = 'Releasing';
  if (grP >= 1) statusLabel = 'Settled';

  const NODE = 130;
  const { x, y } = nodeXY(data.angle);
  const isHover = hoverId === data.id;
  const scale = eased * (isHover ? 1.06 : 1);

  return (
    <div
      onMouseEnter={() => setHoverId(data.id)}
      onMouseLeave={() => setHoverId((h) => (h === data.id ? null : h))}
      style={{
        position: 'absolute',
        left: x - NODE / 2, top: y - NODE / 2,
        width: NODE, height: NODE,
        cursor: 'pointer',
        zIndex: isHover ? 5 : 1,
      }}
    >
      {/* Blurred / haziness layer holds the node itself */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity, transform: `scale(${scale})`,
        transformOrigin: 'center',
        filter: blur > 0.15 ? `blur(${blur}px)` : 'none',
        transition: 'transform 200ms ease',
      }}>
        {/* Glow halo */}
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          boxShadow: `0 0 ${isHover ? 36 : 22}px ${rgb(tone, 0.45 * hsP)}`,
          pointerEvents: 'none',
        }} />
        {/* Ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#0c0c10',
          border: `2px solid ${rgb(tone)}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <ServerIcon color={rgb(tone)} />
          <div style={{
            marginTop: 7,
            fontFamily: 'SF Mono, ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.10em',
            color: '#f5f5f7', textTransform: 'uppercase', fontWeight: 600,
          }}>
            {data.label}
          </div>
          <div style={{
            marginTop: 1,
            fontFamily: 'SF Mono, ui-monospace, monospace',
            fontSize: 9, letterSpacing: '0.04em',
            color: '#6c6c72',
          }}>
            {data.tor.slice(0, 11)}…
          </div>
        </div>
      </div>

      {/* Status pill: NOT blurred, NOT scaled, lives outside the haze layer */}
      <StatusPill
        side={data.tipSide}
        tone={tone}
        label={statusLabel}
        opacity={appearP}
      />
    </div>
  );
}

function StatusPill({ side, tone, label, opacity }) {
  // Pill sits opposite the tooltip side so they don't collide.
  // tipSide right → pill below; tipSide bottom → pill above;
  // tipSide left → pill below.
  const NODE = 130;
  let style = {};
  if (side === 'right')  style = { top: NODE + 14,  left: '50%', transform: 'translateX(-50%)' };
  if (side === 'bottom') style = { top: -32,        left: '50%', transform: 'translateX(-50%)' };
  if (side === 'left')   style = { top: NODE + 14,  left: '50%', transform: 'translateX(-50%)' };

  return (
    <div style={{
      position: 'absolute', whiteSpace: 'nowrap',
      padding: '4px 11px', borderRadius: 6,
      fontFamily: 'SF Mono, ui-monospace, monospace',
      fontSize: 10, letterSpacing: '0.08em',
      textTransform: 'uppercase', fontWeight: 600,
      background: rgb(tone, 0.12),
      border: `1px solid ${rgb(tone, 0.32)}`,
      color: rgb(tone),
      opacity,
      pointerEvents: 'none',
      ...style,
    }}>
      {label}
    </div>
  );
}

// ─── Hover tooltip (rendered by the diagram, unblurred) ───────────────

function MakerTooltip({ maker }) {
  const m = MAKERS.find((x) => x.id === maker);
  if (!m) return null;
  const { x, y } = nodeXY(m.angle);

  const TIP_W = 280;
  let left, top, arrowSide;
  const OFFSET = 100; // distance from node center to tooltip edge

  if (m.tipSide === 'right') {
    left = x + OFFSET;
    top = y - 68;
    arrowSide = 'left';
  } else if (m.tipSide === 'left') {
    left = x - OFFSET - TIP_W;
    top = y - 68;
    arrowSide = 'right';
  } else { // bottom
    left = x - TIP_W / 2;
    top = y + OFFSET;
    arrowSide = 'top';
  }

  return (
    <div style={{
      position: 'absolute',
      left, top,
      width: TIP_W,
      background: '#101014',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: '14px 16px 14px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      pointerEvents: 'none',
      animation: 'sp-tipin 140ms ease-out',
      zIndex: 20,
    }}>
      {/* Arrow */}
      <TooltipArrow side={arrowSide} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.10em',
          color: '#f5f5f7', fontWeight: 600, textTransform: 'uppercase',
        }}>
          {m.label}
        </span>
        <span style={{
          padding: '2px 7px', borderRadius: 999,
          background: 'rgba(91,141,239,0.12)',
          border: '1px solid rgba(91,141,239,0.30)',
          color: '#7da3f5',
          fontFamily: 'SF Mono, ui-monospace, monospace',
          fontSize: 9, letterSpacing: '0.08em',
          textTransform: 'uppercase', fontWeight: 600,
        }}>
          Peer
        </span>
      </div>

      <TipRow label="Tor"  value={m.tor}  mono />
      <TipRow label="Fee"  value={m.fee}  mono />
      <TipRow label="Bond" value={m.bond} mono />
    </div>
  );
}

function TipRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      paddingTop: 8, paddingBottom: 8,
      borderTop: '1px dashed rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 9.5, letterSpacing: '0.10em',
        color: '#6c6c72', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 12, color: '#f5f5f7', letterSpacing: '-0.005em',
      }}>{value}</div>
    </div>
  );
}

function TooltipArrow({ side }) {
  const base = {
    position: 'absolute', width: 0, height: 0,
    borderStyle: 'solid',
  };
  if (side === 'left') return (
    <span style={{
      ...base, top: 64, left: -8,
      borderWidth: '8px 8px 8px 0',
      borderColor: 'transparent rgba(255,255,255,0.14) transparent transparent',
    }} />
  );
  if (side === 'right') return (
    <span style={{
      ...base, top: 64, right: -8,
      borderWidth: '8px 0 8px 8px',
      borderColor: 'transparent transparent transparent rgba(255,255,255,0.14)',
    }} />
  );
  return (
    <span style={{
      ...base, top: -8, left: 132,
      borderWidth: '0 8px 8px 8px',
      borderColor: 'transparent transparent rgba(255,255,255,0.14) transparent',
    }} />
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────

function WalletIcon({ color = '#5b8def' }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="6" width="19" height="13" rx="2.5"
        stroke={color} strokeWidth="1.7" />
      <path d="M2.5 9 L16 9 L16 16 L21.5 16"
        stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <circle cx="17.5" cy="12.5" r="1.3" fill={color} />
    </svg>
  );
}

function ServerIcon({ color = '#5b8def' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5"  width="16" height="6" rx="1.6" stroke={color} strokeWidth="1.6" />
      <rect x="4" y="13" width="16" height="6" rx="1.6" stroke={color} strokeWidth="1.6" />
      <circle cx="7" cy="8"  r="0.9" fill={color} />
      <circle cx="7" cy="16" r="0.9" fill={color} />
      <path d="M11 8 H17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 16 H17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Center hint inside the circle ─────────────────────────────────────

function CenterStatus() {
  const t = useTime();
  const phase = currentPhase(t);

  let line1 = 'Awaiting handshakes';
  let line2 = 'Negotiating with selected makers over Tor';
  if (phase.step === 2) {
    line1 = 'Locking funds in HTLC contracts';
    line2 = 'Each maker stakes their fidelity bond';
  }
  if (phase.step === 3) {
    line1 = 'Routing atomic swap';
    line2 = 'Sats traversing the closed loop';
  }
  if (t >= T.greenFlip[1]) {
    line1 = 'Preimage propagated';
    line2 = 'Coins returned to your wallet';
  }

  return (
    <div style={{
      position: 'absolute',
      left: CX - 220, top: CY - 26,
      width: 440, textAlign: 'center',
      pointerEvents: 'none',
      opacity: 0.95,
    }}>
      <div style={{
        fontFamily: '-apple-system, "SF Pro Display", sans-serif',
        fontSize: 18, fontWeight: 600,
        color: '#f5f5f7', letterSpacing: '-0.015em',
      }}>
        {line1}
      </div>
      <div style={{
        marginTop: 6,
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 11.5, letterSpacing: '0.04em',
        color: '#6c6c72',
      }}>
        {line2}
      </div>
    </div>
  );
}

// ─── Complete badge ────────────────────────────────────────────────────

function CompleteBadge() {
  const t = useTime();
  const start = T.completeIn;
  const p = clamp((t - start) / 0.7, 0, 1);
  if (p <= 0) return null;
  const eased = Easing.easeOutBack(p);

  return (
    <div style={{
      position: 'absolute',
      left: CX - 130, top: CY + 70,
      width: 260,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10,
      opacity: p, transform: `scale(${eased})`,
      transformOrigin: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(47,191,113,0.14)',
        border: '2px solid rgba(47,191,113,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid rgba(47,191,113,0.55)',
          animation: 'sp-ripple 2.4s ease-out infinite',
        }} />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5 L10 17.5 L19 7" stroke="#2fbf71"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{
        padding: '6px 14px', borderRadius: 999,
        background: 'rgba(47,191,113,0.12)',
        border: '1px solid rgba(47,191,113,0.32)',
        color: '#2fbf71',
        fontFamily: 'SF Mono, ui-monospace, monospace',
        fontSize: 12, letterSpacing: '0.10em',
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        Swap complete
      </div>
    </div>
  );
}

// ─── Bottom stats strip ────────────────────────────────────────────────

function BottomStats() {
  const t = useTime();
  const phase = currentPhase(t);

  // ETA countdown — fake countdown from ~3m to 0
  const remaining = Math.max(0, TOTAL_DURATION - t);
  const totalEta = TOTAL_DURATION;
  const etaSeconds = Math.round((remaining / totalEta) * 167); // ~2m 47s mapped
  const etaM = Math.floor(etaSeconds / 60);
  const etaS = etaSeconds % 60;
  const etaStr = t >= T.greenFlip[1] ? '0m 00s' : `${etaM}m ${String(etaS).padStart(2, '0')}s`;

  const stats = [
    { label: 'Amount',      value: '1,248,300', unit: 'sats', color: '#f5f5f7' },
    { label: 'Hops',        value: '3',         unit: 'peers', color: '#f5f5f7' },
    { label: 'Fee',         value: '2,858',     unit: 'sats', color: '#f5f5f7' },
    { label: 'You receive', value: '1,245,442', unit: 'sats', color: '#2fbf71' },
    { label: 'ETA',         value: etaStr,      unit: '',     color: phase.color },
  ];

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 40,
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, auto)',
        gap: 0,
        background: '#101014',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '14px 4px',
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            padding: '4px 28px',
            borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            minWidth: 140,
            display: 'flex', flexDirection: 'column', gap: 4,
            alignItems: 'flex-start',
          }}>
            <div style={{
              fontFamily: 'SF Mono, ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.12em',
              color: '#6c6c72', textTransform: 'uppercase',
            }}>{s.label}</div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 6,
            }}>
              <span style={{
                fontFamily: 'SF Mono, ui-monospace, monospace',
                fontSize: 20, fontWeight: 600,
                color: s.color, letterSpacing: '-0.01em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.value}
              </span>
              {s.unit && (
                <span style={{
                  fontFamily: 'SF Mono, ui-monospace, monospace',
                  fontSize: 11, color: '#6c6c72', letterSpacing: '0.04em',
                }}>
                  {s.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Diagram (composes wallet, makers, route, tooltip) ────────────────

function Diagram() {
  const [hoverId, setHoverId] = React.useState(null);
  return (
    <React.Fragment>
      <RouteCircle hoverMaker={hoverId} />
      <CenterStatus />
      <CompleteBadge />
      <Wallet />
      {MAKERS.map((m, i) => (
        <Maker key={m.id} data={m} index={i}
          hoverId={hoverId} setHoverId={setHoverId} />
      ))}
      {hoverId && <MakerTooltip maker={hoverId} />}
    </React.Fragment>
  );
}

// ─── App root ──────────────────────────────────────────────────────────

function GlobalStyle() {
  return (
    <style>{`
      @keyframes sp-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
      @keyframes sp-fadein {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes sp-ripple {
        0% { transform: scale(0.9); opacity: 0.9; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      @keyframes sp-tipin {
        from { opacity: 0; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

function SwapProgressApp() {
  return (
    <React.Fragment>
      <GlobalStyle />
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        duration={TOTAL_DURATION}
        background="#08080a"
        loop={false}
        autoplay={true}
        persistKey="swap-progress"
      >
        <Backdrop />
        <Chrome />
        <Header />
        <Diagram />
        <BottomStats />
      </Stage>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root'))
  .render(<SwapProgressApp />);
