import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEllipsis,
  faPenToSquare,
  faWindowRestore,
  faAngleDown,
  faTableList,
  faWandMagicSparkles,
  faCircleNodes,
  faClockRotateLeft,
  faLink,
  faFileLines,
  faCheck,
  faCopy,
  faRotateRight,
  faGraduationCap,
  faRectangleList,
  faCircleInfo,
  faMagnifyingGlass,
  faComment,
  faImage,
  faAlignLeft,
  faUserTag,
  faFlag,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import {
  color,
  type,
  docHeader as dh,
  idPill,
  qvPanel as qv,
  tabs as tb,
  progressBar as pb,
  sysMsg,
  indicator as ind,
  favorite as fav,
  button as btn,
  buttonGroup as bg,
  toolbar as tbar,
  table as t,
  status as st,
  pageHeader as ph,
  icon,
} from './tokens';
import { DocumentRow } from './documentsData';
import { currentSite } from './siteContext';

// Document preview — eTMF | IN PROGRESS | 10.9.1-10.9.2, node 32984:13253.
// Occupies the area right of the main nav rail, replacing the page header,
// tree and grid. Layout: doc header → action toolbar → [viewer | qv nav | qv panel].

// Public assets resolve against Vite's base, which is '/' in dev and
// '/doa-log-report/' on GitHub Pages. Hardcoding a leading slash 404s there.
const PDF_SRC = import.meta.env.BASE_URL + 'DOA.pdf';
const PDF_PAGE_COUNT = 1; // DOA.pdf is a single page
const TRAINING_REPORT_SRC = import.meta.env.BASE_URL + 'cross-module-check.html';

/** Button/Outline in the success / warning / error / tertiary tones */
function OutlineButton({
  label,
  text,
  border,
  minWidth = btn.mediumMinWidth,
}: {
  label: string;
  text: string;
  border: string;
  minWidth?: number;
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
        justifyContent: 'center',
        minWidth,
        padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
        border: `${btn.borderWidth}px solid ${border}`,
        borderRadius: btn.radius,
        background: hover ? color.surfaceSubtlest : 'transparent',
        color: text,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...type.button,
      }}
    >
      {label}
    </button>
  );
}

/**
 * Button Group — eTMF node 34312:227297. A segmented toggle of
 * `button/solid/tertiary` buttons sharing one `button-group` border.
 *   selected → bg + border #5391c6, white label
 *   resting  → white bg, #dce1eb border, #1f6aac label
 * Segments are Buttons/Small with small paddings (10 × 5) and a 45px min width.
 */
function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      role="group"
      style={{
        display: 'inline-flex',
        border: `${bg.borderWidth}px solid ${color.buttonGroupBorder}`,
        borderRadius: bg.radius,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {options.map((opt, i) => {
        const on = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt.id)}
            style={{
              minWidth: btn.smallMinWidth,
              padding: `${btn.smallPaddingY}px ${btn.smallPaddingX}px`,
              border: 'none',
              borderLeft: i > 0 ? `${bg.borderWidth}px solid ${color.buttonGroupBorder}` : 'none',
              background: on ? color.solidTertiarySelectedBg : color.solidTertiaryRestingBg,
              color: on ? color.solidTertiarySelectedText : color.solidTertiaryRestingText,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              ...type.buttonSmall,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Button/Flat primary — the action toolbar entries */
function FlatButton({
  glyph,
  label,
  caret = false,
  onClick,
  disabled = false,
}: {
  glyph?: IconDefinition;
  label: string;
  caret?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: btn.flatGap,
        padding: `${btn.flatPaddingY}px ${btn.flatPaddingX}px`,
        border: `${btn.flatBorderWidth}px solid transparent`,
        borderRadius: btn.flatRadius,
        background: hover ? color.surfaceSubtlest : 'transparent',
        color: color.flatPrimaryText,
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        ...type.button,
      }}
    >
      {glyph && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: btn.iconBoxS, height: btn.iconBoxS }}>
          <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s }} />
        </span>
      )}
      {label}
      {caret && <FontAwesomeIcon icon={faAngleDown} style={{ width: 11, height: 11 }} />}
    </button>
  );
}

// ─── Doc header ──────────────────────────────────────────────────────────────
export type DocView = 'preview' | 'training';

const DOC_VIEWS: { id: DocView; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'training', label: 'Training Requirements' },
];

