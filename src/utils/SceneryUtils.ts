/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/Actions.d.ts" />
/// <reference path="./../definitions/Data.d.ts" />

import Banner from "../template/Banner";
import Entrance from "../template/Entrance";
import Footpath from "../template/Footpath";
import FootpathAddition from "../template/FootpathAddition";
import LargeScenery from "../template/LargeScenery";
import SmallScenery from "../template/SmallScenery";
import Track from "../template/Track";
import Wall from "../template/Wall";
import * as CoordUtils from "../utils/CoordUtils";
import * as Template from "../template/Template";

/*
 * READ / PLACE / REMOVE METHODS
 */

export function read(tiles: CoordsXY[]): ElementData[] {
    const elements: ElementData[] = [];
    tiles.forEach(
        (coords: CoordsXY) => elements.push(...getSceneryData(coords))
    );
    return elements;
}

export function place(elements: ElementData[], ghost: boolean = false): ElementData[] {
    const result: ElementData[] = [];
    elements.forEach((element: ElementData) => {
        const action: PlaceAction = Template.getPlaceAction(element);
        const args: PlaceActionArgs = {
            ...Template.getPlaceArgs(element),
            flags: ghost ? 72 : 0,
        };
        context.queryAction(action, args, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(action, args, executeResult => {
                    if (executeResult.error === 0)
                        result.push(element);
                });
        });
    });
    return result;
}

export function remove(elements: ElementData[], ghost: boolean = false) {
    elements.forEach((element: ElementData) => {
        const action: RemoveAction = Template.getRemoveAction(element);
        const args: RemoveActionArgs = {
            ...Template.getRemoveArgs(element),
            flags: ghost ? 72 : 0,
        };
        context.queryAction(action, args, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(action, args, () => { });
        });
    });
}

/*
 * DATA CREATION
 */

function getSceneryData(coords: CoordsXY): ElementData[] {
    const tileCoords = CoordUtils.worldToTileCoords(coords);
    const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
    const data: ElementData[] = [];
    tile.elements.forEach((element: BaseTileElement) => {
        switch (element.type) {
            case "banner":
                return data.push(Banner.createFromTileData(coords, <BannerElement>element));
            case "entrance":
                return data.push(Entrance.createFromTileData(coords, <EntranceElement>element));
            case "footpath":
                data.push(Footpath.createFromTileData(coords, <FootpathElement>element));
                const addition: FootpathAdditionData = FootpathAddition.createFromTileData(coords, <FootpathElement>element);
                if (addition !== undefined)
                    data.push(addition);
                return;
            case "large_scenery":
                const largeScenery: LargeSceneryData = LargeScenery.createFromTileData(coords, <LargeSceneryElement>element);
                if (largeScenery !== undefined)
                    data.push(largeScenery);
                return;
            case "small_scenery":
                return data.push(SmallScenery.createFromTileData(coords, <SmallSceneryElement>element));
            case "track":
                const track: TrackData = Track.createFromTileData(coords, <TrackElement>element);
                if (track !== undefined)
                    data.push(track);
                return;
            case "wall":
                return data.push(Wall.createFromTileData(coords, <WallElement>element));
            default:
                return;
        }
    });
    return data;
}

/*
 * UTILITY METHODS
 */

function getSurface(coords: CoordsXY): SurfaceElement {
    for (let element of map.getTile(coords.x / 32, coords.y / 32).elements)
        if (element.type === "surface")
            return <SurfaceElement>element;
    return undefined;
}

function getMedianSurfaceHeight(tiles: CoordsXY[]): number {
    const heights: number[] = [];
    tiles.forEach(
        (coords: CoordsXY) => {
            const surface: BaseTileElement = getSurface(coords);
            if (surface !== undefined)
                heights.push(surface.baseHeight);
        }
    );
    heights.sort();
    return heights[Math.floor(heights.length / 2)];
}

export function getSurfaceHeight(coords: CoordsXY): number {
    return getSurface(coords) ?.baseZ;
}

/*
 * IDENTIFIER TO OBJECT CONVERSION
 */

const cache: { [key: string]: { [key: string]: Object; }; } = {};

function loadCache(type: ObjectType): void {
    cache[type] = {};
    context.getAllObjects(type).forEach((object: Object) => cache[type][getIdentifier(object)] = object);
}

export function getObject(data: ElementData): Object {
    if (cache[data.type] === undefined)
        loadCache(<ObjectType>data.type);
    const object = cache[data.type][data.identifier];
    if (object !== undefined && data.identifier !== getIdentifier(object))
        loadCache(<ObjectType>data.type);
    return cache[data.type][data.identifier];
}

// where used?
export function getIdentifier(object: Object): string {
    if (object === null)
        return undefined;
    return object.identifier || object.legacyIdentifier;
}
