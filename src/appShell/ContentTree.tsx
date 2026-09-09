import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faRotate,
  faEllipsis,
  faAngleDown,
  faAngleRight,
  faFolder,
  faFolderOpen,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { TREE_DATA, TreeNode, DEFAULT_EXPANDED, DEFAULT_SELECTED } from './treeData';
import { color, type, tree, icon } from '../tokens';

// Adapted from ai-course-authoring-flow/src/appShell/ContentTree.tsx.
// Retargeted to navigation-tree/* and tree-list/* variables from the eTMF frame:
// the caret sits in its own slot before the row container, indents step
// 15 → 30 → 45px, folder glyphs are tree-list/item/icon (#c2cad8), and the
// selected row is the light tree-list/item/single-selection-selected-bg fill
// that keeps its dark tree-list/item/text rather than inverting to white.

/** Button/Flat — transparent bg/border, primary glyph, radius 5 */
function FlatIconButton({ icon: glyph, label }: { icon: IconDefinition; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 22,
        padding: '1px 2px',
        border: '1px solid transparent',
        borderRadius: 5,
        background: hover ? 'rgba(31,106,172,0.08)' : 'transparent',
        color: color.primary,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <FontAwesomeIcon icon={glyph} style={{ width: icon.s, height: icon.s }} />
    </button>
  );
}

interface RowProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  selected: string;
  onSelect: (id: string) => void;
}

function TreeRow({ node, depth, expanded, onToggle, selected, onSelect }: RowProps) {
  const hasKids = !!node.children?.length || !!node.hasChildren;
  const isOpen = expanded.has(node.id);
  const isSelected = selected === node.id;
  const [hover, setHover] = useState(false);

  // Expanded parents get Body/Semibold + folder-open in the frame.
  const isOpenParent = hasKids && isOpen;

  // tree-list/level-padding-left-x 15 → level-2 30 → level-3 45
  const indent = tree.level1PaddingLeft + depth * (tree.level2PaddingLeft - tree.level1PaddingLeft);

  const bg = isSelected ? color.treeSelectedBg : hover ? 'rgba(208,229,246,0.45)' : 'transparent';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', height: tree.rowHeight, paddingLeft: indent, overflow: 'hidden' }}>
        {/* Caret slot is always reserved so labels align across sibling rows */}
        <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {hasKids && (
            <button
              type="button"
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              onClick={e => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 22,
                padding: 0,
                border: 'none',
                background: 'transparent',
                color: color.primary,
                cursor: 'pointer',
              }}
            >
              <FontAwesomeIcon icon={isOpen ? faAngleDown : faAngleRight} style={{ width: icon.s, height: icon.s }} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tree.innerGap,
            flex: '1 0 0',
            minWidth: 0,
            height: '100%',
            paddingLeft: tree.itemPaddingLeft,
            paddingRight: tree.itemPaddingRight,
            border: 'none',
            borderRadius: tree.radius,
            backgroundColor: bg,
            cursor: 'pointer',
            textAlign: 'left',
            font: 'inherit',
            transition: 'background-color 100ms',
          }}
        >
          <FontAwesomeIcon
            icon={isOpenParent ? faFolderOpen : faFolder}
            style={{ width: icon.s, height: icon.s, color: color.iconFaint, flexShrink: 0 }}
          />
          <span
            title={node.label}
            style={{
              flex: '1 0 0',
              minWidth: 0,
              ...(isOpenParent ? type.bodySemibold : type.body),
              color: color.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.label}
          </span>
          <span style={{ flexShrink: 0, ...type.bodyBold, color: color.text }}>{node.count}</span>
        </button>
      </div>

      {node.children &&
        isOpen &&
        node.children.map(child => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export function ContentTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(DEFAULT_EXPANDED));
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [query, setQuery] = useState('');

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color.panelBg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: type.body.fontFamily,
      }}
    >
      {/* Tree/Heading — navigation-tree/top/*
          The View By control is not here: in the Design Patterns layout
          (node 2021:8233) view selection lives in the page header instead. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tree.topGap, padding: `${tree.topPaddingX}px ${tree.topPaddingX}px 0` }}>
        {/* Search — field/input/* */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tree.topGap }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flex: '1 0 0',
              minWidth: 0,
              height: 30,
              padding: '0 5px',
              backgroundColor: color.pageBg,
              borderBottom: `1px solid ${color.border}`,
              borderRadius: '5px 5px 0 0',
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ width: icon.s, height: icon.s, color: color.iconMuted, flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              style={{
                flex: '1 0 0',
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                ...type.body,
                color: color.text,
              }}
            />
          </div>
          <FlatIconButton icon={faRotate} label="Refresh" />
          <FlatIconButton icon={faEllipsis} label="More" />
        </div>
      </div>

      {/* navigation-tree/tree-body-padding-top-y = 15 */}
      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: tree.bodyPaddingTop, overflowY: 'auto' }}>
        {TREE_DATA.map(node => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggle}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </div>
    </div>
  );
}

export default ContentTree;
