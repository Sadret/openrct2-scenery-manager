/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryActionObject.d.ts" />

/*
 * INTERFACE DEFINITION
 */

export interface SceneryGroup {
    readonly objects: SceneryActionObject[],
    readonly size: CoordsXY,
    name?: string,
}

/*
 * TRANSFORMATION METHODS
 */

export function translate(group: SceneryGroup, offset: CoordsXY): SceneryGroup {
    return {
        ...group,
        objects: group.objects.map(object => ({
            ...object,
            args: {
                ...object.args,
                x: object.args.x + offset.x,
                y: object.args.y + offset.y,
            },
        })),
    };
}

export function rotate(group: SceneryGroup, rotation: number): SceneryGroup {
    if (rotation % 4 == 0)
        return group;
    return rotate({
        ...group,
        objects: group.objects.map(object => {
            let args: any = {
                ...object.args,
                x: object.args.y,
                y: group.size.x - object.args.x,
            };
            if (args.direction !== undefined) {
                args.direction++;
                args.direction %= 4;
            }
            if (args.edge !== undefined) {
                args.edge++;
                args.edge %= 4;
            }
            if (args.quadrant !== undefined) {
                args.quadrant++;
                args.quadrant %= 4;
            }
            if (args.slope !== undefined && args.slope !== 0) {
                args.slope = (((args.slope ^ (1 << 2)) + 1) % 4) | (1 << 2);
            }
            return {
                ...object,
                args: args,
            };
        }),
        size: {
            x: group.size.y,
            y: group.size.x,
        },
    }, rotation - 1);
}

export function mirror(group: SceneryGroup, mirror: boolean): SceneryGroup {
    // mirror_scenery(): /src/openrct2/ride/TrackDesign.cpp
    if (!mirror)
        return group;
    return {
        ...group,
        objects: group.objects.map(object => {
            let args: any = {
                ...object.args,
                y: group.size.y - object.args.y,
            };
            switch (object.type) {
                case "footpath":
                    if (args.direction & (1 << 0))
                        args.direction ^= (1 << 1);
                    if (args.slope & (1 << 0))
                        args.slope ^= (1 << 1);
                    break;
                case "small_scenery":
                    if ((<SmallSceneryActionObject>object).diagonal) {
                        args.direction ^= (1 << 0);
                        // if (fountain)
                        //     args.quadrant ^= (1 << 0);
                        break;
                    }
                    if (args.direction & (1 << 0))
                        args.direction ^= (1 << 1);
                    args.quadrant ^= (1 << 0);
                    break;
                case "wall":
                    if (args.direction & (1 << 0))
                        args.direction ^= (1 << 1);
                    if (args.edge & (1 << 0))
                        args.edge ^= (1 << 1);
                    break;
                case "large_scenery":
                    break;
                case "banner":
                    if (args.direction & (1 << 0))
                        args.direction ^= (1 << 1);
                    break;
                case "footpath_addition":
                    break;
            }
            return {
                ...object,
                args: args,
            };
        }),
    };
}

/*
 * COPY PASTE REMOVE METHODS
 */

/*
 * ACTIONOBJECT CREATION
 */

export function getSceneryActionObjects(x: number, y: number, offset: CoordsXY): SceneryActionObject[] {
    let tile: Tile = map.getTile(x / 32, y / 32);
    let objects: SceneryActionObject[] = [];
    tile.elements.forEach((_, idx) => {
        switch (tile.elements[idx].type) {
            case "footpath":
                objects.push(getFootpath(tile, offset, idx));
                let addition: FootpathSceneryActionObject = getFootpathScenery(tile, offset, idx);
                if (addition !== undefined)
                    objects.push(addition);
                break;
            case "small_scenery":
                objects.push(getSmallScenery(tile, offset, idx));
                break;
            case "wall":
                objects.push(getWall(tile, offset, idx));
                break;
            case "large_scenery":
                objects.push(getLargeScenery(tile, offset, idx));
                break;
            case "banner":
                objects.push(getBanner(tile, offset, idx));
                break;
            default:
                break;
        }
    });
    return objects;
}

