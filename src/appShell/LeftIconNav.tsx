import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompass,
  faCircleInfo,
  faFileLines,
  faTableCellsLarge,
  faGlobe,
  faTable,
  faAddressCard,
  faClipboardList,
  faCircleQuestion,
  faLayerGroup,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { color, nav } from '../tokens';

// Navigation — DS - Advanced | IN PROGRESS | 2.0, node 86:184835.
// Adapted from ai-course-authoring-flow/src/appShell/LeftIconNav.tsx.
//
// Item states on the saturated (default) theme, per navigation-main/item/*:
//   resting  → transparent over navigation-main/bg (#1f6aac)
//   hover    → #164b7a
//   selected → #113a5f
// The glyph is navigation-main/item/icon-container/icon (#ffffff) in every state —
// it does not invert. The 2px #5391c6 level-border is the 2nd-level accent bar on
// the expanded (240px) rail and does not apply to these 1st-level collapsed items.

interface NavIconProps {
  icon: IconDefinition;
  label: string;
  selected?: boolean;
}

function NavIcon({ icon, label, selected = false }: NavIconProps) {
  const [hover, setHover] = useState(false);

  const bg = selected ? color.navSelectedBg : hover ? color.navHoverBg : 'transparent';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-current={selected ? 'page' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: nav.itemWidth,
        height: nav.itemMaxHeight,
        minHeight: nav.itemMinHeight,
        padding: 0,
        border: 'none',
        backgroundColor: bg,
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ width: nav.iconSize, height: nav.iconSize, color: color.navIcon }} />
    </button>
  );
}

export function LeftIconNav() {
  return (
    <div
      style={{
        width: nav.collapsedWidth,
        flexShrink: 0,
        backgroundColor: color.navBg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: nav.paddingY }}>
        <NavIcon icon={faCompass} label="Explore" />
        <NavIcon icon={faCircleInfo} label="Info" />
        <NavIcon icon={faFileLines} label="Documents" selected />
        <NavIcon icon={faTableCellsLarge} label="Modules" />
        <NavIcon icon={faGlobe} label="Global" />
        <NavIcon icon={faTable} label="Grid" />
        <NavIcon icon={faAddressCard} label="Contacts" />
        <NavIcon icon={faClipboardList} label="Reports" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: nav.paddingY }}>
        <NavIcon icon={faCircleQuestion} label="Help" />
        {/* navigation-main/logo-container — height 55, padding-x 15, gap 5 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: nav.logoGap,
            height: nav.logoHeight,
            padding: `0 ${nav.logoPaddingX}px`,
          }}
        >
          <FontAwesomeIcon icon={faLayerGroup} style={{ width: 26, height: 26, color: color.navIcon }} />
        </div>
      </div>
    </div>
  );
}

export default LeftIconNav;
