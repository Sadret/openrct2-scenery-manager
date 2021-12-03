/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";
import * as MapIO from "../core/MapIO";

export const types: SceneryObjectType[] = [
    "footpath",
    "footpath_surface",
    "footpath_railings",
    "footpath_addition",
    "small_scenery",
    "large_scenery",
    "wall",
];

export function getSceneryObjectIndex(
    callback: (done: boolean, progress: number) => void,
    selection: MapRange | CoordsXY[] | undefined = undefined,
): SceneryObjectIndex {
    const index = {
        footpath: {} as { [key: string]: SceneryObjectInfo },
        footpath_surface: {} as { [key: string]: SceneryObjectInfo },
        footpath_railings: {} as { [key: string]: SceneryObjectInfo },
        footpath_addition: {} as { [key: string]: SceneryObjectInfo },
        small_scenery: {} as { [key: string]: SceneryObjectInfo },
        large_scenery: {} as { [key: string]: SceneryObjectInfo },
        wall: {} as { [key: string]: SceneryObjectInfo },
    };
    types.forEach(type => {
        context.getAllObjects(type).forEach(
            object => index[type][Context.getIdentifierFromObject(object)] = {
                type: type,
                name: object.name,
                identifier: Context.getIdentifierFromObject(object),
                onMap: 0,
                inPark: 0,
            }
        );
    });

    // make sure this method returns before the callback is called
    context.setTimeout(() =>
        MapIO.forEachElement((element, tile) => {
            switch (element.type) {
                case "footpath_addition":
                case "large_scenery":
                case "small_scenery":
                case "wall":
                    index[element.type][element.identifier].onMap++;
                    if (MapIO.hasOwnership(tile))
                        index[element.type][element.identifier].inPark++;
                    return;
                case "footpath":
                    const isLegacy = element.railingsIdentifier === null;
                    if (isLegacy) {
                        index["footpath"][element.surfaceIdentifier].onMap++;
                        if (MapIO.hasOwnership(tile))
                            index["footpath"][element.surfaceIdentifier].inPark++;
                    } else {
                        index["footpath_surface"][element.surfaceIdentifier].onMap++;
                        index["footpath_railings"][element.railingsIdentifier].onMap++;
                        if (MapIO.hasOwnership(tile)) {
                            index["footpath_surface"][element.surfaceIdentifier].inPark++;
                            index["footpath_railings"][element.railingsIdentifier].inPark++;
                        }
                    }
                    return;
            }
        }, selection, callback),
        1,
    );

    return index;
}
