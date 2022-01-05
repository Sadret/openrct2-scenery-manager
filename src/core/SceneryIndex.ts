/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "./MapIO";

import ObjectIndex from "./ObjectIndex";

export const types: SceneryObjectType[] = [
    "footpath",
    "footpath_surface",
    "footpath_railings",
    "footpath_addition",
    "small_scenery",
    "large_scenery",
    "wall",
];

function toSceneryObject(object: LoadedObject): SceneryObject {
    const element = object as SceneryObject;
    element.onMap = 0;
    element.inPark = 0;
    return element;
}

export function getSceneryIndex(
    callback: (done: boolean, progress: number) => void,
    selection: MapRange | CoordsXY[] | undefined = undefined,
): SceneryIndex {
    const index = {} as SceneryIndex;
    types.forEach(type => index[type] = new ObjectIndex(type, toSceneryObject));

    function increment(type: SceneryObjectType, identifier: string, tile: Tile) {
        const object = index[type].get(identifier);
        if (object !== null) {
            object.onMap++;
            if (MapIO.hasOwnership(tile))
                object.inPark++;
        }
    }

    // make sure this method returns before the callback is called
    context.setTimeout(() =>
        MapIO.forEachElement((tile, element) => {
            switch (element.type) {
                case "footpath":
                    if (element.object !== null)
                        increment("footpath", ObjectIndex.getIdentifier(
                            "footpath",
                            element.object,
                        ), tile);
                    else {
                        increment("footpath_surface", ObjectIndex.getIdentifier(
                            "footpath_surface",
                            <number>element.surfaceObject,
                        ), tile);
                        increment("footpath_railings", ObjectIndex.getIdentifier(
                            "footpath_railings",
                            <number>element.railingsObject,
                        ), tile);
                    }
                    return;
                case "small_scenery":
                case "wall":
                case "large_scenery":
                    increment(element.type, ObjectIndex.getIdentifier(
                        element.type,
                        element.object,
                    ), tile);
                    return;
            }
        }, selection, callback),
        1,
    );

    return index;
}
