import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMagnifyingGlass, faBell, faCaretDown, faCubes, faStar } from '@fortawesome/free-solid-svg-icons';
import WaffleMenu from './WaffleMenu';
import { color, type, header, icon, status as st, chip, button as btn, favoriteActiveIcon } from '../tokens';

// Top Header — DS - Advanced | IN PROGRESS | 2.0, "Header Top" node 86:154743.
// Adapted from ai-course-authoring-flow/src/appShell/TopHeaderBar.tsx, keeping
// its slanted CrumbDivider and retargeting everything to header-top/*.
//
// Things this component gets from the DS that are easy to get wrong:
//   · the bar is header-top/bg (#f2f4fa) — NOT white
//   · actions are Button/Flat primary: resting transparent → hover #d0e5f6
//     → pressed/selected #5391c6 with a white glyph
//   · a crumb's small label is Links/Semibold/Small in button/link/base/resting-text,
//     its value is Buttons/Medium-Link (14/20 **400**, not semibold)
//   · the LAST crumb is Body/Semibold in header-top/crumb/end-crumb-text and has no caret
//   · the role badge is a Status (small, solid orange) overlapping the avatar
//     by header-top/action/role-gap-xs (-5)

/** Top Header/Crumb/Line — a 10×60 slanted rule, header-top/crumb/{line-width,border} */
function CrumbLine() {
  return (
    <svg
      width={header.crumbLineWidth}
      height={header.crumbHeight}
      viewBox="0 0 10 60"
      fill="none"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d="M0.999032 60L8.47465 30.59L0.999827 0" stroke={color.crumbBorder} strokeWidth={header.crumbBorderWidth} />
    </svg>
  );
}

/** Top Header/Crumb shell — Line + Value, gap-xs, clipped at crumb height */
function CrumbShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: header.crumbGapXs,
        height: header.crumbHeight,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <CrumbLine />
      {children}
    </div>
  );
}

/**
 * Top Header/Crumb (86:154864) — component description:
 *   "The maximum entity title length is 21 symbols after which it should be truncated"
 */
function truncateEntityTitle(value: string) {
  return value.length > header.entityTitleMaxChars
    ? value.slice(0, header.entityTitleMaxChars).trimEnd() + '…'
    : value;
}

/** Chip/Solid base — the optional "offering" badge that can sit beside a crumb value */
function OfferingChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: chip.mediumMinWidth,
        maxWidth: chip.labelMaxWidth,
        padding: `${chip.smallPaddingY}px ${chip.smallPaddingX}px`,
        // Chip/Solid info — the offering badge, not the base grey
        border: `${chip.borderWidth}px solid ${color.chipSolidInfoBorder}`,
        borderRadius: chip.roundRadius,
        backgroundColor: color.chipSolidInfoBg,
        color: color.chipSolidInfoText,
        ...type.captionSemibold,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

/**
 * Top Header/Action/Switcher — the "burger" asset from General Nav 3977:115987.
 *
 * Not a Font Awesome glyph: FA7 Free has no 3x3 dot grid. The geometry is the
 * exported asset's exactly — nine r=2.5 circles on a 7px pitch in a 19 viewBox —
 * and the asset is 19px inside the 30px header-top/action/icon-size box, which
 * is why it reads smaller than the icon slot. currentColor so the flat button's
 * pressed state can invert it.
 */
function SwitcherMark() {
  const centres = [2.5, 9.5, 16.5];
  return (
    <svg width={19} height={19} viewBox="0 0 19 19" fill="currentColor" aria-hidden focusable="false">
      {centres.map((cy) =>
        centres.map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.5} />),
      )}
    </svg>
  );
}

