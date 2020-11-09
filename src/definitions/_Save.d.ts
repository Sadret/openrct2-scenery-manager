/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />

/*
 * SCENERY TYPE
 */

type SceneryType = "footpath" | "small_scenery" | "wall" | "large_scenery" | "banner" | "footpath_addition";

/*
 * SCENERY TEMPLATE
 */

interface SceneryTemplate {
    readonly data: SceneryData[],
    readonly size: CoordsXY,
    readonly surfaceHeight: number,
}

/*
 * SCENERY DATA
 */

interface SceneryData {
    readonly type: SceneryType,
    readonly identifier: string,
    readonly x: number,
    readonly y: number,
    readonly z: number,
}

interface FootpathData extends SceneryData {
    readonly type: "footpath",
    readonly direction: number,
    readonly slope: number,
    readonly isQueue: boolean,
}

interface SmallSceneryData extends SceneryData {
    readonly type: "small_scenery",
    readonly direction: number,
    readonly quadrant: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface WallData extends SceneryData {
    readonly type: "wall",
    readonly direction: number,
    readonly edge: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
    readonly tertiaryColour: number,
}

interface LargeSceneryData extends SceneryData {
    readonly type: "large_scenery",
    readonly direction: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface BannerData extends SceneryData {
    readonly type: "banner",
    readonly direction: number,
    readonly primaryColour: number,
}

interface FootpathAdditionData extends SceneryData {
    readonly type: "footpath_addition",
}
