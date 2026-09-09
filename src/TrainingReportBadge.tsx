import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles,
  faCircleCheck,
  faTriangleExclamation,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
import type { ReportSummary } from './documentsData';
import { color, type, icon, button as btn, chip } from './tokens';

const PANEL_WIDTH = 320;
/**
 * bg/accent/purple/solid/subtlest/selected — the light, true violet of the accent
 * family the report already uses for "needs review". Not status/solid/purple,
 * which is the same family's pink-leaning cousin.
 *
 * Hover flips to the family's saturated violet with white text rather than
 * deepening the fill, so no colour has to be derived (6.44:1).
 */
const PILL_BG = color.accentPurpleSelected;       // #dcc8f5
const PILL_HOVER_BG = color.accentPurpleSaturated; // #7349aa

// Keyframes cannot be expressed inline, so the one animation this file needs is
// injected once. Everything else here stays inline, as the rest of the app is.
const PULSE_CSS = `
@keyframes doa-report-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(115, 73, 170, 0.45); }
  70%  { box-shadow: 0 0 0 7px rgba(115, 73, 170, 0); }
  100% { box-shadow: 0 0 0 0 rgba(115, 73, 170, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [style*="doa-report-pulse"] { animation: none !important; }
}`;

/**
 * "The cross-module check has already run on this document."
 *
 * A Button/Flat primary carrying the AI glyph and an indicator dot, sitting
 * beside the document name in the grid. It opens a popover summarising what the
 * check found and offers the one action that follows from it — open the report.
 * The point is that the row itself tells you a report is waiting, without
 * opening the document to find out.
 */
export function TrainingReportBadge({
  summary,
  onOpenReport,
}: {
  summary: ReportSummary;
  onOpenReport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [at, setAt] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The name cell clips to an ellipsis, and the grid scrolls horizontally, so an
  // absolutely-positioned panel would be cut off by both. It is portalled to the
  // body and positioned against the button's viewport rect instead.
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const w = PANEL_WIDTH;
      setAt({
        top: r.bottom + 6,
        // Keep it on screen when the row sits near the right edge.
        left: Math.min(r.left, window.innerWidth - w - 10),
      });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // Esc closes, and so does a click anywhere outside — the same two ways out the
  // change-log dialog gives, so the two behave alike.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        wrapRef.current?.querySelector('button')?.focus();
      }
    }
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  useEffect(() => {
    if (document.getElementById('doa-report-pulse-css')) return;
    const el = document.createElement('style');
    el.id = 'doa-report-pulse-css';
    el.textContent = PULSE_CSS;
    document.head.appendChild(el);
  }, []);

  const needsAttention = summary.incomplete + summary.ambiguous;

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Training report ready — ${needsAttention} of ${summary.people} need review. Show summary.`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          // A labelled solid pill, not a bare glyph — the row already carries four
          // small icons, and one more would have disappeared among them.
          ...type.buttonSmall,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: chip.gap,
          minWidth: chip.mediumMinWidth,
          // chip/small-padding-y 2.5 keeps the pill 20px tall, so the name and the
          // badge stack inside the 45px row rather than forcing it taller.
          padding: `${chip.smallPaddingY}px ${btn.smallPaddingX}px`,
          border: 'none',
          borderRadius: chip.roundRadius,        // chip/round-radius 100
          backgroundColor: open || hover ? PILL_HOVER_BG : PILL_BG,
          // 7.14:1 resting · 6.44:1 on the hover fill
          color: open || hover ? color.white : color.accentPurpleText,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {/* One slow attention pulse on the ring, then it rests. Guarded by
            prefers-reduced-motion, and purely decorative. */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: chip.roundRadius,
            animation: 'doa-report-pulse 2.2s ease-out 3',
            pointerEvents: 'none',
          }}
        />
        <FontAwesomeIcon icon={faWandMagicSparkles} style={{ width: icon.s, height: icon.s }} />
        <span>Report ready</span>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Training report summary"
          style={{
            position: 'fixed',
            top: at.top,
            left: at.left,
            zIndex: 50,
            width: PANEL_WIDTH,
            fontFamily: type.body.fontFamily,
            padding: 15,                 /* dialog/content padding */
            borderRadius: 10,            /* dialog/radius */
            backgroundColor: color.white,
            // Dialog's two-layer shadow, so the popover sits in the same z-space
            boxShadow: `0 0 0 1px ${color.borderSubtle}, 0 12px 35px #0b15281a`,
            cursor: 'default',
            whiteSpace: 'normal',
          }}
        >
          <div style={{ ...type.bodySemibold, color: color.text }}>Training report ready</div>
          <div style={{ ...type.captionRegular, color: color.textMuted, marginTop: 2 }}>
            Cross-module check · {summary.ranAt}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              margin: '10px 0',
              padding: '10px 0',
              borderTop: `1px solid ${color.borderSubtle}`,
              borderBottom: `1px solid ${color.borderSubtle}`,
            }}
          >
            <Stat
              glyph={faCircleCheck}
              tint={color.confirmation}
              n={summary.complete}
              label="matched · training complete"
            />
            {summary.incomplete > 0 && (
              <Stat
                glyph={faTriangleExclamation}
                tint={color.statusFlatOrange}
                n={summary.incomplete}
                label="matched · training incomplete"
              />
            )}
            {summary.ambiguous > 0 && (
              <Stat
                glyph={faCircleQuestion}
                tint={color.discover}
                n={summary.ambiguous}
                label="ambiguous · needs review"
              />
            )}
          </div>

          <p style={{ ...type.captionRegular, color: color.textMuted, margin: '0 0 10px' }}>
            Read from {summary.people} names on this document, their contact records and their
            training history.
          </p>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenReport();
            }}
            style={{
              ...type.button,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: btn.mediumMinWidth,
              padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
              border: `${btn.borderWidth}px solid ${color.primary}`,
              borderRadius: btn.radius,
              backgroundColor: color.primary,
              color: color.white,
              cursor: 'pointer',
            }}
          >
            Open training report
          </button>
        </div>,
        document.body,
      )}
    </span>
  );
}

/** One count line in the popover — glyph, number, then what it counts. */
function Stat({
  glyph,
  tint,
  n,
  label,
}: {
  glyph: typeof faCircleCheck;
  tint: string;
  n: number;
  label: string;
}) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s, color: tint, flexShrink: 0 }} />
      <span style={{ ...type.bodySemibold, color: color.text }}>{n}</span>
      <span style={{ ...type.captionRegular, color: color.textMuted }}>{label}</span>
    </span>
  );
}

export default TrainingReportBadge;
