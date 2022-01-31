/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Dialogs from "../../utils/Dialogs";
import * as MapIO from "../../core/MapIO";
import * as MapIter from "../../utils/MapIterator";
import * as Selector from "../../tools/Selector";
import * as Strings from "../../utils/Strings";

import BooleanProperty from "../../config/BooleanProperty";
import Configuration from "../../config/Configuration";
import GUI from "../../gui/GUI";
import Loading from "../widgets/Loading";
import MapIterator from "../../utils/MapIterator";
import OverlayTab from "../widgets/OverlayTab";
import SceneryFilterGroup from "../widgets/SceneryFilterGroup";
import Template from "../../template/Template";

const findGroup = new SceneryFilterGroup();
const replaceGroup = new SceneryFilterGroup(findGroup);
findGroup.type.bind(type => replaceGroup.type.setValue(type));

const selectionOnlyProp = new BooleanProperty(false);
const inParkOnlyProp = new BooleanProperty(false);

function getTileSelection(): Selection {
    return selectionOnlyProp.getValue() ? MapIO.getTileSelection() : undefined;
}

export function find(object: SceneryObject, inParkOnly: boolean): void {
    switch (object.type) {
        case "footpath_surface":
            findGroup.type.setValue("footpath");
            findGroup.surface.setValue(object);
            break;
        case "footpath_railings":
            findGroup.type.setValue("footpath");
            findGroup.railings.setValue(object);
            break;
        case "footpath_addition":
            findGroup.type.setValue("footpath");
            findGroup.addition.setValue(object);
            break;
        default:
            findGroup.type.setValue(object.type);
            findGroup.qualifier.setValue(object);
    }
    inParkOnlyProp.setValue(inParkOnly);
}

function findAndDelete(replace: boolean): void {
    loading.setIsVisible(true);
    const mode = Configuration.tools.placeMode.getValue();
    const inParkOnly = inParkOnlyProp.getValue();
    let count = 0;
    new MapIterator(
        getTileSelection()
    ).forEach(
        coords => {
            const tile = MapIO.getTile(coords);
            if (inParkOnly && !MapIO.hasOwnership(tile))
                return;
            if (mode === "raw" && replace)
                tile.elements.forEach(
                    element => {
                        if (findGroup.match(element)) {
                            count++;
                            replaceGroup.replace(element);
                        }
                    },
                );
            else {
                const elements = MapIO.read(tile);
                elements.forEach(
                    element => {
                        if (findGroup.match(element)) {
                            const callback = (result: GameActionResult) => {
                                if (result.error)
                                    return;
                                count++;
                                if (!replace)
                                    return;
                                // safe only
                                replaceGroup.replace(element);
                                MapIO.place([{
                                    ...coords,
                                    elements: [Template.copyFrom(element)],
                                }], "safe", element.isGhost);
                            };
                            MapIO.remove(tile, element, mode, undefined, callback);
                        }
                    }
                );
            }
        },
        true,
        (done, progress) => {
            loading.setProgress(progress);
            if (done) {
                loading.setIsVisible(false);
                loading.setProgress(undefined);
                Dialogs.showAlert({
                    title: "Elements replaced",
                    message: [`${replace ? "Replaced" : "Deleted"} ${count} elements.`],
                    width: 192,
                })
            }
        },
    );
}

function swapValues(): void {
    // const type = replaceGroup.type.getValue();
    // replaceGroup.type.setValue(findGroup.type.getValue());
    // findGroup.type.setValue(type);

    const qualifier = replaceGroup.qualifier.getValue();
    replaceGroup.qualifier.setValue(findGroup.qualifier.getValue());
    findGroup.qualifier.setValue(qualifier);

    const primaryColour = replaceGroup.primaryColour.getValue();
    replaceGroup.primaryColour.setValue(findGroup.primaryColour.getValue());
    findGroup.primaryColour.setValue(primaryColour);

    const secondaryColour = replaceGroup.secondaryColour.getValue();
    replaceGroup.secondaryColour.setValue(findGroup.secondaryColour.getValue());
    findGroup.secondaryColour.setValue(secondaryColour);

    const tertiaryColour = replaceGroup.tertiaryColour.getValue();
    replaceGroup.tertiaryColour.setValue(findGroup.tertiaryColour.getValue());
    findGroup.tertiaryColour.setValue(tertiaryColour);

    const surface = replaceGroup.surface.getValue();
    replaceGroup.surface.setValue(findGroup.surface.getValue());
    findGroup.surface.setValue(surface);

    const railings = replaceGroup.railings.getValue();
    replaceGroup.railings.setValue(findGroup.railings.getValue());
    findGroup.railings.setValue(railings);

    const addition = replaceGroup.addition.getValue();
    replaceGroup.addition.setValue(findGroup.addition.getValue());
    findGroup.addition.setValue(addition);
}

let coordsGenerator = MapIter.coords(undefined);
selectionOnlyProp.bind(_ => coordsGenerator = MapIter.coords(getTileSelection()));

function jump(): void {
    while (true) {
        const result = coordsGenerator.next();
        if (result.done) {
            coordsGenerator = MapIter.coords(getTileSelection());
            return ui.showError("Cannot proceed further...", "Reached end of map!");
        }
        const coords = result.value.coords;
        const tile = MapIO.getTile(coords);
        if (inParkOnlyProp.getValue() && !MapIO.hasOwnership(tile))
            continue;
        for (let element of tile.elements)
            if (findGroup.match(element)) {
                ui.mainViewport.scrollTo({
                    x: tile.x * 32,
                    y: tile.y * 32,
                    z: element.baseZ,
                });
                return;
            }
    }
}

const loading = new Loading(1 << 5);

export default new OverlayTab({
    overlay: loading,
    image: {
        frameBase: 5205,
        frameCount: 16,
        frameDuration: 4,
    },
    onOpen: () => {
        findGroup.reload();
        replaceGroup.reload();
    },
}).add(
    findGroup,
    new GUI.HBox(
        [1.8, 0.2, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.TextButton({
            text: "Jump to next instance",
            onClick: jump,
        }),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Search and Delete",
            onClick: () => findAndDelete(false),
        }),
    ),
    new GUI.Space(),
    replaceGroup,
    new GUI.HBox(
        [1.8, 0.2, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.TextButton({
            text: "Swap search values and replace values",
            onClick: () => swapValues(),
        }),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Search and Replace",
            onClick: () => findAndDelete(true),
        }).bindIsDisabled(
            replaceGroup.error,
        ),
    ),
    new GUI.Space(),
    new GUI.GroupBox({
        text: "Options",
    }).add(
        new GUI.HBox([2.5, 1, 2.5]).add(
            new GUI.Checkbox({
                text: "Selected area only",
            }).bindValue(selectionOnlyProp),
            new GUI.Space(),
            new GUI.Checkbox({
                text: "In park only",
            }).bindValue(inParkOnlyProp),
        ),
        new GUI.HBox([2.5, 1, 1.5, 1]).add(
            new GUI.TextButton({
                text: "Select area",
                onClick: Selector.activate,
            }),
            new GUI.Space(),
            new GUI.Label({
                text: "Place mode:",
            }),
            new GUI.Dropdown({
            }).bindValue<PlaceMode>(
                Configuration.tools.placeMode,
                ["safe", "raw"],
                Strings.toDisplayString,
            ),
        ),
    ),
);
