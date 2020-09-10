/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

export interface SceneryGroup {
    readonly objects: SceneryPlaceObject[],
    readonly size: CoordsXY,
}

export function getSceneryPlaceObjects(tile: Tile, offset: CoordsXY): SceneryPlaceObject[] {
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
    })
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
        slope: (<any>element).slope,
    };
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
    return {
        type: "small_scenery",
        placeAction: "smallsceneryplace",
        placeArgs: args,
    }
}

function getWall(tile: Tile, offset: CoordsXY, idx: number): WallPlaceObject {
    let element: WallElement = <WallElement><BaseTileElement>tile.elements[idx];
    let args: WallPlaceArgs = {
        ...getSceneryPlaceArgs(tile, offset, idx),
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
        direction: (<any>element).direction,
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
        type: "footpath_scenery",
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
