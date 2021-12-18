/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * TEMPLATES
 */

interface TileData {
    readonly x: number;
    readonly y: number;
    readonly elements: TileElement[];
}

interface TemplateData {
    tiles: TileData[];
    mapRange: MapRange;
}

/*
 * SAVE
 */

type IndexData = { [key: string]: { [key: number]: string } };

interface IndexedTemplateData {
    template: TemplateData;
    index: IndexData;
}

/*
 * SCATTER
 */

// TODO: unresolved
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
