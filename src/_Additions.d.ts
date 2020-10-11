/*
 * SCENERY PLACE ACTIONS
 */

interface SceneryPlaceArgs {
    readonly flags: number,
    readonly object: number,
    readonly x: number,
    readonly y: number,
    readonly z: number,
}

interface FootpathPlaceArgs extends SceneryPlaceArgs {
    readonly direction: number,
    readonly slope: number,
}

interface SmallSceneryPlaceArgs extends SceneryPlaceArgs {
    readonly direction: number,
    readonly quadrant: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface WallPlaceArgs extends SceneryPlaceArgs {
    readonly direction: number,
    readonly edge: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
    readonly tertiaryColour: number,
}

interface LargeSceneryPlaceArgs extends SceneryPlaceArgs {
    readonly direction: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface BannerPlaceArgs extends SceneryPlaceArgs {
    readonly direction: number,
    readonly primaryColour: number,
}

interface FootpathSceneryPlaceArgs extends SceneryPlaceArgs { }

/*
 * SCENERY REMOVE ACTIONS
 */

interface SceneryRemoveArgs {
    readonly flags: number,
    readonly x: number,
    readonly y: number,
    readonly z: number,
}

interface FootpathRemoveArgs extends SceneryRemoveArgs { }

interface SmallSceneryRemoveArgs extends SceneryRemoveArgs {
    readonly object: number,
    readonly quadrant: number,
}

interface WallRemoveArgs extends SceneryRemoveArgs {
    readonly direction: number,
}

interface LargeSceneryRemoveArgs extends SceneryRemoveArgs {
    readonly direction: number,
    readonly tileIndex: number,
}

interface BannerRemoveArgs extends SceneryRemoveArgs {
    readonly direction: number,
}

interface FootpathSceneryRemoveArgs extends SceneryRemoveArgs { }

/*
 * OTHER
 */

type SceneryObject = Object | SmallSceneryObject;

type SceneryPlaceAction = "footpathplace" | "smallsceneryplace" | "wallplace" | "largesceneryplace" | "bannerplace" | "footpathsceneryplace";

type SceneryRemoveAction = "footpathremove" | "smallsceneryremove" | "wallremove" | "largesceneryremove" | "bannerremove" | "footpathsceneryremove";
