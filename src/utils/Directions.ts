/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function rotate(direction: number, rotation: number): Direction;
export function rotate(direction: number | null, rotation: number): Direction | null;
export function rotate(direction: number | null, rotation: number): Direction | null {
    if (direction === null)
        return null;
    return ((direction + rotation) & 0x3) as Direction;
}

export function mirror(direction: number, mirrored?: boolean): Direction;
export function mirror(direction: number | null, mirrored?: boolean): Direction | null;
export function mirror(direction: number | null, mirrored: boolean = true): Direction | null {
    if (direction && mirrored && direction & 0x1)
        return ((direction ^ 0x2) & 0x3) as Direction;
    return direction && (direction & 0x3) as Direction;
}
