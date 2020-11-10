/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function compare(a: string, b: string): number {
    const case_insensitive = a.toLowerCase().localeCompare(b.toLowerCase());
    if (case_insensitive !== 0)
        return case_insensitive;
    return a.localeCompare(b);
}
