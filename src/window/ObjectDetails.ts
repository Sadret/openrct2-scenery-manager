/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Replace from "./tabs/Replace";
import * as Strings from "../utils/Strings";

import GUI from "../gui/GUI";
import MainWindow from "./MainWindow";

export default class extends GUI.WindowManager {
    public constructor(
        object: SceneryObject,
    ) {
        super(
            {
                width: 384,
                height: 0,
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
                new GUI.HBox([1, 0.5, 2.5]).add(
                    new GUI.Label({
                        text: "On Map:",
                    }),
                    new GUI.Label({
                        text: String(object.onMap),
                    }),
                    new GUI.TextButton({
                        text: "Go to:  delete / replace all (on map)",
                        onClick: () => this.find(object, false),
                    }),
                ),
                new GUI.HBox([1, 0.5, 2.5]).add(
                    new GUI.Label({
                        text: "In Park:",
                    }),
                    new GUI.Label({
                        text: String(object.inPark),
                    }),
                    new GUI.TextButton({
                        text: "Go to:  delete / replace all (in park)",
                        onClick: () => this.find(object, true),
                    }),
                ),
            ),
        );
    }

    private find(object: SceneryObject, inPark: boolean): void {
        this.getWindow() ?.close();
        MainWindow.setActiveTab(Replace.default);
        Replace.find(object, inPark);
    }
}
