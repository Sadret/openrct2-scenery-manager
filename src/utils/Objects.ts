/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function values<T>(obj: { [key: string]: T }): T[] {
    const values: T[] = [];
    for (let key in obj)
        if (obj.hasOwnProperty(key))
            values.push(obj[key]);
    return values;
}