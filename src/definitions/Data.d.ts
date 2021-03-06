/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
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
    readonly elements: ElementData[];
    readonly tiles: CoordsXY[];
}

/*
 * ELEMENT DATA
 */

interface ObjectData {
    readonly type: ElementType;
    readonly identifier: string; // except entrance, track
}

interface ElementData {
    readonly type: ElementType;
    readonly x: number;
    readonly y: number;
    readonly z: number; // except entrance
}

interface BannerData extends ElementData {
    readonly type: "banner";
    readonly direction: number;
    readonly primaryColour: number;
}

interface EntranceData extends ElementData {
    readonly type: "entrance";
    readonly direction: number;
    readonly ride: number;
    readonly station: number;
    readonly isExit: boolean;
}

interface FootpathData extends ElementData {
    readonly type: "footpath";
    readonly identifier: string;
    readonly slopeDirection: number | null;
    readonly isQueue: boolean;
}

interface FootpathAdditionData extends ElementData {
    readonly type: "footpath_addition";
    readonly identifier: string;
}

interface LargeSceneryData extends ElementData {
    readonly type: "large_scenery";
    readonly direction: number;
    readonly identifier: string;
    readonly primaryColour: number;
    readonly secondaryColour: number;
}

interface SmallSceneryData extends ElementData {
    readonly type: "small_scenery";
    readonly direction: number;
    readonly identifier: string;
    readonly quadrant: number;
    readonly primaryColour: number;
    readonly secondaryColour: number;
}

interface TrackData extends ElementData {
    readonly type: "track";
    readonly direction: number;
    readonly ride: number;
    readonly trackType: number;
    readonly brakeSpeed: number;
    readonly colour: number;
    readonly seatRotation: number;
    readonly trackPlaceFlags: number;
    readonly isFromTrackDesign: boolean;
}

interface WallData extends ElementData {
    readonly type: "wall";
    readonly direction: number;
    readonly identifier: string;
    readonly primaryColour: number;
    readonly secondaryColour: number;
    readonly tertiaryColour: number;
}

/*
 * SCATTER
 */

interface ScatterData {
    readonly element: ElementData;
    readonly weight: number;
}

type ScatterPattern = ScatterData[];
