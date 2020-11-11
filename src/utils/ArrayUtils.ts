/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function deepEquals(a: any, b: any): boolean {
    if (Array.isArray(a) && Array.isArray(b))
        return a.length === b.length && a.every(
            (val: any, index: number) => deepEquals(val, b[index])
        );
    else
        return a === b;
}

export function find<T>(arr: T[], callback: (value: T) => boolean): T {
    for (let idx = 0; idx < arr.length; idx++)
        if (callback(arr[idx]))
            return arr[idx];
    return undefined;
}
