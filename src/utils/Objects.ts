/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function values<T>(obj: { [key: string]: T }): T[] {
    return Object.keys(obj).map(key => obj[key]);
}

export function equals(a: { [key: string]: any }, b: { [key: string]: any }): boolean {
    for (let key in a)
        if (a[key] !== b[key])
            return false;
    return true;
}
