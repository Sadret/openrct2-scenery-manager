/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * ELEMENT TYPES
 */
// no surface or corrupt, but footpath_addition
type ElementType =
    "banner" |
    "entrance" |
    "footpath" |
    "footpath_addition" |
    "large_scenery" |
    "small_scenery" |
    "track" |
    "wall";

/*
 * TEMPLATE DATA
 */

interface TemplateData {
    readonly elements: ElementData[],
    readonly size: CoordsXY,
    readonly surfaceHeight: number,
}

/*
 * ELEMENT DATA
 */

interface ElementData {
    // all
    readonly type: ElementType,
    readonly x: number,
    readonly y: number,
    // almost all
    readonly z: number, // except entrance
    readonly direction: number, // except footpath, footpath_addition
    readonly identifier: string, // except entrance, track
}

interface BannerData extends ElementData {
    readonly type: "banner",
    readonly primaryColour: number,
}

interface EntranceData extends ElementData {
    readonly type: "entrance",
    readonly ride: number,
    readonly station: number,
    readonly isExit: boolean,
}

interface FootpathData extends ElementData {
    readonly type: "footpath",
    readonly slope: number,
    readonly isQueue: boolean,
}

interface FootpathAdditionData extends ElementData {
    readonly type: "footpath_addition",
}

interface LargeSceneryData extends ElementData {
    readonly type: "large_scenery",
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface SmallSceneryData extends ElementData {
    readonly type: "small_scenery",
    readonly quadrant: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface TrackData extends ElementData {
    readonly type: "track",
    readonly ride: number,
    readonly trackType: number,
    readonly brakeSpeed: number,
    readonly colour: number,
    readonly seatRotation: number,
    readonly trackPlaceFlags: number,
    readonly isFromTrackDesign: boolean,
}

interface WallData extends ElementData {
    readonly type: "wall",
    readonly primaryColour: number,
    readonly secondaryColour: number,
    readonly tertiaryColour: number,
}
