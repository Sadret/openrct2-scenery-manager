/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />

export function span(start: CoordsXY, end: CoordsXY): MapRange {
    return {
        leftTop: {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
        },
        rightBottom: {
            x: Math.max(start.x, end.x),
            y: Math.max(start.y, end.y),
        },
    };
}

export function centered(center: CoordsXY, size: CoordsXY): MapRange {
    let start = {
        x: (center.x - size.x / 2) & ~31,
        y: (center.y - size.y / 2) & ~31,
    };
    return {
        leftTop: start,
        rightBottom: add(start, size),
    };
}

export function getSize(range: MapRange): CoordsXY {
    return sub(range.rightBottom, range.leftTop);
}

function add(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x + v.x,
        y: u.y + v.y,
    };
}

function sub(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x - v.x,
        y: u.y - v.y,
    };
}

export function equals(u: CoordsXY, v: CoordsXY): boolean {
    if (u === undefined && v === undefined)
        return true;
    if (u === undefined || v === undefined)
        return false;
    return u.x === v.x && u.y === v.y;
}
