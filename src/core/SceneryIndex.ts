/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Map from "./Map";

import MapIterator from "../utils/MapIterator";
import ObjectIndex from "./ObjectIndex";

function toSceneryObject(object: IndexedObject): SceneryObject {
    const element = object as SceneryObject;
    element.onMap = 0;
    element.inPark = 0;
    return element;
}

export class SceneryObjectIndex extends ObjectIndex<SceneryObject> {
    constructor(type: SceneryObjectType) {
        super(type, toSceneryObject);
    }

    public increment(qualifier: string | null, tile: Tile, baseHeight: number) {
        if (qualifier !== null) {
            const object = this.get(qualifier);
            if (object !== null) {
                object.onMap++;
                if (Map.isLocationOwned(tile, baseHeight))
                    object.inPark++;
            }
        }
    }
}

export default class SceneryIndex {
    private readonly data = {} as { [key in SceneryObjectType]: SceneryObjectIndex };

    constructor(
        callback: (done: boolean, progress: number, index: SceneryIndex) => void = () => { },
        selection: Selection | null,
    ) {
        SceneryIndex.types.forEach(type => this.data[type] = new SceneryObjectIndex(type));

        if (selection === null)
            callback(true, 1, this);
        else
            new MapIterator(selection).forEach(
                coords => {
                    const tile = Map.getTile(coords);
                    for (let element of tile.elements)
                        switch (element.type) {
                            case "footpath":
                                if (element.object !== null)
                                    this.data["footpath"].increment(ObjectIndex.getQualifier(
                                        "footpath",
                                        element.object,
                                    ), tile, element.baseHeight);
                                else {
                                    this.data["footpath_surface"].increment(ObjectIndex.getQualifier(
                                        "footpath_surface",
                                        <number>element.surfaceObject,
                                    ), tile, element.baseHeight);
                                    this.data["footpath_railings"].increment(ObjectIndex.getQualifier(
                                        "footpath_railings",
                                        <number>element.railingsObject,
                                    ), tile, element.baseHeight);
                                }
                                if (element.addition !== null)
                                    this.data["footpath_addition"].increment(ObjectIndex.getQualifier(
                                        "footpath_addition",
                                        element.addition,
                                    ), tile, element.baseHeight);
                                break;
                            case "small_scenery":
                            case "wall":
                            case "large_scenery":
                                this.data[element.type].increment(ObjectIndex.getQualifier(
                                    element.type,
                                    element.object,
                                ), tile, element.baseHeight);
                                break;
                        }
                },
                true,
                (done, progress) => callback(done, progress, this),
            );
    }

    public getAllObjects(type?: SceneryObjectType): SceneryObject[] {
        if (type === undefined)
            return SceneryIndex.types.map(
                type => this.getAllObjects(type)
            ).reduce(
                (acc, val) => acc.concat(val), [] as SceneryObject[]
            );
        else
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
