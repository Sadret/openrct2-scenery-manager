/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * TEMPLATES
 */

interface TemplateData {
    readonly elements: ElementData[];
    readonly tiles: CoordsXY[];
}

interface ObjectData {
    readonly type: ObjectType;
    readonly identifier: string;
}

type ElementData =
    BannerData |
    EntranceData |
    FootpathData |
    FootpathAdditionData |
    LargeSceneryData |
    SmallSceneryData |
    TrackData |
    WallData;

interface ElementBaseData {
    readonly type: ElementType;
    readonly x: number;
    readonly y: number;
    readonly z: number; // except entrance
}

interface BannerData extends ElementBaseData {
    readonly type: "banner";
    readonly direction: number;
    readonly primaryColour: number;
}

interface EntranceData extends ElementBaseData {
    readonly type: "entrance";
    readonly direction: number;
    readonly ride: number;
    readonly station: number;
    readonly isExit: boolean;
}

interface FootpathData extends ElementBaseData {
    readonly type: "footpath";
    readonly surfaceIdentifier: string;
    readonly railingsIdentifier: string;
    readonly slopeDirection: number | null;
    readonly isQueue: boolean;
}

interface FootpathAdditionData extends ElementBaseData {
    readonly type: "footpath_addition";
    readonly identifier: string;
}

interface LargeSceneryData extends ElementBaseData {
    readonly type: "large_scenery";
    readonly direction: number;
    readonly identifier: string;
    readonly primaryColour: number;
    readonly secondaryColour: number;
}

interface SmallSceneryData extends ElementBaseData {
    readonly type: "small_scenery";
    readonly direction: number;
    readonly identifier: string;
    readonly quadrant: number;
    readonly primaryColour: number;
    readonly secondaryColour: number;
}

interface TrackData extends ElementBaseData {
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

interface WallData extends ElementBaseData {
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

type ScatterElement = SmallSceneryData | LargeSceneryData;

interface ScatterData {
    readonly element: ScatterElement;
    readonly weight: number;
}

type ScatterPattern = ScatterData[];

/*
 * SCENERY OBJECTS
 */

interface SceneryObjectInfo {
    type: SceneryObjectType;
    name: string;
    identifier: string;
    mapCount: number;
    parkCount: number;
};

interface SceneryObjectFilter {
    type?: SceneryObjectType;
    identifier?: string;
    primaryColour?: number;
    secondaryColour?: number;
    tertiaryColour?: number;
}
