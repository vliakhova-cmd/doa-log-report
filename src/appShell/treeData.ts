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
export const TREE_DATA: TreeNode[] = [
  {
    id: 'root',
    label: '001_Test_Smith',
    count: 244,
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
        id: 'pi-oversight',
        label: '02_PI Oversight',
        count: 66,
        children: [
          { id: 'study-overview', label: '02.1_Study Overview of...', count: 25 },
          { id: 'delegation', label: '02.2_Delegation ', count: 27 },
        ],
      },
      { id: 'staff-qualification', label: '02.3_Staff Qualification', count: 14, hasChildren: true },
      { id: 'site-training', label: '03_Site Training Evidence', count: 7, hasChildren: true },
      { id: 'clinical-agreement', label: '04_Clinical Agreement as...', count: 24, hasChildren: true },
      { id: 'feasibility', label: '05_Feasibility', count: 28, hasChildren: true },
      { id: 'subject-facing', label: '06_Subject-Facing', count: 9, hasChildren: true },
      { id: 'regulatory-review', label: '07_Site Regulatory Review ', count: 20, hasChildren: true },
      { id: 'monitoring', label: '08_Monitoring', count: 12, hasChildren: true },
    ],
  },
];

export const DEFAULT_EXPANDED = ['root', 'study-info', 'pi-oversight'];

/**
 * 02.2_Delegation — the folder a Delegation of Authority log lives in, and so the
 * folder this screen opens on. Its parent 02_PI Oversight is expanded by default
 * so the selection is visible without the user having to drill in.
 */
export const DEFAULT_SELECTED = 'delegation';
