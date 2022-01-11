/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Storage from "../persistence/Storage";

import BooleanProperty from "./BooleanProperty";
import NumberProperty from "./NumberProperty";
import Property from "./Property";

type C = {
    [index: string]: C;
} | Property<any>;

const Configuration = {
    tools: {
        cursorMode: new Property<CursorMode>("surface"),
        placeMode: new Property<PlaceMode>("safe"),
        showGhost: new BooleanProperty(true),
        onMissingElement: new Property<Action>("warning"),
    },
    paste: {
        cursorHeight: {
            enabled: new BooleanProperty(false),
            smallSteps: new BooleanProperty(false),
        },
        cursorRotation: {
            enabled: new BooleanProperty(false),
            flip: new BooleanProperty(false),
            sensitivity: new NumberProperty(4, 0, 10),
        },
        appendToEnd: new BooleanProperty(false),
        mergeSurface: new BooleanProperty(false),
    },
    selector: {
        keepOnExit: new BooleanProperty(false),
        showWindow: new BooleanProperty(false),
    },
    brush: {
        size: new NumberProperty(15, 1),
        shape: new Property<BrushShape>("circle"),
        dragToPlace: new BooleanProperty(false),
        showWindow: new BooleanProperty(true),
    },
    scatter: {
        randomiseRotation: new BooleanProperty(true),
        randomiseQuadrant: new BooleanProperty(true),
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
