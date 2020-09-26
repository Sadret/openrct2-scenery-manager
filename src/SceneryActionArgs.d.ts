interface SceneryActionArgs {
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly object: number,
}

interface FootpathActionArgs extends SceneryActionArgs {
    readonly direction: number,
    readonly slope: number,
}

interface SmallSceneryActionArgs extends SceneryActionArgs {
    readonly direction: number,
    readonly quadrant: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface WallActionArgs extends SceneryActionArgs {
    readonly direction: number,
    readonly edge: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
    readonly tertiaryColour: number,
}

interface LargeSceneryActionArgs extends SceneryActionArgs {
    readonly direction: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface BannerActionArgs extends SceneryActionArgs {
    readonly direction: number,
    readonly primaryColour: number,
}

interface FootpathSceneryActionArgs extends SceneryActionArgs {
}
