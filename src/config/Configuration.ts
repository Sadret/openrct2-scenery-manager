/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { Property, BooleanProperty, NumberProperty } from "./Property";
import * as Storage from "../persistence/Storage";

type C = {
    [index: string]: C;
} | Property<any>;

const Configuration = {
    scatter: {
        randomise: {
            rotation: new BooleanProperty(true),
            quadrant: new BooleanProperty(true),
        },
        library: {
            show: new BooleanProperty(true),
            confirm: {
                overwrite: new BooleanProperty(true),
                delete: new BooleanProperty(true),
            },
            onMissingElement: new Property<Action>("error"),
        },
        dragToPlace: new BooleanProperty(false),
    },
    brush: {
        shape: new Property<BrushShape>("circle"),
        size: new NumberProperty(15, 1),
    },
    copyPaste: {
        onMissingElement: new Property<Action>("error"),
        cursor: {
            height: {
                enabled: new BooleanProperty(false),
                smallSteps: new BooleanProperty(false),
                enable: new BooleanProperty(false),
            },
            rotation: {
                enabled: new BooleanProperty(false),
                flip: new BooleanProperty(false),
                sensitivity: new NumberProperty(6),
            },
        },
    },
}
export default Configuration;

export function load(obj: C = Configuration, path: string = "config"): void {
    if (isProperty(obj)) {
        if (Storage.has(path))
            obj.setValue(Storage.get<any>(path));
        obj.bind(value => Storage.set<any>(path, value));
    } else
        for (let key in obj)
            load(obj[key], path + "." + key);
}

function isProperty(obj: C): obj is Property<any> {
    return !isObjLiteral(obj);
}

function isObjLiteral(_obj: object) {
    var _test = _obj;
    return (typeof _obj !== 'object' || _obj === null ?
        false :
        (
            (function() {
                while (!false) {
                    if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
                        break;
                    }
                }
                return Object.getPrototypeOf(_obj) === _test;
            })()
        )
    );
}
