import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faSliders, faTableColumns, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { color, type, pageHeader as ph, button as btn, icon } from './tokens';

// Page header — Design Patterns | IN PROGRESS | 2.0, node 2021:8233.
// Carries the page title, the Views dropdown and the view chip row. The
// "View By" selection lives here rather than in the navigation tree.

/** Button/Outline/Primary — transparent bg, #1f6aac border and text */
function ViewsDropdown() {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        minWidth: btn.mediumMinWidth,
        padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
        border: `${btn.borderWidth}px solid ${color.outlinePrimary}`,
        borderRadius: btn.radius,
        backgroundColor: hover ? 'rgba(31,106,172,0.08)' : 'transparent',
        color: color.outlinePrimary,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...type.button,
      }}
    >
      Views
      <FontAwesomeIcon icon={faAngleDown} style={{ width: 11, height: 11, flexShrink: 0 }} />
    </button>
  );
}

/**
 * Button/Outline/Tertiary — the view chips.
 *   resting  → transparent bg, #dce1eb border, #1f6aac text
 *   selected → #5391c6 bg + border, #ffffff text
 * Labels ellipsis at button/medium-max-label-width (200).
 */
function ViewChip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: btn.mediumMinWidth,
        maxWidth: btn.mediumMaxLabelWidth,
        padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
        border: `${btn.borderWidth}px solid ${selected ? color.chipSelectedBg : color.chipRestingBorder}`,
        borderRadius: btn.radius,
        backgroundColor: selected ? color.chipSelectedBg : hover ? color.white : 'transparent',
        color: selected ? color.chipSelectedText : color.chipRestingText,
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'background-color 100ms',
        ...type.button,
      }}
    >
      {label}
    </button>
  );
}

/** Button/Outline/Tertiary — trailing controls */
function TertiaryButton({ glyph, label, iconOnly = false }: { glyph: IconDefinition; label: string; iconOnly?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: iconOnly
          ? `${btn.mediumPaddingY}px ${btn.iconBtnPaddingX}px`
          : `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
        border: `${btn.borderWidth}px solid ${color.chipRestingBorder}`,
        borderRadius: btn.radius,
        backgroundColor: hover ? color.white : 'transparent',
        color: color.chipRestingText,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...type.button,
      }}
    >
      <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s, flexShrink: 0 }} />
      {!iconOnly && label}
    </button>
  );
}

export interface PageHeaderProps {
  title: string;
  views: string[];
}

export function PageHeader({ title, views }: PageHeaderProps) {
  const [active, setActive] = useState(views[0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: ph.gapM,
        padding: `${ph.paddingY}px ${ph.paddingX}px`,
        backgroundColor: color.pageHeaderBg,
        borderBottom: `${ph.borderWidth}px solid transparent`,
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <h1 style={{ margin: 0, ...type.h1, color: color.pageHeaderText, flexShrink: 0 }}>{title}</h1>

      <ViewsDropdown />

      {/* View chips — first entry is the selected view */}
      <div style={{ display: 'flex', alignItems: 'center', gap: ph.gapS, minWidth: 0, overflowX: 'auto' }}>
        {views.map(v => (
          <ViewChip key={v} label={v} selected={v === active} onSelect={() => setActive(v)} />
        ))}
      </div>

      <div style={{ flex: '1 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: ph.gapS, flexShrink: 0 }}>
        <TertiaryButton glyph={faSliders} label="Settings" iconOnly />
        <TertiaryButton glyph={faTableColumns} label="Layout" />
      </div>
    </div>
  );
}

export default PageHeader;
