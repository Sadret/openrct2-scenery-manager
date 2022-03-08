/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
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

export function find<T, S extends T>(arr: T[], callback: (value: T) => value is S): S | null;
export function find<T>(arr: T[], callback: (value: T) => boolean): T | null;
export function find<T>(arr: T[], callback: (value: T) => boolean): T | null {
    for (let idx = 0; idx < arr.length; idx++)
        if (callback(arr[idx]))
            return arr[idx];
    return null;
}

export function findIdx<T>(arr: T[], callback: (value: T) => boolean): number | null {
    for (let idx = 0; idx < arr.length; idx++)
        if (callback(arr[idx]))
            return idx;
    return null;
}

export function create<T>(size: number, fill: (idx: number) => T): T[] {
    const data: T[] = [];
    for (let i = 0; i < size; i++)
        data.push(fill(i));
    return data;
}

export function includes<T>(arr: T[], callback: (value: T) => boolean): boolean {
    return find(arr, callback) !== null;
}
