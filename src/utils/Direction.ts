/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function rotate(direction: number, rotation: number): number {
    if (direction === null)
        return null;
    return (direction + rotation) & 0x3;
}
export function mirror(direction: number, mirrored: boolean = true): number {
    if (direction !== null && mirrored && direction & 0x1)
        return direction ^ 0x2;
    return direction;
}