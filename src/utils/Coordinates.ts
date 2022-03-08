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

export function toTileCoords(worldCoords: CoordsXY): CoordsXY {
    return { x: worldCoords.x / 32, y: worldCoords.y / 32 };
}

export function toWorldCoords(tileCoords: CoordsXY): CoordsXY {
    return { x: tileCoords.x * 32, y: tileCoords.y * 32 };
}

/*
 * MATH
 */

export function round(coords: CoordsXY): CoordsXY {
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

export function scale(u: CoordsXY, f: number): CoordsXY {
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
