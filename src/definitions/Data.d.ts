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
    surfaceIdentifier: string;
    edgeIdentifier: string;
};

type FootpathData = Omit<FootpathElement,
    "object" |
    "surfaceObject" |
    "railingsObject" |
    "addition"
    > & ({
        identifier: string;
        surfaceIdentifier: null;
        railingsIdentifier: null;
        additionIdentifier: string | null;
    } | {
        identifier: null;
        surfaceIdentifier: string;
        railingsIdentifier: string;
        additionIdentifier: string | null;
    } | {
        identifier: null;
        surfaceIdentifier: null;
        railingsIdentifier: null;
        additionIdentifier: string;
    });

type TrackData = TrackElement;

type SmallSceneryData = Omit<SmallSceneryElement, "object"> & {
    identifier: string;
};

type WallData = Omit<WallElement, "object"> & {
    identifier: string;
};

type EntranceData = EntranceElement;

type LargeSceneryData = Omit<LargeSceneryElement, "object"> & {
    identifier: string;
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

type ScatterElement = SmallSceneryData | LargeSceneryData;

interface ScatterData {
    readonly element: ScatterElement;
    readonly weight: number;
}

type ScatterPattern = ScatterData[];

/*
 * SCENERY OBJECTS
 */

type SceneryObjectType =
    "footpath" |
    "footpath_surface" |
    "footpath_railings" |
    "footpath_addition" |
    "small_scenery" |
    "large_scenery" |
    "wall";

interface SceneryObjectInfo {
    readonly type: SceneryObjectType;
    readonly name: string;
    readonly identifier: string;
    onMap: number;
    inPark: number;
};

interface SceneryObjectIndex {
    readonly footpath: { [key: string]: SceneryObjectInfo };
    readonly footpath_surface: { [key: string]: SceneryObjectInfo };
    readonly footpath_railings: { [key: string]: SceneryObjectInfo };
    readonly footpath_addition: { [key: string]: SceneryObjectInfo };
    readonly small_scenery: { [key: string]: SceneryObjectInfo };
    readonly large_scenery: { [key: string]: SceneryObjectInfo };
    readonly wall: { [key: string]: SceneryObjectInfo };
}