function getSceneryActionArgs(tile: Tile, offset: CoordsXY, idx: number): SceneryActionArgs {
    let element: BaseTileElement = tile.elements[idx];
    return {
        x: tile.x * 32 - offset.x,
        y: tile.y * 32 - offset.y,
        z: element.baseHeight * 8,
        object: (<any>element).object,
    }
}

function getFootpath(tile: Tile, offset: CoordsXY, idx: number): FootpathActionObject {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    let args: FootpathActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        direction: element.direction,
        slope: (tile.data[idx * 16 + 0x9] & 1) * (tile.data[idx * 16 + 0xA] | (1 << 2)),
        object: (tile.data[idx * 16 + 0x0] & (1 << 0)) << 7 | tile.data[idx * 16 + 0x4],
    };
    return {
        type: "footpath",
        placeAction: "footpathplace",
        removeAction: "footpathremove",
        args: args,
    }
}

function getSmallScenery(tile: Tile, offset: CoordsXY, idx: number): SmallSceneryActionObject {
    let element: SmallSceneryElement = <SmallSceneryElement><BaseTileElement>tile.elements[idx];
    let args: SmallSceneryActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        direction: element.direction,
        quadrant: (tile.data[idx * 16 + 0] >> 6) & 3,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
    let occupiedQuadrants = tile.data[idx * 16 + 1] & 0xF;
    return {
        type: "small_scenery",
        placeAction: "smallsceneryplace",
        removeAction: "smallsceneryremove",
        args: args,
        diagonal: [0x5, 0x7, 0xA, 0xB, 0xD, 0xE].indexOf(occupiedQuadrants) !== -1,
    }
}

function getWall(tile: Tile, offset: CoordsXY, idx: number): WallActionObject {
    let element: WallElement = <WallElement><BaseTileElement>tile.elements[idx];
    let args: WallActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        direction: element.direction,
        edge: tile.data[idx * 16 + 0] % 4,
        primaryColour: tile.data[idx * 16 + 6],
        secondaryColour: tile.data[idx * 16 + 7],
        tertiaryColour: tile.data[idx * 16 + 8],
    };
    return {
        type: "wall",
        placeAction: "wallplace",
        removeAction: "wallremove",
        args: args,
    }
}

function getLargeScenery(tile: Tile, offset: CoordsXY, idx: number): LargeSceneryActionObject {
    let element: LargeSceneryElement = <LargeSceneryElement><BaseTileElement>tile.elements[idx];
    let args: LargeSceneryActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        direction: (<any>element).direction,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
    return {
        type: "large_scenery",
        placeAction: "largesceneryplace",
        removeAction: "largesceneryremove",
        args: args,
    }
}

function getBanner(tile: Tile, offset: CoordsXY, idx: number): BannerActionObject {
    let element: BannerElement = <BannerElement><BaseTileElement>tile.elements[idx];
    let args: BannerActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        z: (element.baseHeight - 2) * 8,
        direction: tile.data[idx * 16 + 6],
        primaryColour: (<any>element).primaryColour,
    };
    return {
        type: "banner",
        placeAction: "bannerplace",
        removeAction: "bannerremove",
        args: args,
    }
}

function getFootpathScenery(tile: Tile, offset: CoordsXY, idx: number): FootpathSceneryActionObject {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    if (tile.data[idx * 16 + 0x7] === 0)
        return undefined;
    let args: FootpathSceneryActionArgs = {
        ...getSceneryActionArgs(tile, offset, idx),
        object: tile.data[idx * 16 + 0x7],
    };
    return {
        type: "footpath_addition",
        placeAction: "footpathsceneryplace",
        removeAction: "footpathsceneryremove",
        args: args,
    }
}
