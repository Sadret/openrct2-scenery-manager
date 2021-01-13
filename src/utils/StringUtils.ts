/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function compare(a: string, b: string): number {
    const case_insensitive = a.toLowerCase().localeCompare(b.toLowerCase());
    if (case_insensitive !== 0)
        return case_insensitive;
    return a.localeCompare(b);
}

export function toDisplayString(s: string): string {
    return s.split("_").map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(" ");
}
