/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
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
        MapIO.forEachElement((tile, element) => {
            switch (element.type) {
                case "footpath":
                    if (element.object !== null) {
                        const footpathIdentifier = Context.getIdentifier(
                            "footpath",
                            element.object,
                        );
                        index["footpath"][footpathIdentifier].onMap++;
                        if (MapIO.hasOwnership(tile))
                            index["footpath"][footpathIdentifier].inPark++;
                    } else {
                        const surfaceIdentifier = Context.getIdentifier(
                            "footpath_surface",
                            <number>element.surfaceObject,
                        );
                        const railingsIdentifier = Context.getIdentifier(
                            "footpath_railings",
                            <number>element.railingsObject,
                        );
                        index["footpath_surface"][surfaceIdentifier].onMap++;
                        index["footpath_railings"][railingsIdentifier].onMap++;
                        if (MapIO.hasOwnership(tile)) {
                            index["footpath_surface"][surfaceIdentifier].inPark++;
                            index["footpath_railings"][railingsIdentifier].inPark++;
                        }
                    }
                    return;

                case "small_scenery":
                case "wall":
                case "large_scenery":
                    const identifier = Context.getIdentifier(
                        element.type,
                        element.object,
                    );
                    index[element.type][identifier].onMap++;
                    if (MapIO.hasOwnership(tile))
                        index[element.type][identifier].inPark++;
                    return;
            }
        }, selection, callback),
        1,
    );

    return index;
}
