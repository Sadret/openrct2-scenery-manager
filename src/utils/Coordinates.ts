/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * CONSTANTS
 */

export const NULL = { x: 0, y: 0 };

/*
 * CONVERSION FUNCTIONS
 */

export function toTiles(range: MapRange): CoordsXY[] {
    const tiles: CoordsXY[] = [];
    for (let x = range.leftTop.x; x <= range.rightBottom.x; x += 32)
        for (let y = range.leftTop.y; y <= range.rightBottom.y; y += 32)
            tiles.push({ x: x, y: y });
    return tiles;
}

export function toMapRange(tiles: CoordsXY[]): MapRange {
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

export function worldToTileCoords(coords: CoordsXY): CoordsXY {
    return { x: coords.x / 32, y: coords.y / 32 };
}

export function tileToWorldCoords(coords: CoordsXY): CoordsXY {
    return { x: coords.x * 32, y: coords.y * 32 };
}

/*
 * MATH
 */

function round(coords: CoordsXY): CoordsXY {
    return {
        x: coords.x & ~31,
        y: coords.y & ~31,
    };
}

function add(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x + v.x,
        y: u.y + v.y,
    };
}

export function sub(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x - v.x,
        y: u.y - v.y,
    };
}

function scale(u: CoordsXY, f: number): CoordsXY {
    return {
        x: u.x * f,
        y: u.y * f,
    };
}

/*
 * UTILITY
 */

const sin: number[] = [0, 1, 0, -1];
const cos: number[] = [1, 0, -1, 0];

export function rotate(coords: CoordsXY, rotation: number) {
    const t: number = rotation & 3;
    return {
        x: + coords.x * cos[t] + coords.y * sin[t],
        y: - coords.x * sin[t] + coords.y * cos[t],
    };
}

export function mirror(coords: CoordsXY, mirrored: boolean = true) {
    if (!mirrored)
        return coords;
    return {
        x: coords.x,
        y: -coords.y,
    };
}

export function center(tiles: CoordsXY[]): CoordsXY {
    const range: MapRange = toMapRange(tiles);
    return round(scale(add(range.rightBottom, range.leftTop), 0.5));
}

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
    const start: CoordsXY = round(sub(center, scale(size, 0.5)));
    return {
        leftTop: start,
        rightBottom: add(start, size),
    };
}

export function getSize(range: MapRange): CoordsXY {
    return add(worldToTileCoords(sub(range.rightBottom, range.leftTop)), { x: 1, y: 1 });
}

export function circle(center: CoordsXY, diameter: number): CoordsXY[] {
    const start: CoordsXY = round(sub(center, { x: (diameter - 1) * 16, y: (diameter - 1) * 16 })); // -2 also works
    const m: number = (diameter - 1) / 2; // (diameter - 1) * 16 = (diameter - 1) / 2 * 32
    const r2: number = diameter / 2 * diameter / 2;
    const range: number[] = [];
    for (let i = 0; i < diameter; i++)
        range.push(i);
    return ([] as CoordsXY[]).concat(
        ...range.map(
            (x: number) => range.map(
                (y: number) => ({ x: x, y: y })
            )
        )
    ).filter(
        (c: CoordsXY) => (c.x - m) * (c.x - m) + (c.y - m) * (c.y - m) <= r2
    ).map(
        (c: CoordsXY) => add(tileToWorldCoords(c), start)
    );
}

export function square(center: CoordsXY, diameter: number): CoordsXY[] {
    const start: CoordsXY = round(sub(center, { x: (diameter - 1) * 16, y: (diameter - 1) * 16 })); // -2 also works
    diameter--;
    return toTiles({ leftTop: start, rightBottom: add(start, { x: diameter * 32, y: diameter * 32 }) });
}

export function equals(u: CoordsXY, v: CoordsXY): boolean {
    if (u === undefined && v === undefined)
        return true;
    if (u === undefined || v === undefined)
        return false;
    return u.x === v.x && u.y === v.y;
}

export function parity(coords: CoordsXY, mod: number) {
    return (coords.x + coords.y) % mod;
}
