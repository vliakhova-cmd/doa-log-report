import { useEffect, useRef, useState } from 'react';
import { ContentTree } from './ContentTree';
import { SplitterBar } from './SplitterBar';
import { useMediaQuery } from '../useMediaQuery';

// Panel width is user-resizable by dragging the SplitterBar (Figma "Dividers/
// Splitter Bar NEW" — Min & Max Width behaviour).
const MIN_WIDTH = 300;   // navigation-tree/min-width
const MAX_WIDTH = 500;   // navigation-tree/max-width
const DEFAULT_WIDTH = 300; // navigation-tree/width

export function ResizableTree() {
  // No real hover on touch devices — keep the splitter's Resting look always
  // shown there instead of gating it behind a hover that will never fire,
  // so the tree stays reachable at every viewport width.
  const canHover = useMediaQuery('(hover: hover)');
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);
  const [treeHovered, setTreeHovered] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStart.current.width + (e.clientX - dragStart.current.x)));
      setWidth(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  if (!open) {
    return <SplitterBar type="Open" onToggle={() => setOpen(true)} alwaysVisible={!canHover} />;
  }

  // The tree panel always sits in normal flow and pushes the rest of the
  // layout, at every viewport width — it never becomes a floating overlay.
  // Only the SplitterBar's own hover-expand (pill/rail) overlays content to
  // its right, matching the Figma "Splitter Bar Hovered" state.
  return (
    <div style={{ position: 'relative', display: 'flex', flexShrink: 0, alignSelf: 'stretch' }}>
      <div
        onMouseEnter={() => setTreeHovered(true)}
        onMouseLeave={() => setTreeHovered(false)}
        style={{ width, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#f2f4fa' }}
      >
        <ContentTree />
      </div>
      <SplitterBar
        type="Close"
        onToggle={() => setOpen(false)}
        alwaysVisible={!canHover}
        treeAreaHovered={treeHovered}
        onDragStart={e => {
          dragStart.current = { x: e.clientX, width };
          setDragging(true);
        }}
      />
    </div>
  );
}

export default ResizableTree;
