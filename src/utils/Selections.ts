/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../utils/Arrays";
import * as Coordinates from "../utils/Coordinates";

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

export function toMapRange(selection: Selection): MapRange {
    if (selection !== undefined && !Array.isArray(selection))
        return selection;

    const coordsList = selection || [];
    const xx: number[] = coordsList.map((coords: CoordsXY) => coords.x);
    const yy: number[] = coordsList.map((coords: CoordsXY) => coords.y);
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

export function includes(selection: Selection, coords: CoordsXY): boolean {
    if (selection === undefined)
        return false;
    else if (Array.isArray(selection))
        return Arrays.includes(selection, value => Coordinates.equals(coords, value));
    else return selection.leftTop.x <= coords.x
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

export function translate(selection: Selection, offset: CoordsXY): Selection {
    if (selection === undefined)
        return undefined;
    else if (Array.isArray(selection))
        return selection.map(coords => Coordinates.add(coords, offset));
    else
        return {
            leftTop: Coordinates.add(selection.leftTop, offset),
            rightBottom: Coordinates.add(selection.rightBottom, offset),
        };
}

export function rotate(selection: Selection, rotation: number): Selection {
    if (selection === undefined)
        return undefined;
    else if (Array.isArray(selection))
        return selection.map(coords => Coordinates.rotate(coords, rotation));
    else
        return toMapRange([
            Coordinates.rotate(selection.leftTop, rotation),
            Coordinates.rotate(selection.rightBottom, rotation),
        ]);
}

export function mirror(selection: Selection): Selection {
    if (selection === undefined)
        return undefined;
    else if (Array.isArray(selection))
        return selection.map(coords => Coordinates.mirror(coords));
    else
        return toMapRange([
            Coordinates.mirror(selection.leftTop),
            Coordinates.mirror(selection.rightBottom),
        ]);
}

export function center(selection: Selection, round = true): CoordsXY {
    const range = toMapRange(selection);
    const center = Coordinates.scale(
        Coordinates.add(
            range.rightBottom,
            range.leftTop,
        ),
        0.5,
    );
    if (round)
        return Coordinates.round(center);
    else
        return center;
}

export function centered(center: CoordsXY, size: CoordsXY): MapRange {
    const start: CoordsXY = Coordinates.round(
        Coordinates.sub(
            center,
            Coordinates.scale(size, 0.5),
        ),
    );
    return {
        leftTop: start,
        rightBottom: Coordinates.add(start, size),
    };
}

export function circle(center: CoordsXY, diameter: number): CoordsXY[] {
    const start = Coordinates.round(
        Coordinates.sub(
            center,
            { x: (diameter - 1) / 2, y: (diameter - 1) / 2 }, // -2 also works
        ),
    );
    const m = (diameter - 1) / 2;
    const r2 = diameter / 2 * diameter / 2;
    const range = [] as number[];
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
        c => Coordinates.add(c, start)
    );
}

export function square(center: CoordsXY, diameter: number): MapRange {
    const start = Coordinates.round(
        Coordinates.sub(
            center,
            { x: (diameter - 1) / 2, y: (diameter - 1) / 2 }, // -2 also works
        )
    );
    diameter--;
    return {
        leftTop: start,
        rightBottom: Coordinates.add(
            start,
            { x: diameter, y: diameter },
        ),
    };
}
