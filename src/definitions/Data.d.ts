/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * ELEMENT DATA
 */

type SurfaceData = Omit<SurfaceElement,
    "surfaceStyle" |
    "edgeStyle" |
    "hasOwnership" |
    "hasConstructionRights"
    > & {
    surfaceQualifier: string;
    edgeQualifier: string;
};

type FootpathData = Omit<FootpathElement,
    "object" |
    "surfaceObject" |
    "railingsObject" |
    "addition"
    > & ({
        qualifier: string;
        surfaceQualifier: null;
        railingsQualifier: null;
        additionQualifier: string | null;
    } | {
        qualifier: null;
        surfaceQualifier: string;
        railingsQualifier: string;
        additionQualifier: string | null;
    } | {
        qualifier: null;
        surfaceQualifier: null;
        railingsQualifier: null;
        additionQualifier: string;
    });

type TrackData = TrackElement;

type SmallSceneryData = Omit<SmallSceneryElement, "object"> & {
    qualifier: string;
};

type WallData = Omit<WallElement, "object"> & {
    qualifier: string;
};

type EntranceData = EntranceElement;

type LargeSceneryData = Omit<LargeSceneryElement, "object"> & {
    qualifier: string;
};

type BannerData = BannerElement;

type ElementData =
    SurfaceData |
    FootpathData |
    TrackData |
    SmallSceneryData |
    WallData |
    EntranceData |
    LargeSceneryData |
    BannerData;

/*
 * TEMPLATE DATA
 */

interface TileData {
    readonly x: number;
    readonly y: number;
    readonly elements: ElementData[];
}

interface TemplateData {
    tiles: TileData[];
    mapRange: MapRange;
}

/*
 * SCATTER
 */

interface ScatterData {
    readonly element: SmallSceneryData | LargeSceneryData;
    readonly weight: number;
}

type ScatterPattern = ScatterData[];

/*
 * OBJECT INDEX
 */

type IndexedObject = {
    readonly type: ObjectType;
    readonly index: number;
    readonly qualifier: string;
    readonly name: string;
}

type SceneryObjectType =
    "footpath" |
    "footpath_surface" |
    "footpath_railings" |
    "footpath_addition" |
    "small_scenery" |
    "large_scenery" |
    "wall";

type SceneryObject = IndexedObject & {
    readonly type: SceneryObjectType;
    onMap: number;
    inPark: number;
};
