/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../core/MapIO";
import * as MapIterator from "../utils/MapIterator";
import * as Replace from "./tabs/Replace";
import * as Strings from "../utils/Strings";

import GUI from "../gui/GUI";
import MainWindow from "./MainWindow";

function jump(object: SceneryObject, inParkOnly: boolean): Task {
    function match(element: TileElement, object: SceneryObject): boolean {
        switch (object.type) {
            case "wall":
            case "small_scenery":
            case "large_scenery":
            case "footpath":
                return element.type === object.type && element.object === object.index;
            case "footpath_surface":
                return element.type === "footpath" && element.surfaceObject === object.index;
            case "footpath_railings":
                return element.type === "footpath" && element.railingsObject === object.index;
            case "footpath_addition":
                return element.type === "footpath" && element.addition === object.index;
        }
    }
    let coordsGenerator = MapIterator.coords(undefined);

    return () => {
        while (true) {
            const result = coordsGenerator.next();
            if (result.done) {
                coordsGenerator = MapIterator.coords(undefined);
                return ui.showError("Cannot proceed further...", "Reached end of map!");
            }
            const coords = result.value.coords;
            const tile = MapIO.getTile(coords);
            if (inParkOnly && !MapIO.hasOwnership(tile))
                continue;
            for (let element of tile.elements)
                if (match(element, object)) {
                    ui.mainViewport.scrollTo({
                        x: tile.x * 32,
                        y: tile.y * 32,
                        z: element.baseZ,
                    });
                    return;
                }
        }
    };
}

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
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Jump to next instance (on map)",
                        onClick: jump(object, false),
                    }),
                    new GUI.TextButton({
                        text: "Jump to next instance (in park)",
                        onClick: jump(object, true),
                    }),
                ),
            ),
        );
    }

    private find(object: SceneryObject, inPark: boolean): void {
        this.close();
        MainWindow.setActiveTab(Replace.default);
        Replace.find(object, inPark);
    }
}
