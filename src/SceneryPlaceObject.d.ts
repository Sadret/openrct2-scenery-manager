/// <reference path="./SceneryPlaceArgs.d.ts" />

// maybe change to openrct2.d.ts -> ObjectType
type SceneryType = "footpath" | "small_scenery" | "wall" | "large_scenery" | "banner" | "footpath_addition";
type SceneryPlaceAction = "footpathplace" | "smallsceneryplace" | "wallplace" | "largesceneryplace" | "bannerplace" | "footpathsceneryplace";

interface SceneryPlaceObject {
    readonly type: SceneryType,
    readonly placeAction: SceneryPlaceAction,
    readonly placeArgs: SceneryPlaceArgs,
}

interface FootpathPlaceObject extends SceneryPlaceObject {
    readonly type: "footpath",
    readonly placeAction: "footpathplace",
    readonly placeArgs: FootpathPlaceArgs,
}

interface SmallSceneryPlaceObject extends SceneryPlaceObject {
    readonly type: "small_scenery",
    readonly placeAction: "smallsceneryplace",
    readonly placeArgs: SmallSceneryPlaceArgs,
}

interface WallPlaceObject extends SceneryPlaceObject {
    readonly type: "wall",
    readonly placeAction: "wallplace",
    readonly placeArgs: WallPlaceArgs,
}

interface LargeSceneryPlaceObject extends SceneryPlaceObject {
    readonly type: "large_scenery",
    readonly placeAction: "largesceneryplace",
    readonly placeArgs: LargeSceneryPlaceArgs,
}

interface BannerPlaceObject extends SceneryPlaceObject {
    readonly type: "banner",
    readonly placeAction: "bannerplace",
    readonly placeArgs: BannerPlaceArgs,
}

interface FootpathSceneryPlaceObject extends SceneryPlaceObject {
    readonly type: "footpath_addition",
    readonly placeAction: "footpathsceneryplace",
    readonly placeArgs: FootpathSceneryPlaceArgs,
}
