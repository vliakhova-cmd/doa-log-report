import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf,
  faFileWord,
  faEllipsis,
  faFlag,
  faLink,
  faCircleDot,
  faComment,
  faRectangleList,
  faUser,
  faAngleLeft,
  faAngleRight,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { DOCUMENTS, DOCUMENT_COUNT, TOTAL_PAGES, DocumentRow, RowGlyph } from './documentsData';
import type { DocView } from './DocumentPreview';
import { color, type, table as t, status as st, checkbox as cb, pagination as pg, button as btn, icon } from './tokens';
import TrainingReportBadge from './TrainingReportBadge';

// ─── Control/Checkbox — 15×15, radius 2, 1px #c2cad8, white fill ─────────────
/**
 * control/checkbox — DS Base 11252:112938. 15x15, radius 2, 1px rule; the border
 * goes brand on hover before anything is selected, which is the affordance the
 * resting grey alone does not give.
 */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const [hover, setHover] = useState(false);
  const bg = checked
    ? (hover ? cb.selectedHoverBg : cb.selectedBg)
    : (hover ? cb.hoverBg : cb.restingBg);
  const border = checked
    ? (hover ? cb.selectedHoverBorder : cb.selectedBorder)
    : (hover ? cb.hoverBorder : cb.restingBorder);

  return (
    <span
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: cb.size,
        height: cb.size,
        borderRadius: cb.radius,
        border: `${cb.borderWidth}px solid ${border}`,
        backgroundColor: bg,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M1 5.2L3.6 7.8L9 2.2" stroke={cb.icon} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

// ─── Status — status/solid/orange bg, status/solid/text, radius 5, px 5 ──────
/**
 * Status — Status/Solid throughout this column: every state carries a fill from
 * the same lightness band with status/solid/text on it, so the column reads as
 * one set of states rather than two kinds of thing.
 */
const STATUS_TONE = {
  progress:   color.statusOrange,      // status/solid/orange
  approved:   color.statusSolidGreen,  // status/solid/green
  rejected:   color.statusSolidRed,    // status/solid/red
  superseded: color.statusSolidGrey,   // chip/solid/base/resting-bg
} as const;

function Status({ label, tone = 'progress' }: { label: string; tone?: keyof typeof STATUS_TONE }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: st.gap,
        maxWidth: st.labelMaxWidth,
        padding: `0 ${st.paddingX}px`,      // status/solid/padding-x
        borderRadius: st.radius,
        backgroundColor: STATUS_TONE[tone],
        color: color.text,                  // status/solid/text
        ...type.status,
        textTransform: 'uppercase',   // Status renders its label in caps
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </span>
  );
}

const GLYPHS: Record<RowGlyph, { icon: IconDefinition; color: string; alert?: boolean }> = {
  flag: { icon: faFlag, color: color.informational },
  'flag-alert': { icon: faFlag, color: color.informational, alert: true },
  link: { icon: faLink, color: color.informational },
  circle: { icon: faCircleDot, color: color.primary },
  comment: { icon: faComment, color: color.discover },
  record: { icon: faRectangleList, color: color.confirmation },
};

