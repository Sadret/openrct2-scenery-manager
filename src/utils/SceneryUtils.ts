/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/_Additions.d.ts" />
/// <reference path="./../definitions/_Save.d.ts" />

import * as CoordUtils from "./../utils/CoordUtils";

/*
 * INTERFACE DEFINITION
 */

export interface Filter {
    footpath: boolean;
    small_scenery: boolean;
    wall: boolean;
    large_scenery: boolean;
    banner: boolean;
    footpath_addition: boolean;
}

export interface Options {
    rotation: number,
    mirrored: boolean,
    absolute: boolean;
    height: number;
    ghost: boolean;
}

/*
 * TRANSFORMATION METHODS
 */

function translate(template: SceneryTemplate, offset: CoordsXYZ): SceneryTemplate {
    return {
        ...template,
        data: template.data.map(input => ({
            ...input,
            x: input.x + offset.x,
            y: input.y + offset.y,
            z: input.z + offset.z,
        })),
    };
}

function rotate(template: SceneryTemplate, rotation: number): SceneryTemplate {
    if (rotation % 4 == 0)
        return template;
    return rotate({
        ...template,
        data: template.data.map(input => {
            let out: any = {
                ...input,
                x: input.y,
                y: template.size.x - input.x,
            };
            // 0xFF means no direction for paths
            if (out.direction !== undefined && out.direction !== 0xFF)
                out.direction = (out.direction + 1) & 3;
            if (out.edge !== undefined)
                out.edge = (out.edge + 1) & 3;
            if (out.quadrant !== undefined)
                if (!isFullTile(out))
                    out.quadrant = (out.quadrant + 1) & 3;
            if (out.slope !== undefined && out.slope !== 0)
                out.slope = (((out.slope ^ (1 << 2)) + 1) % 4) | (1 << 2);
            return out;
        }),
        size: {
            x: template.size.y,
            y: template.size.x,
        },
    }, rotation - 1);
}

function mirror(template: SceneryTemplate, mirror: boolean): SceneryTemplate {
    // mirror_scenery(): /src/openrct2/ride/TrackDesign.cpp
    if (!mirror)
        return template;
    return {
        ...template,
        data: template.data.map(input => {
            let out: any = {
                ...input,
                y: template.size.y - input.y,
            };
            switch (out.type) {
                case "footpath":
                    if (out.slope & (1 << 0))
                        out.slope ^= (1 << 1);
                    break;
                case "small_scenery":
                    if (isDiagonal(out)) {
                        out.direction ^= (1 << 0);
                        if (!isFullTile(out))
                            out.quadrant ^= (1 << 0);
                        break;
                    }
                    if (out.direction & (1 << 0))
                        out.direction ^= (1 << 1);
                    if (!isHalfSpace(out))
                        out.quadrant ^= (1 << 0);
                    break;
                case "wall":
                    if (out.direction & (1 << 0))
                        out.direction ^= (1 << 1);
                    if (out.edge & (1 << 0))
                        out.edge ^= (1 << 1);
                    break;
                case "large_scenery":
                    break;
                case "banner":
                    if (out.direction & (1 << 0))
                        out.direction ^= (1 << 1);
                    break;
                case "footpath_addition":
                    break;
            }
            return out;
        }),
    };
}

/*
 * COPY PASTE REMOVE METHODS
 */

export function copy(range: MapRange, filter: Filter): SceneryTemplate {
    const data: SceneryData[] = [];

    const start: CoordsXY = range.leftTop;
    const end: CoordsXY = range.rightBottom;
    const size: CoordsXY = CoordUtils.getSize(ui.tileSelection.range);

    for (let x = start.x; x <= end.x; x += 32)
        for (let y = start.y; y <= end.y; y += 32)
            data.push(...getSceneryData(x, y, start, filter));

    return {
        data: data,
        size: size,
        surfaceHeight: getMedianSurfaceHeight(start, size),
    };
}

