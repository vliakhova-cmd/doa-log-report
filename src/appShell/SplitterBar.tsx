import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight, faSitemap } from '@fortawesome/free-solid-svg-icons';

// ─── Design tokens (from Figma "Design Library | PROD | 1.0" — Dividers/Splitter Bar NEW, orientation → ) ──
// Zero state: nothing visible — this project's actual page design (Figma "AI
// Course Authoring", Content Library) has no divider line, just the tree's
// #fafafa background against the white content.
// Pill (Resting): bg #5391c6, 20px wide, 75px tall, rounded top-right 5px
// Pill (Hover):   bg #1f6aac, 30px wide, drop-shadow
// Rail below pill: bg #d2e5f6, fills remaining height, same width as pill
//   - "sitemap" icon + vertical "TREE" label (bold, #1f6aac), 15px from top
//   - "Nugget" grip: two 1px×50px bars, #1f6aac, centered
// The pill/rail overlay the content to their right on reveal — they don't
// push/reflow the table, matching the Figma "Splitter Bar Hovered" state.

export interface SplitterBarProps {
  /** 'Open' = panel is currently closed, clicking opens it. 'Close' = panel is open, clicking closes it. */
  type: 'Open' | 'Close';
  onToggle: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  /** Skip the hover-gated reveal and always show the Resting look — for touch/no-hover devices */
  alwaysVisible?: boolean;
  /**
   * 'Close' (expanded tree) only: true while the pointer is anywhere over the
   * tree panel's own content, not just this 8px strip. That alone reveals the
   * Resting look; hovering this strip itself escalates straight to Hover.
   * Ignored for 'Open' (collapsed), where this strip is the only hover target.
   */
  treeAreaHovered?: boolean;
}

export function SplitterBar({ type, onToggle, onDragStart, alwaysVisible = false, treeAreaHovered = false }: SplitterBarProps) {
  const [hoverZone, setHoverZone] = useState(false);

  const wideZoneHover = type === 'Close' && treeAreaHovered;
  // Collapsed: it's the only way to reveal the tree, so it's always at least
  // Resting, escalating to Hover when the pointer is over this strip.
  // Expanded: Zero until the wider tree area or this strip is hovered — the
  // wider area shows Resting, this strip itself escalates to Hover.
  const visible = type === 'Open' || alwaysVisible || hoverZone || wideZoneHover;
  const isPillHover = !alwaysVisible && hoverZone;
  const pillWidth = isPillHover ? 30 : 20;
  const icon = type === 'Close' ? faCaretLeft : faCaretRight;
  const label = type === 'Close' ? 'CLOSE' : 'OPEN';
  const nuggetGap = type === 'Close' && !isPillHover ? 5 : 2;

  return (
    <div
      style={{
        // Always zero layout width — this strip must never push or reflow
        // the content to its right, whether at rest or revealed. It only
        // ever establishes the positioned ancestor for the overlay below,
        // which grows via `position: absolute` and so overlays the content
        // instead of resizing this flex item (Figma "Splitter Bar Hovered":
        // the pill/rail sit on top of the table, they don't shift it).
        width: 0,
        flexShrink: 0,
        position: 'relative',
        alignSelf: 'stretch',
      }}
    >
      {/* Zero state: nothing rendered at rest — the actual page design has no
          divider line here at all, just the tree/content background contrast
          (Figma "Content Library", Tree component: no border on either
          side). Revealing via the wider tree area (treeAreaHovered) still
          works because that hover is tracked on the tree panel's own
          element, not this strip. */}

      {visible && (
        <div
          onMouseEnter={() => setHoverZone(true)}
          onMouseLeave={() => setHoverZone(false)}
          onMouseDown={onDragStart}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: pillWidth,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            cursor: onDragStart ? 'col-resize' : 'pointer',
            transition: 'width 100ms',
          }}
        >
          {/* Pill */}
          <button
            type="button"
            onClick={onToggle}
            onMouseDown={e => e.stopPropagation()}
            aria-label={type === 'Close' ? 'Close folder tree' : 'Open folder tree'}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              height: 75,
              width: pillWidth,
              backgroundColor: isPillHover ? '#1f6aac' : '#5391c6',
              borderTopRightRadius: 5,
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: isPillHover ? '3px 0px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'background-color 100ms, width 100ms',
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ width: 12, height: 12, color: 'white' }} />
            <span
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 12,
                color: 'white',
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              {label}
            </span>
          </button>

          {/* Rail */}
          <div style={{ flex: '1 0 0', width: pillWidth, backgroundColor: '#d2e5f6', position: 'relative', transition: 'width 100ms' }}>
            <div
              style={{
                position: 'absolute',
                top: 15,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <FontAwesomeIcon icon={faSitemap} style={{ width: 13, height: 13, color: '#1f6aac' }} />
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1f6aac',
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                TREE
              </span>
            </div>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                gap: nuggetGap,
              }}
            >
              <div style={{ width: 1, height: 50, borderRadius: 0.5, backgroundColor: '#1f6aac' }} />
              <div style={{ width: 1, height: 50, borderRadius: 0.5, backgroundColor: '#1f6aac' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitterBar;
