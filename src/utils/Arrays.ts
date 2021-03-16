/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
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

export function find<T>(arr: T[], callback: (value: T) => boolean): T | undefined {
    for (let idx = 0; idx < arr.length; idx++)
        if (callback(arr[idx]))
            return arr[idx];
    return undefined;
}

export function findIdx<T>(arr: T[], callback: (value: T) => boolean): number | undefined {
    for (let idx = 0; idx < arr.length; idx++)
        if (callback(arr[idx]))
            return idx;
    return undefined;
}

export function create<T>(size: number, fill: (idx: number) => T): T[] {
    const data: T[] = [];
    for (let i = 0; i < size; i++)
        data.push(fill(i));
    return data;
}