function RowGlyphs({ glyphs }: { glyphs: RowGlyph[] }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap }}>
      {glyphs.map((g, i) => {
        const spec = GLYPHS[g];
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-flex' }}>
            <FontAwesomeIcon icon={spec.icon} style={{ width: icon.s, height: icon.s, color: spec.color }} />
            {spec.alert && (
              // indicator — 10×10, radius 100, 2px white ring, #d23c2d
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderRadius: 100,
                  border: `2px solid ${color.white}`,
                  backgroundColor: color.critical,
                }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Row actions "···" — Button/Outline tertiary, per DS - Advanced node 86:208952.
 *
 * Four things this gets right that a hand-rolled icon button does not:
 *   · the fill is `button/outline/tertiary/resting-bg` — TRANSPARENT, not white,
 *     so the row's hover/selected tint shows through it
 *   · the border is `button/outline/tertiary/resting-border` (#dce1eb), not the
 *     #d0e5f6 secondary border
 *   · it is sized by padding (iconbtn-medium-padding-x / medium-paddings-y = 5)
 *     around a 20px icon box holding a 15px glyph — not a hardcoded 30×24
 *
 * No shadow. Figma's codegen emits a `drop-shadow` bound to
 * button/solid/resting-shadow-* on the Button/Outline wrapper, but that effect
 * is disabled on this component — the rendered component is flat. The token
 * stays in tokens.ts as `button.solidShadow` for the variants that do use it.
 */
function RowActionsButton() {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label="More actions"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: `${btn.mediumPaddingY}px ${btn.iconBtnPaddingX}px`,
        border: `${btn.borderWidth}px solid ${color.outlineTertiaryBorder}`,
        borderRadius: btn.radius,
        background: hover ? color.surfaceSubtlest : color.outlineTertiaryBg,
        color: color.outlineTertiaryText,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: btn.iconBoxS,
          height: btn.iconBoxS,
        }}
      >
        <FontAwesomeIcon icon={faEllipsis} style={{ width: icon.s, height: icon.s }} />
      </span>
    </button>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────
const HEAD: React.CSSProperties = {
  height: t.headerHeight,
  paddingLeft: t.headerPaddingLeft,
  paddingRight: t.headerPaddingRight,
  textAlign: 'left',
  ...type.tableHeader,
  color: color.textMuted,
  borderBottom: `1px solid ${color.borderSubtle}`,
  whiteSpace: 'nowrap',
  // table/header/resting-bg is transparent; the white comes from table/bg beneath.
  backgroundColor: color.white,
};

const CELL: React.CSSProperties = {
  height: t.cellMinHeight,
  paddingLeft: t.cellPaddingLeft,
  paddingRight: t.cellPaddingRight,
  paddingTop: t.cellPaddingY,
  paddingBottom: t.cellPaddingY,
  borderBottom: `1px solid ${color.borderSubtle}`,
  ...type.tableCell,
  color: color.text,
  verticalAlign: 'middle',
  // Table/Cell/Value is a single ellipsised line in the frame — never wrapped.
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: t.colMaxWidth,
};

function Row({
  row,
  checked,
  onCheck,
  onOpen,
}: {
  row: DocumentRow;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: (row: DocumentRow, view?: DocView) => void;
}) {
  const [hover, setHover] = useState(false);
  // table/cell/{resting,hover,selected}-bg. Selected wins over hover.
  const bg = checked ? color.cellSelectedBg : hover ? color.cellHoverBg : 'transparent';
  return (
    <tr
      aria-selected={checked}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: bg, transition: 'background-color 100ms' }}
    >
      <td style={{ ...CELL, width: t.colCheckbox, minWidth: t.colCheckbox, paddingLeft: 10, paddingRight: 5 }}>
        <Checkbox checked={checked} onChange={onCheck} />
      </td>

      <td style={{ ...CELL, width: t.colEntity, minWidth: t.colEntity, paddingLeft: 5, paddingRight: 5, textAlign: 'center' }}>
        {/* The file-type glyph opens the document preview */}
        <button
          type="button"
          aria-label={`Open ${row.submittedName}`}
          title={`Open ${row.submittedName}`}
          onClick={() => onOpen(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: btn.iconBoxS,
            height: btn.iconBoxS,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon
            icon={row.kind === 'pdf' ? faFilePdf : faFileWord}
            style={{ width: icon.m, height: icon.m, color: row.kind === 'pdf' ? '#e5252a' : '#2b579a' }}
          />
        </button>
      </td>

      <td style={{ ...CELL, width: t.colMoreButton, minWidth: t.colMoreButton, paddingLeft: 5, paddingRight: 5 }}>
        <RowActionsButton />
      </td>

      <td style={{ ...CELL, width: t.colFavorite, minWidth: t.colFavorite, paddingLeft: 5, paddingRight: 5, textAlign: 'center' }}>
        <FontAwesomeIcon icon={faStar} style={{ width: icon.s, height: icon.s, color: color.iconFaint }} />
      </td>

      <td style={{ ...CELL, width: t.col4Icon, minWidth: t.col4Icon, maxWidth: t.col4Icon, paddingLeft: 5, paddingRight: 5 }}>
        <RowGlyphs glyphs={row.glyphs} />
      </td>

      <td style={CELL}>
        {/* The badge sits under the name, the way the role sits under a person's
            name elsewhere — the pair is 20 + 4 + 20, inside the 45px row. */}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 0 }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onOpen(row); }}
            title={row.submittedName}
            style={{ ...type.link, color: color.primary, textDecoration: 'none', whiteSpace: 'nowrap',
                     maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {row.submittedName}
          </a>
          {row.report && (
            <TrainingReportBadge summary={row.report} onOpenReport={() => onOpen(row, 'training')} />
          )}
        </span>
      </td>

      <td style={CELL} title={row.generatedName}>{row.generatedName}</td>

      <td style={CELL}>{row.status && <Status label={row.status} tone={row.statusTone} />}</td>

      <td style={CELL}>{row.submittedOn}</td>

      <td style={CELL}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap, minWidth: 0 }}>
          <FontAwesomeIcon icon={faUser} style={{ width: icon.s, height: icon.s, color: color.iconFaint, flexShrink: 0 }} />
          <a href="#" style={{ ...type.link, color: color.primary, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {row.owner}
          </a>
        </span>
      </td>
    </tr>
  );
}

export function DocumentGrid({ onOpen }: { onOpen: (row: DocumentRow, view?: DocView) => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pageNum, setPageNum] = useState(1);

  const allChecked = selected.size === DOCUMENTS.length;

  const toggleAll = (v: boolean) => setSelected(v ? new Set(DOCUMENTS.map(d => d.id)) : new Set());

  const toggleOne = (id: number, v: boolean) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (v) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    // table/bg #ffffff, table/radius 10
    <div
      style={{
        flex: '1 0 0',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: color.white,
        borderRadius: t.radius,
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: '1 0 0', minHeight: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ ...HEAD, width: t.colCheckbox, minWidth: t.colCheckbox, paddingLeft: 10, paddingRight: 5 }}>
                <Checkbox checked={allChecked} onChange={toggleAll} />
              </th>
              <th style={{ ...HEAD, width: t.colEntity, minWidth: t.colEntity, paddingLeft: 5, paddingRight: 5 }} />
              <th style={{ ...HEAD, width: t.colMoreButton, minWidth: t.colMoreButton, paddingLeft: 5, paddingRight: 5 }} />
              <th style={{ ...HEAD, width: t.colFavorite, minWidth: t.colFavorite, paddingLeft: 5, paddingRight: 5 }} />
              <th style={{ ...HEAD, width: t.col4Icon, minWidth: t.col4Icon, paddingLeft: 5, paddingRight: 5 }} />
              <th style={HEAD}>Submitted Name</th>
              <th style={HEAD}>Generated Name</th>
              <th style={HEAD}>Document Status</th>
              <th style={HEAD}>Submitted on</th>
              <th style={HEAD}>Document Owner</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map(row => (
              <Row
                key={row.id}
                row={row}
                checked={selected.has(row.id)}
                onCheck={v => toggleOne(row.id, v)}
                onOpen={onOpen}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination/* — right aligned, page-input-width 35 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: pg.gapM,
          padding: `${pg.paddingTop}px ${pg.paddingX}px ${pg.paddingBottom}px`,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => setPageNum(p => Math.max(1, p - 1))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            border: 'none',
            borderRadius: 5,
            background: 'transparent',
            color: color.primary,
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faAngleLeft} style={{ width: icon.s, height: icon.s }} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: pg.gapXs }}>
          <input
            value={pageNum}
            onChange={e => {
              const n = Number(e.target.value.replace(/\D/g, ''));
              if (n >= 1 && n <= TOTAL_PAGES) setPageNum(n);
            }}
            style={{
              width: pg.pageInputWidth,
              height: 30,
              textAlign: 'center',
              backgroundColor: color.pageBg,
              border: 'none',
              borderBottom: `1px solid ${color.border}`,
              borderRadius: '5px 5px 0 0',
              outline: 'none',
              ...type.body,
              color: color.text,
            }}
          />
          <span style={{ ...type.body, color: color.textMuted }}>
            of <b style={{ color: color.text }}>{TOTAL_PAGES}</b>
          </span>
        </div>

        <button
          type="button"
          aria-label="Next page"
          onClick={() => setPageNum(p => Math.min(TOTAL_PAGES, p + 1))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            border: 'none',
            borderRadius: 5,
            background: 'transparent',
            color: color.primary,
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faAngleRight} style={{ width: icon.s, height: icon.s }} />
        </button>
      </div>
    </div>
  );
}

export { DOCUMENT_COUNT };
export default DocumentGrid;
