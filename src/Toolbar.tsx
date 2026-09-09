import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faLock,
  faCircleDown,
  faCircleUp,
  faCartShopping,
  faTableColumns,
  faMagnifyingGlass,
  faAngleDown,
  faList,
  faTableCellsLarge,
  faEye,
  faFilter,
  faRotate,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { color, type, toolbar as tb, button as btn, icon } from './tokens';

/**
 * Button/Flat — DS - Base | IN PROGRESS | 2.0, Toolbars node 11403:85686.
 *
 * The tone color applies to the WHOLE button, icon and label alike — a flat
 * button in a toolbar is not a colored glyph beside dark text. Chrome is fully
 * transparent (`primary/resting-bg` and `resting-border` are both #ffffff00),
 * and the box is tight: padding-x 2, padding-y 1, gap 5.
 * The glyph is icons/solid/s (15px) centered in a button/solid/icon-size-s (20px) box.
 */
function ToolbarButton({
  glyph,
  label,
  caret = false,
  tone = color.flatPrimaryText,
}: {
  glyph: IconDefinition;
  label: string;
  caret?: boolean;
  tone?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: btn.flatGap,
        padding: `${btn.flatPaddingY}px ${btn.flatPaddingX}px`,
        border: `${btn.flatBorderWidth}px solid transparent`,
        borderRadius: btn.flatRadius,
        background: hover ? color.surfaceSubtlest : 'transparent',
        color: tone,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...type.button,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: btn.iconBoxS,
          height: btn.iconBoxS,
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s }} />
      </span>
      {label}
      {caret && <FontAwesomeIcon icon={faAngleDown} style={{ width: 11, height: 11, flexShrink: 0 }} />}
    </button>
  );
}

/**
 * Button/Outline/Secondary — the toolbar's trailing icon buttons.
 * Transparent bg, #d0e5f6 border (not the #dce1eb tertiary border), brand glyph.
 */
function OutlineIconButton({ glyph, label }: { glyph: IconDefinition; label: string }) {
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
        padding: `${btn.mediumPaddingY}px ${btn.iconBtnPaddingX}px`,
        border: `${btn.borderWidth}px solid ${color.borderSecondary}`,
        borderRadius: btn.radius,
        background: hover ? color.surfaceSubtlest : 'transparent',
        color: color.primary,
        cursor: 'pointer',
        flexShrink: 0,
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
        <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s }} />
      </span>
    </button>
  );
}

/** Controls/View Switcher — selected #4c88bd + white glyph, resting white + brand glyph */
function ViewSwitcher() {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const Item = ({ id, glyph }: { id: 'list' | 'grid'; glyph: IconDefinition }) => {
    const on = view === id;
    return (
      <button
        type="button"
        aria-label={id}
        onClick={() => setView(id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          border: `1px solid ${color.border}`,
          borderRadius: 5,
          background: on ? color.switcherSelectedBg : color.white,
          color: on ? color.white : color.primary,
          cursor: 'pointer',
        }}
      >
        <FontAwesomeIcon icon={glyph} style={{ width: 15, height: 15 }} />
      </button>
    );
  };
  return (
    <div style={{ display: 'inline-flex', gap: 5 }}>
      <Item id="list" glyph={faList} />
      <Item id="grid" glyph={faTableCellsLarge} />
    </div>
  );
}

/** toolbar/* — height 40, bg #e5f1fb, radius 5, padding-x 15, gap 15 */
export function PrimaryToolbar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tb.gap,
        height: tb.height,
        padding: `0 ${tb.paddingX}px`,
        backgroundColor: color.toolbarBg,
        borderRadius: tb.radius,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tb.gap, minWidth: 0 }}>
        <ToolbarButton glyph={faFileLines} label="Document" caret />
        <ToolbarButton glyph={faLock} label="Manage Security" />
        <ToolbarButton glyph={faCircleDown} label="Import" caret />
        <ToolbarButton glyph={faCircleUp} label="Export" caret />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tb.gap, flexShrink: 0 }}>
        <OutlineIconButton glyph={faMagnifyingGlass} label="Search" />
        <ToolbarButton glyph={faCartShopping} label="Cart" />
        <ToolbarButton glyph={faTableColumns} label="Layout" caret />
      </div>
    </div>
  );
}

export function ResultsBar({ count }: { count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tb.gap,
        padding: `${tb.paddingX}px 0`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        <FontAwesomeIcon icon={faRotate} style={{ width: icon.s, height: icon.s, color: color.primary, flexShrink: 0 }} />
        <span style={{ ...type.bodyBold, color: color.text }}>{count} Documents</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tb.gap, flexShrink: 0 }}>
        <ViewSwitcher />
        <ToolbarButton glyph={faTableColumns} label="Manage Columns" />
        <ToolbarButton glyph={faEye} label="Views" caret />
        <ToolbarButton glyph={faFilter} label="Filters" />
      </div>
    </div>
  );
}
