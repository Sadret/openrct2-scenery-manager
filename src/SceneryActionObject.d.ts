/// <reference path="./SceneryActionArgs.d.ts" />

type SceneryType = "footpath" | "small_scenery" | "wall" | "large_scenery" | "banner" | "footpath_addition";
type SceneryPlaceAction = "footpathplace" | "smallsceneryplace" | "wallplace" | "largesceneryplace" | "bannerplace" | "footpathsceneryplace";
type SceneryRemoveAction = "footpathremove" | "smallsceneryremove" | "wallremove" | "largesceneryremove" | "bannerremove" | "footpathsceneryremove";

interface SceneryActionObject {
    readonly type: SceneryType,
    readonly args: SceneryActionArgs,
    readonly placeAction: SceneryPlaceAction,
    readonly removeAction: SceneryRemoveAction,
}

interface FootpathActionObject extends SceneryActionObject {
    readonly type: "footpath",
    readonly args: FootpathActionArgs,
    readonly placeAction: "footpathplace",
    readonly removeAction: "footpathremove",
}

interface SmallSceneryActionObject extends SceneryActionObject {
    readonly type: "small_scenery",
    readonly args: SmallSceneryActionArgs,
    readonly placeAction: "smallsceneryplace",
    readonly removeAction: "smallsceneryremove",
    readonly diagonal: boolean,
    readonly half: boolean,
}

interface WallActionObject extends SceneryActionObject {
    readonly type: "wall",
    readonly args: WallActionArgs,
    readonly placeAction: "wallplace",
    readonly removeAction: "wallremove",
}

interface LargeSceneryActionObject extends SceneryActionObject {
    readonly type: "large_scenery",
    readonly args: LargeSceneryActionArgs,
    readonly placeAction: "largesceneryplace",
    readonly removeAction: "largesceneryremove",
}

interface BannerActionObject extends SceneryActionObject {
    readonly type: "banner",
    readonly args: BannerActionArgs,
    readonly placeAction: "bannerplace",
    readonly removeAction: "bannerremove",
}

interface FootpathSceneryActionObject extends SceneryActionObject {
    readonly type: "footpath_addition",
    readonly args: FootpathSceneryActionArgs,
    readonly placeAction: "footpathsceneryplace",
    readonly removeAction: "footpathsceneryremove",
}
