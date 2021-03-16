/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function rotate(direction: number, rotation: number): number;
export function rotate(direction: number | null, rotation: number): number | null;
export function rotate(direction: number | null, rotation: number): number | null {
    return direction && (direction + rotation) & 0x3;
}

export function mirror(direction: number, mirrored?: boolean): number;
export function mirror(direction: number | null, mirrored?: boolean): number | null;
export function mirror(direction: number | null, mirrored: boolean = true): number | null {
    if (direction && mirrored && direction & 0x1)
        return direction ^ 0x2;
    return direction;
}