function DocHeader({
  doc,
  onBack,
  view,
  onViewChange,
}: {
  doc: DocumentRow;
  onBack: () => void;
  view: DocView;
  onViewChange: (v: DocView) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: dh.rowGap,
        padding: `${ph.paddingY}px ${ph.paddingX}px`,
        backgroundColor: color.pageHeaderBg,
        borderBottom: `${ph.borderWidth}px solid ${color.borderSubtle}`,
        flexShrink: 0,
      }}
    >
      {/* Row 1 — back · id · phase · status · markers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: dh.gapXM, minWidth: 0 }}>
        <button
          type="button"
          aria-label="Back to list"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${btn.mediumPaddingY}px ${btn.iconBtnPaddingX}px`,
            border: `${btn.borderWidth}px solid ${color.outlineTertiaryBorder}`,
            borderRadius: btn.radius,
            background: 'transparent',
            color: color.outlineTertiaryText,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: btn.iconBoxS, height: btn.iconBoxS }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ width: icon.s, height: icon.s }} />
          </span>
        </button>

        {/* id/* pill */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: idPill.gap,
            padding: `${idPill.paddingY}px ${idPill.paddingX}px`,
            borderRadius: idPill.radius,
            color: color.idText,
            ...type.captionSemibold,
            flexShrink: 0,
          }}
        >
          12345677
        </span>

        {/* Status/Flat grey — the workflow phase */}
        <span style={{ ...type.status, color: color.statusFlatGrey, flexShrink: 0 }}>INDEXING</span>

        {/* Status/Solid orange — the QC state, carried from the row */}
        {doc.status && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              maxWidth: st.labelMaxWidth,
              padding: `0 ${st.paddingX}px`,
              borderRadius: st.radius,
              backgroundColor: color.statusOrange,
              color: color.text,
              ...type.status,
              flexShrink: 0,
            }}
          >
            {doc.status}
          </span>
        )}

        {/* header/doc/icon-size = 20 */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: dh.gapXs, flexShrink: 0 }}>
          <FontAwesomeIcon icon={faUserTag} style={{ width: dh.iconSize, height: dh.iconSize, color: color.discover }} />
          <FontAwesomeIcon icon={faFlag} style={{ width: dh.iconSize, height: dh.iconSize, color: color.informational }} />
        </span>
      </div>

      {/* Row 2 — favorite · title · view toggle · decisions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: dh.gapXs, minWidth: 0 }}>
        {/* Favorite — a 20px icons/regular glyph inside a favorite/icon-size-m (30) box */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: fav.iconSizeM,
            height: fav.iconSizeM,
            borderRadius: fav.radius,
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faStar} style={{ width: icon.m, height: icon.m, color: color.iconFaint }} />
        </span>
        {/* star → title is gap-x-xs (5); title → button group is gap-x-m (15) */}
        <h1
          title={doc.submittedName}
          style={{
            margin: 0,
            ...type.h4,
            color: color.docHeaderText,
            flex: '0 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.submittedName}
        </h1>

        {/* row gap is gap-x-xs (5); this makes up the difference to gap-x-m (15) */}
        <span style={{ marginLeft: dh.gapXM - dh.gapXs, display: 'inline-flex', flexShrink: 0 }}>
          <ButtonGroup options={DOC_VIEWS} value={view} onChange={onViewChange} />
        </span>

        <div style={{ flex: '1 0 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: ph.gapS, flexShrink: 0 }}>
          <OutlineButton label="Approve" text={color.outlineSuccess} border={color.outlineSuccess} />
          <OutlineButton label="Clarify" text={color.outlineWarningText} border={color.outlineWarningBorder} />
          <OutlineButton label="Reject" text={color.outlineError} border={color.outlineError} />
          <button
            type="button"
            aria-label="More actions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${btn.mediumPaddingY}px ${btn.iconBtnPaddingX}px`,
              border: `${btn.borderWidth}px solid ${color.outlineTertiaryBorder}`,
              borderRadius: btn.radius,
              background: 'transparent',
              color: color.outlineTertiaryText,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: btn.iconBoxS, height: btn.iconBoxS }}>
              <FontAwesomeIcon icon={faEllipsis} style={{ width: icon.s, height: icon.s }} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Viewer ──────────────────────────────────────────────────────────────────
const RIBBON = ['File', 'Home', 'Insert', 'Layout', 'References', 'Collaboration', 'Plugins', 'Clinical Trial'];
const VIEWER_TOOLS: IconDefinition[] = [faMagnifyingGlass, faComment, faImage, faAlignLeft];

function Viewer({ view, reportRef }: { view: DocView; reportRef: React.RefObject<HTMLIFrameElement> }) {
  return (
    <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: color.white }}>
      {/* Editor ribbon — PDF viewer chrome only */}
      {view === 'preview' && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tbar.gap,
          height: tbar.height,
          padding: `0 ${tbar.paddingX}px`,
          borderBottom: `1px solid ${color.borderSubtle}`,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {RIBBON.map(item => (
          <span key={item} style={{ ...type.button, color: color.text, whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {item}
          </span>
        ))}
      </div>
      )}

      <div style={{ flex: '1 0 0', minHeight: 0, display: 'flex' }}>
        {/* Left tool strip — PDF viewer chrome only */}
        {view === 'preview' && (
        <div
          style={{
            width: 40,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tbar.gap,
            paddingTop: tbar.gap,
            borderRight: `1px solid ${color.borderSubtle}`,
          }}
        >
          {VIEWER_TOOLS.map((g, i) => (
            <FontAwesomeIcon key={i} icon={g} style={{ width: icon.s, height: icon.s, color: color.textMuted }} />
          ))}
        </div>
        )}

        {/* Page area — the real PDF, or the Training Requirements segment */}
        <div style={{ flex: '1 0 0', minWidth: 0, backgroundColor: view === 'preview' ? '#e8e8e8' : color.pageBg, overflow: 'hidden' }}>
          {view === 'preview' ? (
            <iframe
              src={`${PDF_SRC}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={`${currentSite().label} — Delegation of Authority Log v4.0`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          ) : (
            // Training Requirements — the standalone cross-module check demo. It lives at
            // public/cross-module-check.html so it also runs on its own in a browser
            // and screen-records cleanly, independent of this app.
            <iframe
              ref={reportRef}
              src={TRAINING_REPORT_SRC}
              title="Cross-module check — delegation log"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', backgroundColor: color.pageBg }}
            />
          )}
        </div>
      </div>

      {/* Page footer — PDF viewer chrome only; the report names itself. */}
      {view === 'preview' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${btn.mediumPaddingY}px ${tbar.paddingX}px`,
            borderTop: `1px solid ${color.borderSubtle}`,
            ...type.captionRegular,
            color: color.textMuted,
            flexShrink: 0,
          }}
        >
          Page 1 of {PDF_PAGE_COUNT}
        </div>
      )}
    </div>
  );
}