/** Button/Flat primary, sized to header-top/action/* */
function HeaderAction({ children, badge, label, onClick }: { children: React.ReactNode; badge?: number; label: string; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = pressed ? color.flatPrimaryPressedBg : hover ? color.flatPrimaryHoverBg : 'transparent';
  const fg = pressed ? color.flatPrimaryPressedText : color.primary;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: header.actionHeight,
        padding: `0 ${header.actionPaddingX}px`,
        border: 'none',
        borderRadius: btn.flatRadius,     // button/flat/radius 5
        background: bg,
        color: fg,
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: header.actionIconSize,
          height: header.actionIconSize,
        }}
      >
        {children}
      </span>
      {badge != null && (
        // counter/primary-solid/critical — min 17, radius 100, Counters/Small
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 8,
            minWidth: 17,
            height: 17,
            padding: '0 5px',
            borderRadius: 100,
            backgroundColor: color.critical,
            color: color.white,
            ...type.counter,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/**
 * Top Header/Crumb/Value — a Container column holding an optional Button/Link
 * label (Links/Semibold/Small) over an "Entity" row: the value as a
 * Button/Link (Buttons/Medium-Link), an optional Chip/Solid offering badge,
 * and a Button/Flat caret.
 *
 * Both the label and the value are `button/link/base/resting-text` (#576581),
 * and the caret is `button/flat/base/resting-text` — the crumb is a base-toned
 * link, not brand blue. Only the END crumb goes dark, via end-crumb-text.
 */
function Crumb({
  label,
  value,
  offering,
  glyph,
  starred = false,
  arrow = true,
  isEnd = false,
}: {
  label?: string;
  value: string;
  offering?: string;
  /** An app mark shown before the value, as the eTMF crumb carries. */
  glyph?: typeof faCubes;
  /** favorite/active-icon star, for a starred entity. */
  starred?: boolean;
  arrow?: boolean;
  isEnd?: boolean;
}) {
  return (
    <CrumbShell>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: header.crumbGapS,
          paddingLeft: header.crumbInnerPaddingX,
          minWidth: 0,
        }}
      >
        {/* Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
          {label && (
            <span style={{ ...type.linkSmall, color: color.linkBaseText, whiteSpace: 'nowrap' }}>{label}</span>
          )}
          {/* Entity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: header.crumbGapXs, minWidth: 0 }}>
            {glyph && (
              <FontAwesomeIcon
                icon={glyph}
                style={{ width: icon.m, height: icon.m, color: color.flatBaseText, flexShrink: 0 }}
              />
            )}
            {starred && (
              <FontAwesomeIcon
                icon={faStar}
                style={{ width: icon.xs, height: icon.xs, color: favoriteActiveIcon, flexShrink: 0 }}
              />
            )}
            <span
              title={value}
              style={{
                ...(isEnd ? type.bodySemibold : type.link),
                color: isEnd ? color.crumbEndText : color.linkBaseText,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {truncateEntityTitle(value)}
            </span>
            {offering && <OfferingChip label={offering} />}
            {arrow && !isEnd && (
              // Button/Flat base — padding 1/2, radius 5, 15px glyph in a 20px box
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: btn.iconBoxS,
                  height: btn.iconBoxS,
                  padding: `${btn.flatPaddingY}px ${btn.flatPaddingX}px`,
                  borderRadius: btn.flatRadius,
                  color: color.flatBaseText,
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faCaretDown} style={{ width: icon.s, height: icon.s }} />
              </span>
            )}
          </div>
        </div>
      </div>
    </CrumbShell>
  );
}

/**
 * The logo crumb — Logo/Small (40px) beside the product name as a
 * Button/Link base, inside a 40px-tall Value with a 10px right pad.
 */
function LogoCrumb({ name }: { name: string }) {
  return (
    <CrumbShell>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: header.crumbGapXs,
          height: header.logoHeight,
          borderRadius: btn.radius,
        }}
      >
        {/* Navigation/MainNav/Elements/Logo — the exported mark, 25.004x40 in a
            40px box. Figma flips the group vertically, so the asset is drawn the
            same way here rather than being re-exported. */}
        <div style={{ width: header.logoHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img
            src={import.meta.env.BASE_URL + 'ti-logo.svg'}
            alt=""
            style={{ width: 25.004, height: header.logoHeight, transform: 'scaleY(-1)', display: 'block' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: header.crumbInnerPaddingX }}>
          <span style={{ ...type.link, color: color.linkBaseText, whiteSpace: 'nowrap' }}>{name}</span>
        </div>
      </div>
    </CrumbShell>
  );
}

export function TopHeaderBar() {
  const [switcher, setSwitcher] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: header.height,
        // header-top/bg — #f2f4fa, not white
        backgroundColor: color.headerBg,
        borderBottom: `${header.borderWidth}px solid ${color.border}`,
        flexShrink: 0,
        fontFamily: type.body.fontFamily,
      }}
    >
      {/* Crumbs (2326:197559) — a Top Header/Action followed by Top Header/Crumbs,
          each of which carries its own leading Line, so no separate dividers. */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
        {/* Top Header/Action (2326:197560) — the app switcher. It is the same
            component as the actions on the right, so it is the same React one:
            60 high, padding-x 15 around a 30px icon in header-top/action/icon,
            with Button/Flat primary hover and pressed states. It was previously a
            plain div holding a 20px glyph, which is icons/solid/m, not the
            header-top/action/icon-size the component asks for. */}
        {/* The app switcher opens the waffle menu — the client's other
            products, and the links a study is wired to. */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <HeaderAction label="App switcher" onClick={() => setSwitcher(o => !o)}>
            <SwitcherMark />
          </HeaderAction>
          {switcher && <WaffleMenu onClose={() => setSwitcher(false)} />}
        </div>

        <LogoCrumb name="TI" />
        {/* The study, named as the LMS names it, so following a link between
            the two prototypes stays on one study. */}
        <Crumb label="Room" value="Bivivid" offering="eTMF" starred />
        <Crumb value="eTMF" glyph={faCubes} />
        <Crumb value="Documents" isEnd />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <HeaderAction label="Add">
          <FontAwesomeIcon icon={faPlus} style={{ width: icon.m, height: icon.m }} />
        </HeaderAction>
        <HeaderAction label="Search">
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ width: icon.m, height: icon.m }} />
        </HeaderAction>
        <HeaderAction label="Notifications" badge={5}>
          <FontAwesomeIcon icon={faBell} style={{ width: icon.m, height: icon.m }} />
        </HeaderAction>

        {/* Avatar + role — the Status badge overlaps the avatar by role-gap-xs (-5) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: header.roleGapXs,
            padding: `0 ${header.actionPaddingX}px`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 100,
              border: `1px solid ${color.borderSubtle}`,
              backgroundColor: color.avatarOrange,
              color: color.white,
              ...type.h5,
            }}
          >
            LA
          </div>
          {/* Status — small, solid orange */}
          <span
            style={{
              maxWidth: 170,
              padding: `0 ${st.paddingX}px`,
              borderRadius: st.radius,
              backgroundColor: color.statusOrange,
              color: color.text,
              ...type.statusSmall,
              textTransform: 'uppercase',   // Status renders its label in caps
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            S. Admin
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopHeaderBar;
