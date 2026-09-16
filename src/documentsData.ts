import { currentSite } from './siteContext';

export type FileKind = 'pdf' | 'word';

/** Small status glyphs shown between the favorite star and the name column. */
export type RowGlyph = 'flag' | 'flag-alert' | 'link' | 'circle' | 'comment' | 'record';

/**
 * What the cross-module check found, for the grid to advertise on the row.
 *
 * These are the same nine people Training Requirements itself renders. That view
 * is a self-contained HTML document in an iframe with its own copy of the data,
 * so the grid cannot read the counts out of it — they are mirrored here and must
 * be kept in step with TEAM in `public/cross-module-check.html`.
 */
export interface ReportSummary {
  ranAt: string;
  people: number;
  complete: number;
  incomplete: number;
  ambiguous: number;
}

export interface DocumentRow {
  id: number;
  kind: FileKind;
  glyphs: RowGlyph[];
  submittedName: string;
  generatedName: string;
  status: string | null;
  /** Which Status variant the state calls for — see DocumentGrid's Status. */
  statusTone?: 'progress' | 'approved' | 'rejected' | 'superseded';
  submittedOn: string;
  owner: string;
  /** Present when a cross-module check has already run against this document. */
  report?: ReportSummary;
}

// Every document here belongs to ONE site — the one the URL asks for (see
// siteContext) — because 02.2_Delegation sits inside that site's folder in the
// tree. So the names are site-level names: the DOA log carries the site
// alongside the document's own name, so the row says whose log it is without
// reading the tree, and the generated names carry that site's code in the slot
// the frame filled with the placeholder "MAD".
//
// Row 1 is the Delegation of Authority log — the document this screen exists
// for. The rest are the artifacts that actually live alongside it in
// 02.2_Delegation (the selected folder), named after the TMF Reference Model's
// site-management artifacts rather than the Figma frame's placeholder strings:
// a signature sheet, the 1572, a sub-investigator addendum, a training log, and
// the superseded prior version of the DOA log itself.
//
// Names are no longer pre-truncated with "…" — the cell ellipsis does that, so
// the full title is available to `title`/search rather than being lost in data.
//
// Deviation from the frame: row 2 is drawn there with no status at all. A real
// document in QC always carries one, so it is given the state its date implies.
const SITE = currentSite();

export const DOCUMENTS: DocumentRow[] = [
  {
    id: 1,
    kind: 'pdf',
    glyphs: ['flag', 'link'],
    submittedName: `${SITE.label} — Delegation of Authority Log v4.0`,
    generatedName: '',
    status: 'QC2 IN PROGRESS',
    statusTone: 'progress',
    submittedOn: '17 Oct 2026',
    owner: 'Jenny Wils…',
    report: {
      ranAt: '12 Mar 2026, 09:42 CET',
      people: 9,
      complete: 6,
      incomplete: 2,
      ambiguous: 1,
    },
  },
  {
    id: 2,
    kind: 'word',
    glyphs: ['flag', 'link'],
    submittedName: 'Site Signature Sheet v2.0',
    generatedName: `123456_SSS_${SITE.number}_v2.0`,
    status: 'QC APPROVED',
    statusTone: 'approved',
    submittedOn: '11 Jun 2026',
    owner: 'Devon La…',
  },
  {
    id: 3,
    kind: 'pdf',
    glyphs: ['circle', 'comment', 'record'],
    submittedName: 'Form FDA 1572 — Statement of Investigator',
    generatedName: `123456_1572_${SITE.number}_v1.0`,
    status: 'QC1 IN PROGRESS',
    statusTone: 'progress',
    submittedOn: '22 Mar 2026',
    owner: 'Theresa…',
  },
  {
    // The alert flag and the rejection are the same fact, told twice.
    id: 4,
    kind: 'pdf',
    glyphs: ['flag-alert'],
    submittedName: 'Sub-Investigator Delegation Addendum',
    generatedName: `123456_SUBDEL_${SITE.number}_v2.0`,
    status: 'QC REJECTED',
    statusTone: 'rejected',
    submittedOn: '14 May 2026',
    owner: 'Jerome Bell',
  },
  {
    id: 5,
    kind: 'pdf',
    glyphs: ['record', 'link'],
    submittedName: 'Site Staff Training & Delegation Log',
    generatedName: `123456_TRNLOG_${SITE.number}_v1.0`,
    status: 'QC APPROVED',
    statusTone: 'approved',
    submittedOn: '3 Jan 2026',
    owner: 'Annette B…',
  },
  {
    // The version row 1 replaced — which is why row 1 is the one in QC.
    id: 6,
    kind: 'word',
    glyphs: [],
    submittedName: `${SITE.label} — Delegation of Authority Log v1.0`,
    generatedName: `123456_DOA_${SITE.number}_v1.0`,
    status: 'SUPERSEDED',
    statusTone: 'superseded',
    submittedOn: '27 Apr 2026',
    owner: 'Eleanor P…',
  },
];

/** The count the frame prints above the grid. */
export const DOCUMENT_COUNT = 5;
export const TOTAL_PAGES = 5;
