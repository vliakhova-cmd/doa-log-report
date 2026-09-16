// Which site's folder this screen is looking at.
//
// A Delegation of Authority log is signed per site, so "the DOA log" is always
// one site's. The LMS links here with ?site=<number> (see doaData's
// etmfUrlForSite) so following a link from a site profile lands in THAT site's
// 02.2_Delegation rather than whichever site the tree happens to open on.

export interface Site {
  /** Spelled as both prototypes spell it, so a link either way agrees. */
  label: string;
  number: string;
  /** The investigator who signs this site's log. */
  pi: string;
  /** Full name, for the document's extracted metadata. */
  piFullName: string;
}

export const SITES: Site[] = [
  { label: '0982 - Miles, H', number: '0982', pi: 'Miles, H', piFullName: 'Dr. Helena Miles' },
  { label: '1643 - Hwang, S', number: '1643', pi: 'Hwang, S', piFullName: 'Dr. Soo-Jin Hwang' },
  { label: '2208 - Rivera, C', number: '2208', pi: 'Rivera, C', piFullName: 'Dr. Carlos Rivera' },
];

/** The site the URL asks for, falling back to the first. */
export function currentSite(): Site {
  try {
    const asked = new URLSearchParams(window.location.search).get('site');
    return SITES.find(s => s.number === asked || s.label === asked) ?? SITES[0];
  } catch {
    return SITES[0];
  }
}

/** The tree node id for a site — `site-0982`. */
export const siteNodeId = (number: string) => `site-${number}`;

/**
 * ?doc=doa opens the site's Delegation of Authority log straight in the
 * document preview, rather than landing on the folder's list and making the
 * visitor find the row. The LMS links this way from a site's Delegated Tasks:
 * the chip names that document, so it should open that document.
 */
export function requestedDoc(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('doc');
  } catch {
    return null;
  }
}
