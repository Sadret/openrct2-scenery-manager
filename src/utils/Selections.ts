/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../utils/Arrays";
import * as Coordinates from "../utils/Coordinates";

export function includes(selection: Selection, coords: CoordsXY): boolean {
    if (selection === undefined)
        return false;
    if (Array.isArray(selection))
        return Arrays.includes(selection, value => Coordinates.equals(coords, value));
    return selection.leftTop.x <= coords.x
        && coords.x <= selection.rightBottom.x
        && selection.leftTop.y <= coords.y
        && coords.y <= selection.rightBottom.y;
}

export function add(a: Selection, b: Selection): Selection {
    const listA = toCoordsList(a);
    const listB = toCoordsList(b);
    if (listA.length === 0)
        return b;
    if (listB.length === 0)
        return a;

    return listA.concat(
        listB.filter(
            coords => !includes(listA, coords)
        )
    );
}

export function sub(a: Selection, b: Selection): Selection {
    const listA = toCoordsList(a);
    const listB = toCoordsList(b);
    if (listA.length === 0)
        return undefined;
    if (listB.length === 0)
        return a;

    const result = listA.filter(
        coords => !includes(listB, coords)
    );
    if (result.length === 0)
        return undefined;
    return result;
}

export function toCoordsList(selection: Selection): CoordsXY[] {
    if (selection === undefined)
        return [];
    if (Array.isArray(selection))
        return selection;

    const tileCoords = [] as CoordsXY[];
    for (let x = selection.leftTop.x; x <= selection.rightBottom.x; x++)
        for (let y = selection.leftTop.y; y <= selection.rightBottom.y; y++)
            tileCoords.push({ x: x, y: y });
    return tileCoords;
}
