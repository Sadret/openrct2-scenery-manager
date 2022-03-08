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

export function add(a: Selection, b: Selection): CoordsXY[] {
    const result = toCoordsList(a);
    return result.concat(
        toCoordsList(b).filter(coords => !includes(result, coords))
    );
}

export function sub(a: Selection, b: Selection): CoordsXY[] {
    const minus = toCoordsList(b);
    return toCoordsList(a).filter(coords => !includes(minus, coords));
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
