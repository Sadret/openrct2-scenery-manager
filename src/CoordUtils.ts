/// <reference path="./../../openrct2.d.ts" />

export function startEndToMapRange(start: CoordsXY, end: CoordsXY): MapRange {
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

export function startSizeToMapRange(start: CoordsXY, size: CoordsXY): MapRange {
    return {
        leftTop: start,
        rightBottom: add(start, size),
    };
}

export function getSize(range: MapRange): CoordsXY {
    return sub(range.rightBottom, range.leftTop);
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
