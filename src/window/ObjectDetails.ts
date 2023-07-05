/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Replace from "./tabs/Replace";
import * as Strings from "../utils/Strings";

import BooleanProperty from "../config/BooleanProperty";
import GUI from "../gui/GUI";
import Jumper from "../utils/Jumper";
import MainWindow from "./MainWindow";
import ObjectIndex from "../core/ObjectIndex";

function match(element: TileElement, object: SceneryObject): boolean {
    switch (object.type) {
        case "wall":
        case "small_scenery":
        case "large_scenery":
        case "footpath":
            return element.type === object.type && ObjectIndex.getQualifier(object.type, element.object) === object.qualifier;
        case "footpath_surface":
            return element.type === "footpath" && ObjectIndex.getQualifier(object.type, element.surfaceObject) === object.qualifier;
        case "footpath_railings":
            return element.type === "footpath" && ObjectIndex.getQualifier(object.type, element.railingsObject) === object.qualifier;
        case "footpath_addition":
            return element.type === "footpath" && ObjectIndex.getQualifier(object.type, element.addition) === object.qualifier;
    }
}

export default class extends GUI.WindowManager {
    public constructor(
        object: SceneryObject,
    ) {
        super(
            {
                width: 384,
                classification: "scenery-manager.object_details",
                title: "Object Details",
                colours: [7, 7, 6],
            }, new GUI.Window().add(
                new GUI.HBox([1, 3]).add(
                    new GUI.Label({
                        text: "Type:",
                    }),
                    new GUI.Label({
                        text: Strings.toDisplayString(object.type),
                    }),
                ),
                new GUI.HBox([1, 3]).add(
                    new GUI.Label({
                        text: "Name:",
                    }),
                    new GUI.Label({
                        text: object.name,
                    }),
                ),
                new GUI.HBox([1, 3]).add(
                    new GUI.Label({
                        text: "Identifier:",
                    }),
                    new GUI.Label({
                        text: object.qualifier,
                    }),
                ),
                new GUI.Space(4),
                new GUI.HBox([2, 1, 1]).add(
                    new GUI.Label({
                        text: "Go to:  delete / replace all",
                    }),
                    new GUI.TextButton({
                        text: "On map",
                        onClick: () => this.find(object, false),
                    }),
                    new GUI.TextButton({
                        text: "In park",
                        onClick: () => this.find(object, true),
                    }),
                ),
                new GUI.Space(4),
                (() => {
                    const inParkOnlyProp = new BooleanProperty(false);
                    const button = new GUI.TextButton({
                        text: "Jump",
                    });

                    new Jumper(
                        element => match(element, object),
                        inParkOnlyProp,
                        button,
                    );

                    return new GUI.HBox([2, 1, 1]).add(
                        new GUI.Label({
                            text: "Jump to next instance:",
                        }),
                        button,
                        new GUI.Checkbox({
                            text: "In park only",
                        }).bindValue(
                            inParkOnlyProp,
                        ),
                    );
                })(),
            ),
        );
    }

    private find(object: SceneryObject, inPark: boolean): void {
        this.close();
        MainWindow.setActiveTab(Replace.default);
        Replace.find(object, inPark);
    }
};
