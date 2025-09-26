import { Parser } from 'simple-text-parser';
import { CmsGlobals } from '../api/content/types/globals';
import { CmsMenu, MenuItem } from '../api/content/types/menu';
import { CmsPage } from '../api/content/types/page';
import { CmsFooter, CmsTenant } from '../api/content/types/tenant';
import { CmsTokens } from '../api/types';
import { formatUserAddress } from '../business/address';
import { NA_SYMBOL } from '../business/constants';
import { extractLabelByKey } from '../business/globals';
import { InterpolationTokens } from './types';
import { formatDate, isoTimeToText, isoTimeToYears } from '../business/dates';
import { formatFirstName } from '../business/names';
import { PersistentAppState, usePersistentAppState } from '../core/contexts/persistentAppState/PersistentAppStateContext';

// export const injectTokenValuesToPage = (
//     tenant: CmsTenant | null,
//     page: CmsPage | null,
//     globals: CmsGlobals | null,
//     footer: CmsFooter | null,
//     menuItems: MenuItem[] | null,
//     cmsTokens: CmsTokens | null,
//     persistentAppState: PersistentAppState,
// ): { page: CmsPage | null; globals: CmsGlobals | null; footer: CmsFooter | null; menu: CmsMenu | null } => {

// }

const yearsMonthsString = (globals: CmsGlobals | null, years?: number | null, months?: number | null) => {
    if (!years && years !== 0 && !months) {
        return null;
    }
    const yearsText = `${years} ${extractLabelByKey(globals, years === 1 ? 'year' : 'years')}`
    const monthsText = months ? ` ${months} ${extractLabelByKey(globals, months === 1 ? 'month' : 'months')}` : '';
    return yearsText + monthsText;
}

const cleanRenderedText = (text: string) => {
    return text
        .replace(/\s*,\s*(?=\s|$|<)|\s+,\s*(?=\s|$|<)/g, ',')
        .replace(/(\s*,\s*<br\s*\/?>)/, ',<br/>')
        .replace(/>\s*,\s*</g, '>,<')
        .trim();
}

const rulePatterns = [
  /\[\[modal:([^\]]*)]]/gi,
  /\[\[tooltip:([^\]]*)]]/gi,
  /\[\[message:([^\]]*)]]/gi,
  /\[\[button:([^\]]*)]]/gi,
  /\[\[timer:([^\]]*)]]/gi,
  /\[\[icon:([^\]]*)]]/gi,
  /\[\[badge:([^\]]*)]]/gi,
];

export function hasMatchingParserRule(text: string): boolean {
    return rulePatterns.some(pattern => pattern.test(text))
}