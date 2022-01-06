/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "./MapIO";

import ObjectIndex from "./ObjectIndex";

function toSceneryObject(object: IndexedObject): SceneryObject {
    const element = object as SceneryObject;
    element.onMap = 0;
    element.inPark = 0;
    return element;
}

class SceneryObjectIndex extends ObjectIndex<SceneryObject>{
    constructor(type: SceneryObjectType) {
        super(type, toSceneryObject);
    }

    public increment(qualifier: string | null, tile: Tile) {
        if (qualifier !== null) {
            const object = this.get(qualifier);
            if (object !== null) {
                object.onMap++;
                if (MapIO.hasOwnership(tile))
                    object.inPark++;
            }
        }
    }
}

export default class SceneryIndex {
    private readonly data = {} as { [key in SceneryObjectType]: SceneryObjectIndex };

    constructor(
        callback: (done: boolean, progress: number, index: SceneryIndex) => void,
        selection: MapRange | CoordsXY[] | undefined = undefined,
    ) {
        SceneryIndex.types.forEach(type => this.data[type] = new SceneryObjectIndex(type));

        // make sure this method returns before the callback is called
        context.setTimeout(() =>
            MapIO.forEachElement((tile, element) => {
                switch (element.type) {
                    case "footpath":
                        if (element.object !== null)
                            this.data["footpath"].increment(ObjectIndex.getQualifier(
                                "footpath",
                                element.object,
                            ), tile);
                        else {
                            this.data["footpath_surface"].increment(ObjectIndex.getQualifier(
                                "footpath_surface",
                                <number>element.surfaceObject,
                            ), tile);
                            this.data["footpath_railings"].increment(ObjectIndex.getQualifier(
                                "footpath_railings",
                                <number>element.railingsObject,
                            ), tile);
                        }
                        return;
                    case "small_scenery":
                    case "wall":
                    case "large_scenery":
                        this.data[element.type].increment(ObjectIndex.getQualifier(
                            element.type,
                            element.object,
                        ), tile);
                        return;
                }
            }, selection, (done, progress) => callback(done, progress, this)),
            1,
        );
    }

    public getAllObjects(type: SceneryObjectType): SceneryObject[] {
        return this.data[type].getAll();
    }

    public static readonly types: SceneryObjectType[] = [
        "footpath",
        "footpath_surface",
        "footpath_railings",
        "footpath_addition",
        "small_scenery",
        "large_scenery",
        "wall",
    ];
}
