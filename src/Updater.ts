/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./definitions/Data.d.ts" />

import * as Storage from "./persistence/Storage";
import * as Coordinates from "./utils/Coordinates";
import * as UiUtils from "./utils/UiUtils";
import { File } from "./persistence/File";
import Template from "./template/Template";

export function update(load: () => void): void {
    switch (Storage.get<String>("version")) {
        case undefined:
            UiUtils.showAlert("Welcome to Scenery Manager!", [
                "Thank you for using Scenery Manager!",
                "",
                "You can access the plug-in via the map menu in the upper toolbar.",
                "",
                "Your scenery templates will be stored in the plugin.store.json",
                "file in your OpenRCT2 user directory.",
                "Keep in mind that:",
                "- Your data will be irrecoverably lost if that file gets deleted.",
                "- Any other plug-in could overwrite that file.",
                "",
                "I hope you enjoy this plug-in!",
            ]);
            init();
            return load();

        case "1.0.0":
        case "1.0.1":
        case "1.1.0":
        case "1.1.1":
            return UiUtils.showConfirm("Welcome to Scenery Manager!", [
                "Your clipboard and library contain templates",
                "from a previous version of Scenery Manager.",
                "",
                "To continue, you need to update the save file.",
                "",
                "This cannot be undone and will not work with",
                "previous versions of the plug-in.",
            ], (confirmed: boolean) => {
                if (!confirmed)
                    return;
                switch (Storage.get<String>("version")) {
                    case "1.0.0":
                        update_100_101();
                    case "1.0.1":
                        update_101_110();
                    case "1.1.0":
                        update_110_111();
                    case "1.1.1":
                        update_111_120();
                }
                init();
                load();
            }, "Continue", "Cancel");

        case "1.2.0":
        case "1.2.1":
            init();
        case "1.2.2":
            return load();

        default:
            return UiUtils.showConfirm("Welcome to Scenery Manager!", [
                "Your clipboard and library contain templates",
                "from an unknown version of this plug-in.",
                "",
                "Did you downgrade from a newer version?",
                "",
                "You can continue, but it may permanently",
                "break your saved templates.",
            ], (confirmed: boolean) => {
                if (confirmed)
                    load();
            }, "Continue", "Cancel");
    }
}

function update_100_101(): void { }

function update_101_110(): void {
    interface TemplateData_101 {
        readonly data: ElementData[],
        readonly size: CoordsXY,
        readonly surfaceHeight: number,
    }

    interface TemplateData_110 {
        readonly elements: ElementData[],
        readonly size: CoordsXY,
        readonly surfaceHeight: number,
    }

    function recurse(file: File): void {
        if (file.isFile()) {
            const template: TemplateData_101 = file.getContent<TemplateData_101>();
            file.setContent<TemplateData_110>({
                elements: template.data,
                size: template.size,
                surfaceHeight: template.surfaceHeight,
            });
        } else {
            file.getFiles().forEach((child: File) => recurse(child));
        }
    }

    recurse(Storage.libraries.templates.getRoot());
    recurse(Storage.libraries.scatterPattern.getRoot());
}

function update_110_111(): void { }

function update_111_120(): void {
    interface TemplateData_110 {
        readonly elements: ElementData[],
        readonly size: CoordsXY,
        readonly surfaceHeight: number,
    }

    interface TemplateData_120 {
        readonly elements: ElementData[],
        readonly tiles: CoordsXY[],
    }

    function recurse(file: File): void {
        if (file.isFile()) {
            const template110: TemplateData_110 = file.getContent<TemplateData_110>();

            const tiles = Coordinates.toTiles(Coordinates.span({ x: 0, y: 0 }, template110.size));
            const center: CoordsXY = Coordinates.center(tiles);
            const template120: TemplateData_120 = new Template({
                elements: template110.elements.map(
                    (element: ElementData) => {
                        if (element.type !== "footpath")
                            return element;
                        const slope: number = (<any>element).slope;
                        return <FootpathData><any>{
                            ...element,
                            slope: undefined,
                            slopeDirection: (slope & 0x4) ? slope & 0x3 : null,
                        }
                    }
                ),
                tiles: tiles,
            }).translate({
                x: -center.x,
                y: -center.y,
                z: -template110.surfaceHeight * 8,
            });

            file.setContent<TemplateData_120>({
                elements: template120.elements,
                tiles: template120.tiles,
            });
        } else {
            file.getFiles().forEach((child: File) => recurse(child));
        }
    }

    recurse(Storage.libraries.templates.getRoot());
    recurse(Storage.libraries.scatterPattern.getRoot());
}

function init(): void {
    // version
    Storage.set<string>("version", "1.2.2");

    // config
    Storage.set<object>("config", {
        "scatter": {
            "randomise": {
                "rotation": true,
                "quadrant": true,
            },
            "library": {
                "show": true,
                "confirm": {
                    "overwrite": true,
                    "delete": true,
                },
                "onMissingElement": "error",
            },
            "dragToPlace": false,
        },
        "brush": {
            "shape": "circle",
            "size": 15,
        },
        "copyPaste": {
            "onMissingElement": "error",
            "cursor": {
                "height": {
                    "enabled": false,
                    "smallSteps": false,
                    "enable": false,
                },
                "rotation": {
                    "enabled": false,
                    "flip": false,
                    "sensitivity": 6,
                },
            },
        },
    });
}
