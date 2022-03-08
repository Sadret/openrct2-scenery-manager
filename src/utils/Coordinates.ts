/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * CONSTANTS
 */

export const NULL = { x: 0, y: 0 };

/*
 * CONVERSION FUNCTIONS
 */

export function toCoords(range: MapRange): CoordsXY[] {
    const tileCoords = [] as CoordsXY[];
    for (let x = range.leftTop.x; x <= range.rightBottom.x; x++)
        for (let y = range.leftTop.y; y <= range.rightBottom.y; y++)
            tileCoords.push({ x: x, y: y });
    return tileCoords;
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

export function toTileCoords(worldCoords: CoordsXY): CoordsXY {
    return { x: worldCoords.x / 32, y: worldCoords.y / 32 };
}

export function toWorldCoords(tileCoords: CoordsXY): CoordsXY {
    return { x: tileCoords.x * 32, y: tileCoords.y * 32 };
}

/*
 * MATH
 */

function round(coords: CoordsXY): CoordsXY {
    return {
        x: Math.round(coords.x),
        y: Math.round(coords.y),
    };
}

export function add(u: CoordsXY, v: CoordsXY): CoordsXY {
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

export function center(range: MapRange): CoordsXY {
    return round(scale(add(range.rightBottom, range.leftTop), 0.5));
}

export function centered(center: CoordsXY, size: CoordsXY): MapRange {
    const start: CoordsXY = round(sub(center, scale(size, 0.5)));
    return {
        leftTop: start,
        rightBottom: add(start, size),
    };
}

export function circle(center: CoordsXY, diameter: number): CoordsXY[] {
    const start: CoordsXY = round(sub(center, { x: (diameter - 1) / 2, y: (diameter - 1) / 2 })); // -2 also works
    const m: number = (diameter - 1) / 2;
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
        c => (c.x - m) * (c.x - m) + (c.y - m) * (c.y - m) <= r2
    ).map(
        c => add(c, start)
    );
}

export function square(center: CoordsXY, diameter: number): CoordsXY[] {
    const start: CoordsXY = round(sub(center, { x: (diameter - 1) / 2, y: (diameter - 1) / 2 })); // -2 also works
    diameter--;
    return toCoords({
        leftTop: start,
        rightBottom: add(start, { x: diameter, y: diameter }),
    });
}

export function equals(u?: CoordsXY, v?: CoordsXY): boolean {
    if (u === undefined && v === undefined)
        return true;
    if (u === undefined || v === undefined)
        return false;
    return u.x === v.x && u.y === v.y;
}

export function parity(coords: CoordsXY, mod: number) {
    return (coords.x + coords.y) % mod;
}