export function paste(template: SceneryTemplate, offset: CoordsXY, filter: Filter, options: Options): SceneryRemoveArgs[] {
    let deltaZ = options.height;
    if (!options.absolute)
        deltaZ += getMedianSurfaceHeight(offset, template.size) - template.surfaceHeight;

    template = mirror(template, options.mirrored);
    template = rotate(template, options.rotation);
    template = translate(template, { ...offset, z: deltaZ * 8 });

    let result: SceneryRemoveArgs[] = [];

    template.data.forEach(data => {
        if (!filter[data.type])
            return;
        let placeArgs: SceneryPlaceArgs = getPlaceArgs(data, options.ghost ? 72 : 0);
        context.queryAction(getPlaceAction(data.type), placeArgs, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(getPlaceAction(data.type), placeArgs, executeResult => {
                    if (executeResult.error === 0)
                        result.push(getRemoveArgs(data));
                });
        });
    });
    return result;
}

export function remove(data: SceneryRemoveArgs[]) {
    data.slice().reverse().forEach((args: SceneryRemoveArgs) => {
        let type: SceneryType = (<any>args).type;
        if (type === "banner")
            context.executeAction(getRemoveAction(type), {
                ...args,
                z: args.z + 16,
            }, () => { });
        else
            context.executeAction(getRemoveAction(type), args, () => { });
    });
}

/*
 * Data CREATION
 */

function getSceneryData(x: number, y: number, offset: CoordsXY, filter: Filter): SceneryData[] {
    let tile: Tile = map.getTile(x / 32, y / 32);
    let data: SceneryData[] = [];
    tile.elements.forEach((_, idx) => {
        switch (tile.elements[idx].type) {
            case "footpath":
                if (filter.footpath)
                    data.push(getFootpath(tile, offset, idx));
                if (filter.footpath_addition) {
                    let addition: FootpathAdditionData = getFootpathAddition(tile, offset, idx);
                    if (addition !== undefined)
                        data.push(addition);
                }
                break;
            case "small_scenery":
                if (filter.small_scenery)
                    data.push(getSmallScenery(tile, offset, idx));
                break;
            case "wall":
                if (filter.wall)
                    data.push(getWall(tile, offset, idx));
                break;
            case "large_scenery":
                if (filter.large_scenery) {
                    let largeScenery = getLargeScenery(tile, offset, idx);
                    if (largeScenery !== undefined)
                        data.push(largeScenery);
                }
                break;
            case "banner":
                if (filter.banner)
                    data.push(getBanner(tile, offset, idx));
                break;
            default:
                break;
        }
    });
    return data;
}

function getBaseSceneryData(tile: Tile, offset: CoordsXY, idx: number): SceneryData {
    let element: BaseTileElement = tile.elements[idx];
    let object: Object = context.getObject(<ObjectType>element.type, (<any>element).object);
    return {
        type: undefined,
        identifier: object.identifier,
        x: tile.x * 32 - offset.x,
        y: tile.y * 32 - offset.y,
        z: element.baseHeight * 8,
    };
}

function getFootpath(tile: Tile, offset: CoordsXY, idx: number): FootpathData {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "footpath",
        direction: 0xFF, // otherwise, it removes walls in that direction
        slope: (tile.data[idx * 16 + 0x9] & 1) * (tile.data[idx * 16 + 0xA] | (1 << 2)),
        isQueue: element.isQueue,
    };
}

function getSmallScenery(tile: Tile, offset: CoordsXY, idx: number): SmallSceneryData {
    let element: SmallSceneryElement = <SmallSceneryElement><BaseTileElement>tile.elements[idx];
    let occupiedQuadrants = tile.data[idx * 16 + 1] & 0xF;
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "small_scenery",
        direction: element.direction,
        quadrant: (tile.data[idx * 16 + 0] >> 6) & 3,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
}

function getWall(tile: Tile, offset: CoordsXY, idx: number): WallData {
    let element: WallElement = <WallElement><BaseTileElement>tile.elements[idx];
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "wall",
        direction: element.direction,
        edge: tile.data[idx * 16 + 0] % 4,
        primaryColour: tile.data[idx * 16 + 6],
        secondaryColour: tile.data[idx * 16 + 7],
        tertiaryColour: tile.data[idx * 16 + 8],
    };
}

function getLargeScenery(tile: Tile, offset: CoordsXY, idx: number): LargeSceneryData {
    let element: LargeSceneryElement = <LargeSceneryElement><BaseTileElement>tile.elements[idx];
    if (tile.data[idx * 16 + 0x8] !== 0)
        return undefined;
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "large_scenery",
        direction: (<any>element).direction,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
}