// ─── QV panel navigation ─────────────────────────────────────────────────────
interface QvItem {
  id: string;
  glyph: IconDefinition;
  label: string;
  count?: number;
}

const QV_ITEMS: QvItem[] = [
  { id: 'metadata', glyph: faTableList, label: 'Metadata' },
  { id: 'automate', glyph: faWandMagicSparkles, label: 'Automate' },
  { id: 'workflow', glyph: faCircleNodes, label: 'Workflow' },
  { id: 'versions', glyph: faClockRotateLeft, label: 'Versions', count: 3 },
  { id: 'related', glyph: faLink, label: 'Related', count: 3 },
  { id: 'history', glyph: faFileLines, label: 'Doc History' },
];

/**
 * qv-panel/navigation/item — DS - Advanced | IN PROGRESS | 2.0, node 926:14565.
 *
 * The five states the component ships, and the three things this got wrong:
 *   · ORDER. The item is Icon Wrapped, then "Text + Counter" — so the counter
 *     sits BETWEEN the icon and the label, not above the icon.
 *   · ICON SIZE. qv-panel/navigation/item's icon is a 30px CONTAINER holding an
 *     Icons/solid/m (20) glyph — the glyph is not itself 30.
 *   · STATES. resting → transparent; hover → hover-bg with the resting icon and
 *     text tones unchanged; selected → selected-bg with white icon, label and
 *     counter; focus → the hover (or selected) fill plus the elevation/focus
 *     inner ring. Hover and focus were missing entirely.
 *
 * The item is a fixed 75 wide with a 75 min-height, gap 0, padding-xy 5.
 */
