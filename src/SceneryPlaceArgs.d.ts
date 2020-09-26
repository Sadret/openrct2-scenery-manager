interface SceneryPlaceArgs {
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly object: number,
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

interface FootpathSceneryPlaceArgs extends SceneryPlaceArgs {
}
