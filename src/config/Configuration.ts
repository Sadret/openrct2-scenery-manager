/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { Property, BooleanProperty, NumberProperty } from "./Property";
import * as Storage from "../persistence/Storage";

type Action = "error" | "warning" | "ignore";
type BrushShape = "square" | "circle";

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
        size: new NumberProperty(15),
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

export function load(obj: object = Configuration, path: string = "config") {
    if (isObjLiteral(obj))
        for (let key in obj)
            load(obj[key], path + "." + key);
    else {
        if (Storage.has(path))
            (<Property<any>>obj).setValue(Storage.get<any>(path));
        (<Property<any>>obj).addListener(value => Storage.set<any>(path, value));
    }
}

function isObjLiteral(_obj: Object) {
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