function QvNavItem({ item, selected, onSelect }: { item: QvItem; selected: boolean; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  const bg = selected ? color.qvNavSelectedBg : hover || focus ? color.qvNavHoverBg : 'transparent';
  const fg = selected ? color.qvNavSelectedText : color.qvNavRestingText;
  const iconColor = selected ? color.qvNavSelectedText : color.qvNavRestingIcon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: qv.navItemGap,
        width: qv.navItemWidth,
        minHeight: qv.navItemMinHeight,
        padding: qv.navItemPaddingXY,
        border: 'none',
        backgroundColor: bg,
        color: fg,
        // The ring is an inner shadow, so it never changes the item's box.
        boxShadow: focus ? qv.focusShadow : 'none',
        outline: 'none',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      {/* Icon Wrapped — a 30px box, glyph 20 */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: qv.navItemIconSize,
          height: qv.navItemIconSize,
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={item.glyph} style={{ width: qv.navItemGlyph, height: qv.navItemGlyph, color: iconColor }} />
      </span>

      {/* Text + Counter — counter above the label, both centred, both full width */}
      {item.count != null && <span style={{ ...type.counter, color: fg, width: '100%', textAlign: 'center' }}>{item.count}</span>}
      <span style={{ ...type.captionRegular, color: fg, width: '100%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.label}
      </span>
    </button>
  );
}

function QvNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div
      style={{
        width: qv.navWidth,
        flexShrink: 0,
        backgroundColor: color.qvNavBg,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${color.borderSubtle}`,
      }}
    >
      {QV_ITEMS.map(item => (
        <QvNavItem key={item.id} item={item} selected={active === item.id} onSelect={() => onSelect(item.id)} />
      ))}
    </div>
  );
}

// ─── QV panel ────────────────────────────────────────────────────────────────
const PANEL_TABS = [
  { id: 'automate', label: 'Automate' },
  { id: 'flags', label: 'AI Suggested Flags' },
  { id: 'crossdoc', label: 'Cross-Doc Check', dot: true },
];

// The document is one site's, so its extracted metadata names that site and
// its investigator — the same site the tree files it under and the LMS linked to.
const MAPPED_FIELDS = [
  { label: 'Document Type', value: 'Delegation of Authority' },
  { label: 'Document Date', value: '25 Apr 2025' },
  { label: 'PI', value: currentSite().pi },
  { label: 'Investigative Site', value: currentSite().label },
];

const EXTRACTED_FIELDS = [
  { value: '25 Oct 2025', label: 'Signature Date' },
  { value: 'Other Statement of Qualifications', label: 'Training Name' },
];

/**
 * Tab — DS - Advanced | IN PROGRESS | 2.0, node 86:270983.
 *
 * Three things that are easy to get wrong and were wrong here:
 *   · the underline is NOT a border on the tab. It is its own absolutely
 *     positioned bar pinned to the inner "Tab Part", 5px BELOW it, with
 *     radius 100 — so it spans the label, not the tab's 2px padding.
 *   · hovering sets tabs/hover-bg (#e5f1fb), whether or not the tab is selected.
 *   · the indicator is absolutely positioned at right -6 / top -4 on the Tab
 *     Part, not an inline flex child that pushes the label around.
 */
function PanelTab({
  label,
  selected,
  indicator: hasIndicator,
  counter,
  onClick,
}: {
  label: string;
  selected: boolean;
  indicator?: boolean;
  counter?: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-selected={selected}
      role="tab"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tb.gap,
        height: tb.height,
        padding: `0 ${tb.paddingX}px`,
        border: 'none',
        borderRadius: tb.radius,
        // tabs/{resting,selected}-bg are both transparent; hover is the only fill
        background: hover ? color.tabsHoverBg : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      {/* Tab Part — the underline and indicator anchor to this, not the button */}
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: tb.gap }}>
        <span
          title={label}
          style={{
            ...type.h5,
            color: selected ? color.tabsSelectedText : hover ? color.tabsHoverText : color.tabsRestingText,
            maxWidth: tb.maxLabelWidth,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {label}
        </span>

        {counter != null && (
          <span style={{ ...type.counterLarge, color: color.tabsCounterText, whiteSpace: 'nowrap' }}>{counter}</span>
        )}

        {/* Underline */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: tb.underlineOffset,
            height: tb.underlineWidth,
            borderRadius: tb.underlineRadius,
            backgroundColor: selected ? color.tabsUnderline : 'transparent',
          }}
        />

        {/* Indicator/Default */}
        {hasIndicator && (
          <span
            style={{
              position: 'absolute',
              right: ind.offsetRight,
              top: ind.offsetTop,
              width: ind.size,
              height: ind.size,
              maxWidth: ind.maxSize,
              maxHeight: ind.maxSize,
              borderRadius: ind.radius,
              backgroundColor: color.critical,
              border: `${ind.borderWidth}px solid ${color.white}`,
            }}
          />
        )}
      </span>
    </button>
  );
}

function QvPanelBody() {
  const [tab, setTab] = useState('automate');

  return (
    <div
      style={{
        // A third of the window, rather than the DS's fixed qv-panel/width (600).
        // qv-panel/{min,max}-width are kept as clamps: below a ~1200px window a
        // third would drop under the 400px minimum, and above ~2700px it would
        // exceed the 900px maximum.
        width: '33.3333vw',
        minWidth: qv.minWidth,
        maxWidth: qv.maxWidth,
        flexShrink: 0,
        backgroundColor: color.white,
        borderLeft: `1px solid ${color.borderSubtle}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tabs */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tb.rowGapXM,
          // extra bottom room so the underline (bottom: -5) is not clipped
          padding: `${ph.paddingY}px ${ph.paddingX}px ${ph.gapS}px`,
          flexShrink: 0,
        }}
      >
        {PANEL_TABS.map(t2 => (
          <PanelTab
            key={t2.id}
            label={t2.label}
            selected={tab === t2.id}
            indicator={t2.dot}
            onClick={() => setTab(t2.id)}
          />
        ))}
      </div>

      <div style={{ flex: '1 0 0', minHeight: 0, overflowY: 'auto', padding: ph.paddingX, display: 'flex', flexDirection: 'column', gap: ph.gapM }}>
        {/* Confidence — Progress Bar small */}
        <div style={{ display: 'flex', alignItems: 'center', gap: pb.gap }}>
          <span style={{ ...type.captionSemibold, color: color.statusFlatOrange, flexShrink: 0 }}>MEDIUM</span>
          <div style={{ flex: '1 0 0', height: pb.height, borderRadius: pb.radius, backgroundColor: color.progressTrack, overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', borderRadius: pb.radius, backgroundColor: color.progressOrange }} />
          </div>
        </div>

        {/* Toolbar of automate actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tbar.gap,
            height: tbar.height,
            padding: `0 ${tbar.paddingX}px`,
            backgroundColor: color.toolbarBg,
            borderRadius: tbar.radius,
            flexShrink: 0,
          }}
        >
          <FlatButton glyph={faFileLines} label="View Automate Response" />
          <FlatButton glyph={faRotateRight} label="Automate Re-Submit" />
        </div>

        {/* System Message — neutral */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: sysMsg.gapS,
            minWidth: sysMsg.minWidth,
            maxWidth: sysMsg.maxWidth,
            padding: sysMsg.paddingXY,
            borderRadius: sysMsg.radius,
            backgroundColor: color.sysMsgBg,
          }}
        >
          <FontAwesomeIcon
            icon={faCircleInfo}
            style={{ width: sysMsg.iconSize, height: sysMsg.iconSize, color: color.sysMsgIcon, flexShrink: 0, marginTop: 2 }}
          />
          <span style={{ ...type.body, color: color.sysMsgText }}>
            This document outlines the delegation of study tasks and the qualifications of the personnel each task was
            delegated to.
          </span>
        </div>

        {/* Mapped fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.gap }}>
          <span style={{ ...type.bodyBold, color: color.text }}>{MAPPED_FIELDS.length}</span>
          <span style={{ ...type.bodyBold, color: color.text }}>Mapped Fields</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MAPPED_FIELDS.map(f => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.gap,
                minHeight: t.cellMinHeight,
                paddingLeft: t.cellPaddingLeft,
                paddingRight: t.cellPaddingRight,
                paddingTop: t.cellPaddingY,
                paddingBottom: t.cellPaddingY,
                borderBottom: `1px solid ${color.borderSubtle}`,
              }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ width: icon.s, height: icon.s, color: color.confirmation, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 0 0' }}>
                <span style={{ ...type.bodySemibold, color: color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.label}
                </span>
                <span style={{ ...type.tableCell, color: color.cellAdditionalText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Extracted fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.gap }}>
          <span style={{ ...type.bodyBold, color: color.text }}>{EXTRACTED_FIELDS.length}</span>
          <span style={{ ...type.bodyBold, color: color.text }}>Extracted Fields</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {EXTRACTED_FIELDS.map(f => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.gap,
                minHeight: t.cellMinHeight,
                paddingLeft: t.cellPaddingLeft,
                paddingRight: t.cellPaddingRight,
                paddingTop: t.cellPaddingY,
                paddingBottom: t.cellPaddingY,
                borderBottom: `1px solid ${color.borderSubtle}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 0 0' }}>
                <span style={{ ...type.tableCell, color: color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.value}
                </span>
                <span style={{ ...type.tableCell, color: color.cellAdditionalText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.label}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Copy ${f.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: btn.iconBoxS,
                  height: btn.iconBoxS,
                  border: 'none',
                  background: 'transparent',
                  color: color.primary,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faCopy} style={{ width: icon.s, height: icon.s }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Preview ─────────────────────────────────────────────────────────────────
/**
 * The LMS prototype's Delegated Tasks for THIS SITE — the other half of this
 * cross-module check. The log being previewed is one site's, so the link opens
 * that site's profile rather than the study's matrix, which reads across every
 * site and would not be about the document on screen.
 */
const lmsDoaUrl = () => `http://localhost:5176/?site=${encodeURIComponent(currentSite().number)}&section=doa`;

export function DocumentPreview({
  doc,
  onBack,
  initialView = 'preview',
}: {
  doc: DocumentRow;
  onBack: () => void;
  /** Which segment to land on — the grid's report badge opens straight on 'training'. */
  initialView?: DocView;
}) {
  const [qvActive, setQvActive] = useState('automate');
  const [view, setView] = useState<DocView>(initialView);
  const reportRef = useRef<HTMLIFrameElement>(null);
  const [rerunning, setRerunning] = useState(false);

  // Re-running the check reloads the report, which recomputes it from scratch —
  // rows collapse, counts reset, any action taken is cleared.
  // The change log lives with its data, inside the report document.
  // The LMS side of this story is the lms-study-profile prototype, whose DOA
  // section holds the duty → course matrix this check reads. It runs as its own
  // app on the port its entry in .claude/launch.json reserves, so the link only
  // resolves while that dev server is up; the live-region announcement stays as
  // the fallback for when it is not.
  function openLms() {
    const opened = window.open(lmsDoaUrl(), '_blank', 'noreferrer');
    if (opened) return;
    const w = reportRef.current?.contentWindow as (Window & { sayLms?: () => void }) | null;
    w?.sayLms?.();
  }

  function openChangeLog() {
    const w = reportRef.current?.contentWindow as (Window & { openChangeLog?: () => void }) | null;
    w?.openChangeLog?.();
  }

  function rerun() {
    setRerunning(true);
    const frame = reportRef.current;
    if (frame) frame.src = TRAINING_REPORT_SRC + '?t=' + Date.now();
    window.setTimeout(() => setRerunning(false), 700);
  }

  return (
    <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: color.white }}>
      <DocHeader doc={doc} onBack={onBack} view={view} onViewChange={setView} />

      {/* Action toolbar — the actions belong to whichever view is showing */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tbar.gap,
          height: tbar.height,
          padding: `0 ${tbar.paddingX}px`,
          backgroundColor: color.toolbarBg,
          flexShrink: 0,
        }}
      >
        {view === 'preview' ? (
          <>
            <FlatButton glyph={faPenToSquare} label="Start Page Manipulation" />
            <FlatButton glyph={faWindowRestore} label="Open in New Window" />
            <FlatButton label="More" caret />
          </>
        ) : (
          <>
            <FlatButton
              glyph={faRotateRight}
              label={rerunning ? 'Re-running…' : 'Re-run check'}
              onClick={rerun}
              disabled={rerunning}
            />
            <FlatButton glyph={faRectangleList} label="Change Log" onClick={openChangeLog} />
            <FlatButton glyph={faGraduationCap} label="Go to LMS" onClick={openLms} />
          </>
        )}
      </div>

      <div style={{ flex: '1 0 0', minHeight: 0, display: 'flex' }}>
        <Viewer view={view} reportRef={reportRef} />
        {/* Training Requirements is a full-width read; the QV rail and panel are
            document-preview affordances and are hidden while it is showing. */}
        {view === 'preview' && (
          <>
            <QvNav active={qvActive} onSelect={setQvActive} />
            <QvPanelBody />
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentPreview;
