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
 * OBJECT INDEX
 */

interface IObjectIndex<T extends LoadedObject> {
    readonly type: ObjectType;
    get(identifier: string): T | null;
    getAll(): T[];
}

type SceneryObjectType =
    "footpath" |
    "footpath_surface" |
    "footpath_railings" |
    "footpath_addition" |
    "small_scenery" |
    "large_scenery" |
    "wall";

type SceneryObject = LoadedObject & {
    readonly type: SceneryObjectType;
    onMap: number;
    inPark: number;
};

type SceneryIndex = {
    [key in SceneryObjectType]: IObjectIndex<SceneryObject>;
};
