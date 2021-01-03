/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />

/*
 * CONVERSION FUNCTIONS
 */

export function toTileCoords(coords: CoordsXY): CoordsXY {
    return { x: coords.x / 32, y: coords.y / 32 };
}

export function toCoordsXY(coords: CoordsXY): CoordsXY {
    return { x: coords.x * 32, y: coords.y * 32 };
}

export function toMapRange(tiles: CoordsXY[]): MapRange {
    if (tiles.length === 0)
        return undefined;
    const xx: number[] = tiles.map((coords: CoordsXY) => coords.x);
    const yy: number[] = tiles.map((coords: CoordsXY) => coords.y);
    return {
        leftTop: {
            x: Math.min(...xx),
            y: Math.min(...yy),
        }, rightBottom: {
            x: Math.max(...xx),
            y: Math.max(...yy),
        },
    }
}

/*
 * UTILITY
 */

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
    const start = {
        x: (center.x - size.x / 2) & ~31,
        y: (center.y - size.y / 2) & ~31,
    };
    return {
        leftTop: start,
        rightBottom: add(start, size),
    };
}

export function getSize(range: MapRange): CoordsXY {
    return add(sub(range.rightBottom, range.leftTop), { x: 1, y: 1 });
}

export function circle(center: CoordsXY, diameter: number): CoordsXY[] {
    const start = {
        x: (center.x - diameter * 16) & ~31,
        y: (center.y - diameter * 16) & ~31,
    };
    const dh: number = (diameter + 1) / 2;
    const dh2: number = diameter / 2 * diameter / 2;
    const range: number[] = [];
    for (let i = 0; i <= diameter; i++)
        range.push(i);
    return [].concat(
        ...range.map(
            (x: number) => range.map(
                (y: number) => ({ x: x, y: y })
            )
        )
    ).filter(
        (c: CoordsXY) => (c.x - dh) * (c.x - dh) + (c.y - dh) * (c.y - dh) <= dh2
    ).map(
        (c: CoordsXY) => add(toCoordsXY(c), start)
    );
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
