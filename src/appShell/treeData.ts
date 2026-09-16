import { SITES, siteNodeId, currentSite, type Site } from '../siteContext';

export interface TreeNode {
  id: string;
  label: string;
  count: number;
  children?: TreeNode[];
  /** Node has children in the real data but they are not loaded/shown yet — still draws a caret. */
  hasChildren?: boolean;
}

// Structure, labels and counts read from the Figma frame
// "eTMF | IN PROGRESS | 10.9.1-10.9.2" → Index (node 33696:25047), Navigation tree.
// Typos ("00_Restricted souurse") are reproduced as they appear in the design.
//
// Deviation from the frame: the frame draws one flat folder tree. A Delegation
// of Authority log is a SITE-level document — it is signed by the investigator
// at one site, and each site has its own — so the tree carries an explicit
// Sites level, and the zones that belong to a site (PI oversight, staff
// qualification, site training evidence, and everything from 04 down) sit
// INSIDE the site rather than beside the study's own folders. The study keeps
// only what is genuinely study-wide: _Reference, 00_Restricted, 01_Study Info.
/**
 * Every site carries the same site-level zones — 02_PI Oversight down through
 * 08_Monitoring — because they are the site-management half of the TMF. Ids are
 * namespaced by site number so two sites' 02.2_Delegation folders are distinct
 * nodes rather than one shared selection.
 */
function siteBranch(site: Site): TreeNode {
  const n = site.number;
  return {
    id: siteNodeId(n),
    label: site.label,
    count: 180,
    children: [
      {
        id: `pi-oversight-${n}`,
        label: '02_PI Oversight',
        count: 66,
        children: [
          { id: `study-overview-${n}`, label: '02.1_Study Overview of...', count: 25 },
          { id: `delegation-${n}`, label: '02.2_Delegation ', count: 27 },
        ],
      },
      { id: `staff-qualification-${n}`, label: '02.3_Staff Qualification', count: 14, hasChildren: true },
      { id: `site-training-${n}`, label: '03_Site Training Evidence', count: 7, hasChildren: true },
      { id: `clinical-agreement-${n}`, label: '04_Clinical Agreement as...', count: 24, hasChildren: true },
      { id: `feasibility-${n}`, label: '05_Feasibility', count: 28, hasChildren: true },
      { id: `subject-facing-${n}`, label: '06_Subject-Facing', count: 9, hasChildren: true },
      { id: `regulatory-review-${n}`, label: '07_Site Regulatory Review ', count: 20, hasChildren: true },
      { id: `monitoring-${n}`, label: '08_Monitoring', count: 12, hasChildren: true },
    ],
  };
}

export const TREE_DATA: TreeNode[] = [
  {
    id: 'root',
    label: 'Bivivid',
    count: 336,
    children: [
      { id: 'reference', label: '_Reference', count: 30 },
      { id: 'restricted', label: '00_Restricted souurse', count: 6 },
      {
        id: 'study-info',
        label: '01_Study Info',
        count: 42,
        children: [
          { id: 'sponsor-coordinator', label: '01.1_Sponsor_Coordinator', count: 5 },
          { id: 'protocol-ic', label: '01.2_Protocol_Ic', count: 29 },
          { id: 'study-management', label: '01.3_Study Management', count: 8 },
        ],
      },
      {
        id: 'sites',
        label: 'Sites',
        count: 258,
        children: SITES.map(siteBranch),
      },
    ],
  },
];

/**
 * Open on the site the link asks for, with its structure unfolded, and select
 * the site itself — so it is immediately clear whose folders these are.
 */
export const DEFAULT_EXPANDED = ['root', 'sites', siteNodeId(currentSite().number), `pi-oversight-${currentSite().number}`];

export const DEFAULT_SELECTED = siteNodeId(currentSite().number);
