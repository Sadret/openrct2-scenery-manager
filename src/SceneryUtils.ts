/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

export interface SceneryGroup {
    readonly objects: SceneryPlaceObject[],
    readonly size: CoordsXY,
    name?: string,
}

let diagonally: number[] = [0x5, 0x7, 0xA, 0xB, 0xD, 0xE,];

// move offset here
// create math lib on SceneryGroup
export function rotate(group: SceneryGroup): SceneryGroup {
    return {
        objects: group.objects.map(object => {
            let args: any = {
                ...object.placeArgs,
                x: object.placeArgs.y,
                y: group.size.x - object.placeArgs.x,
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
                type: object.type,
                placeAction: object.placeAction,
                placeArgs: args,
            }
        }),
        size: {
            x: group.size.y,
            y: group.size.x,
        },
        name: "rotation of " + group.name,
    };
}
export function mirror(group: SceneryGroup): SceneryGroup {
    // mirror_scenery(): /src/openrct2/ride/TrackDesign.cpp
    return {
        objects: group.objects.map(object => {
            let args: any = {
                ...object.placeArgs,
                y: group.size.y - object.placeArgs.y,
            };
            switch (object.type) {
                case "footpath":
                    if (args.direction & (1 << 0))
                        args.direction ^= (1 << 1);
                    if (args.slope & (1 << 0))
                        args.slope ^= (1 << 1);
                    break;
                case "small_scenery":
                    if ((<SmallSceneryPlaceObject>object).diagonal) {
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
                    break;
                case "footpath_addition":
                    break;
            }
            return {
                type: object.type,
                placeAction: object.placeAction,
                placeArgs: args,
            };
        }),
        size: group.size,
        name: "rotation of " + group.name,
    };
}

export function getSceneryPlaceObjects(x: number, y: number, offset: CoordsXY): SceneryPlaceObject[] {
    let tile: Tile = map.getTile(x / 32, y / 32);
    let objects: SceneryPlaceObject[] = [];
    tile.elements.forEach((_, idx) => {
        switch (tile.elements[idx].type) {
            case "footpath":
                objects.push(getFootpath(tile, offset, idx));
                // objects.push(getFootpathScenery(tile, offset, idx));
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

function getSceneryPlaceArgs(tile: Tile, offset: CoordsXY, idx: number): SceneryPlaceArgs {
    let element: BaseTileElement = tile.elements[idx];
    return {
        x: tile.x * 32 - offset.x,
        y: tile.y * 32 - offset.y,
        z: element.baseHeight * 8,
        object: (<any>element).object,
    }
}

function getFootpath(tile: Tile, offset: CoordsXY, idx: number): FootpathPlaceObject {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    let args: FootpathPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
        direction: element.direction,
        slope: (tile.data[idx * 16 + 0x9] & 1) * (tile.data[idx * 16 + 0xA] | (1 << 2)),
    };
    console.log(args.slope);
    return {
        type: "footpath",
        placeAction: "footpathplace",
        placeArgs: args,
    }
}

function getSmallScenery(tile: Tile, offset: CoordsXY, idx: number): SmallSceneryPlaceObject {
    let element: SmallSceneryElement = <SmallSceneryElement><BaseTileElement>tile.elements[idx];
    let args: SmallSceneryPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
        direction: element.direction,
        quadrant: (getFirstSetBit(tile.data[idx * 16 + 1]) + 2) % 4,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
    let occupiedQuadrants = tile.data[idx * 16 + 1] & 0xF;
    return {
        type: "small_scenery",
        placeAction: "smallsceneryplace",
        placeArgs: args,
        diagonal: diagonally.indexOf(occupiedQuadrants) !== -1,
    }
}

function getWall(tile: Tile, offset: CoordsXY, idx: number): WallPlaceObject {
    let element: WallElement = <WallElement><BaseTileElement>tile.elements[idx];
    let args: WallPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
        direction: element.direction,
        edge: tile.data[idx * 16 + 0] % 4,
        primaryColour: tile.data[idx * 16 + 6],
        secondaryColour: tile.data[idx * 16 + 7],
        tertiaryColour: tile.data[idx * 16 + 8],
    };
    return {
        type: "wall",
        placeAction: "wallplace",
        placeArgs: args,
    }
}

function getLargeScenery(tile: Tile, offset: CoordsXY, idx: number): LargeSceneryPlaceObject {
    let element: LargeSceneryElement = <LargeSceneryElement><BaseTileElement>tile.elements[idx];
    let args: LargeSceneryPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
        direction: (<any>element).direction,
        primaryColour: element.primaryColour,
        secondaryColour: element.secondaryColour,
    };
    console.log(args);
    return {
        type: "large_scenery",
        placeAction: "largesceneryplace",
        placeArgs: args,
    }
}

function getBanner(tile: Tile, offset: CoordsXY, idx: number): BannerPlaceObject {
    let element: BannerElement = <BannerElement><BaseTileElement>tile.elements[idx];
    let args: BannerPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
        z: (element.baseHeight - 2) * 8,
        direction: tile.data[idx * 16 + 6],
        primaryColour: (<any>element).primaryColour,
    };
    return {
        type: "banner",
        placeAction: "bannerplace",
        placeArgs: args,
    }
}

function getFootpathScenery(tile: Tile, offset: CoordsXY, idx: number): FootpathSceneryPlaceObject {
    let element: FootpathElement = <FootpathElement>tile.elements[idx];
    let args: FootpathSceneryPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
    };
    return {
        type: "footpath_addition",
        placeAction: "footpathsceneryplace",
        placeArgs: args,
    }
}

export function offset(args: SceneryPlaceArgs, offset: CoordsXY): SceneryPlaceArgs {
    return {
        ...args,
        x: args.x + offset.x,
        y: args.y + offset.y,
    }
}

function getFirstSetBit(n: number) {
    for (let i = 0; n != 0; i++ , n >>= 1) {
        if ((n & 1) == 1)
            return i;
    }
    return undefined;
}
