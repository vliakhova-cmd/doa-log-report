import { useState } from 'react';
import TopHeaderBar from './appShell/TopHeaderBar';
import LeftIconNav from './appShell/LeftIconNav';
import ContentTree from './appShell/ContentTree';
import PageHeader from './PageHeader';
import { PrimaryToolbar, ResultsBar } from './Toolbar';
import DocumentGrid from './DocumentGrid';
import DocumentPreview, { DocView } from './DocumentPreview';
import { DOCUMENT_COUNT, DocumentRow } from './documentsData';
import { color, tree, page, type } from './tokens';

/** View chips in the page header — the first entry is the selected view. */
const VIEWS = ['Index', 'By Workflow', 'By Status', 'My Reviews', 'By Risk Level', 'Posted Date'];

// eTMF → Index (Figma node 33696:25047).
// Layout: 60px main nav rail · 300px navigation tree · content, with the page
// itself on page/bg (#f8faff) and page/padding 15 around the content column.
export function DoaLogPage() {
  // Opening a document replaces the page header, tree and grid with the preview,
  // matching eTMF node 32984:13253 — the top header and nav rail stay put.
  const [preview, setPreview] = useState<DocumentRow | null>(null);
  // The grid's report badge can open a document straight on its Training Report.
  const [previewView, setPreviewView] = useState<DocView>('preview');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: color.pageBg,
        fontFamily: type.body.fontFamily,
      }}
    >
      <TopHeaderBar />

      <div style={{ display: 'flex', flex: '1 0 0', minHeight: 0 }}>
        <LeftIconNav />

        {preview ? (
          <DocumentPreview doc={preview} initialView={previewView} onBack={() => setPreview(null)} />
        ) : (
        /* The page header spans the tree and the content, to the right of the rail */
        <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PageHeader title="Documents" views={VIEWS} />

          <div style={{ display: 'flex', flex: '1 0 0', minHeight: 0 }}>
            {/* navigation-tree/width 300 (min 300 / max 500) */}
            <div
              style={{
                width: tree.width,
                minWidth: tree.minWidth,
                flexShrink: 0,
                borderRight: `1px solid ${color.borderSubtle}`,
                overflow: 'hidden',
              }}
            >
              <ContentTree />
            </div>

            <div
              style={{
                flex: '1 0 0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                padding: `${page.paddingY}px ${page.paddingX}px`,
                gap: 0,
                minHeight: 0,
              }}
            >
              <PrimaryToolbar />
              <ResultsBar count={DOCUMENT_COUNT} />
              <DocumentGrid
              onOpen={(row, view) => { setPreviewView(view ?? 'preview'); setPreview(row); }}
            />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default DoaLogPage;