function getBanner(tile: Tile, offset: CoordsXY, idx: number): BannerData {
    let element: BannerElement = <BannerElement><BaseTileElement>tile.elements[idx];
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "banner",
        z: (element.baseHeight - 2) * 8,
        direction: tile.data[idx * 16 + 6],
        primaryColour: (<any>element).primaryColour,
    };
}

function getFootpathAddition(tile: Tile, offset: CoordsXY, idx: number): FootpathAdditionData {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    if (element.addition === null)
        return undefined;
    let object: Object = context.getObject("footpath_addition", element.addition);
    if (tile.data[idx * 16 + 0x7] === 0)
        return undefined;
    return {
        ...getBaseSceneryData(tile, offset, idx),
        type: "footpath_addition",
        identifier: object.identifier,
    };
}

/*
 * UTILITY METHODS
 */

function getSurface(x: number, y: number): SurfaceElement {
    for (let element of map.getTile(x / 32, y / 32).elements)
        if (element.type === "surface")
            return <SurfaceElement>element;
    return undefined;
}

function getMedianSurfaceHeight(start: CoordsXY, size: CoordsXY): number {
    const heights: number[] = [];
    for (let x: number = 0; x <= size.x; x += 32)
        for (let y: number = 0; y <= size.y; y += 32) {
            const surface: TileElement = getSurface(start.x + x, start.y + y);
            if (surface !== undefined)
                heights.push(surface.baseHeight);
        }
    heights.sort();
    return heights[Math.floor(heights.length / 2)];
}

/*
 * TYPE INFO METHODS
 */

function getPlaceAction(type: SceneryType): SceneryPlaceAction {
    switch (type) {
        case "footpath":
            return "footpathplace";
        case "small_scenery":
            return "smallsceneryplace";
        case "wall":
            return "wallplace";
        case "large_scenery":
            return "largesceneryplace";
        case "banner":
            return "bannerplace";
        case "footpath_addition":
            return "footpathadditionplace";
        default:
            return undefined;
    }
}

function getRemoveAction(type: SceneryType): SceneryRemoveAction {
    switch (type) {
        case "footpath":
            return "footpathremove";
        case "small_scenery":
            return "smallsceneryremove";
        case "wall":
            return "wallremove";
        case "large_scenery":
            return "largesceneryremove";
        case "banner":
            return "bannerremove";
        case "footpath_addition":
            return "footpathadditionremove";
        default:
            return undefined;
    }
}

/*
 * IDENTIFIER TO OBJECT CONVERSION
 */

let cache = {};

export function getObject(data: SceneryData): SceneryObject {
    if (cache[data.type] === undefined) {
        cache[data.type] = {};
        context.getAllObjects(data.type).forEach((object: SceneryObject) => cache[data.type][object.identifier] = object);
    }
    return cache[data.type][data.identifier];
}

/*
 * OBJECT META DATA
 */

function isFullTile(data: SceneryData): boolean {
    return hasFlag(data, 0);
}

function isDiagonal(data: SceneryData): boolean {
    return hasFlag(data, 8);
}

function isHalfSpace(data: SceneryData): boolean {
    return hasFlag(data, 24);
}

function hasFlag(data: SceneryData, bit: number) {
    if (data.type !== "small_scenery")
        return false;
    let object: SmallSceneryObject = <SmallSceneryObject>getObject(data);
    return (object.flags & (1 << bit)) !== 0;
}

/*
 * SCENERYDATA TO ARGUMENT CONVERSION
 */
function getPlaceArgs(data: SceneryData, flags: number): SceneryPlaceArgs {
    switch (data.type) {
        case "footpath":
            return {
                ...data,
                flags: flags,
                object: getObject(data).index | ((<FootpathData>data).isQueue ? (1 << 7) : 0),
            };
        case "footpath_addition":
            return {
                ...data,
                flags: flags,
                object: getObject(data).index + 1,
            };
        default:
            return {
                ...data,
                flags: flags,
                object: getObject(data).index,
            };
    }
}

function getRemoveArgs(data: SceneryData): SceneryRemoveArgs {
    switch (data.type) {
        case "small_scenery":
            return <SmallSceneryRemoveArgs>{
                ...data,
                flags: 72,
                object: getObject(data).index,
            };
        case "large_scenery":
            return <LargeSceneryRemoveArgs>{
                ...data,
                flags: 72,
                tileIndex: 0,
            };
        default:
            return {
                ...data,
                flags: 72,
            };
    }
}
