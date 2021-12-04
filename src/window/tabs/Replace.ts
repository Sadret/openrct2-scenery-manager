/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../../core/MapIO";

import BooleanProperty from "../../config/BooleanProperty";
import GUI from "../../gui/GUI";
import Property from "../../config/Property";
import SceneryFilterGroup from "../widgets/SceneryFilterGroup";
import Selector from "../../tools/Selector";

const findGroup = new SceneryFilterGroup("Find");
const replaceGroup = new SceneryFilterGroup("Replace with", true);
findGroup.type.bind(type => replaceGroup.type.setValue(type));

export function setElement(info: SceneryObjectInfo): void {
    switch (info.type) {
        case "footpath":
        case "footpath_surface":
        case "footpath_railings":
        case "footpath_addition":
            ui.showError("Not implemented yet...", "(Footpath)");
            break;
        default:
            findGroup.type.setValue(info.type);
            findGroup.identifier.setValue(info.identifier);
            break;
    }
}

const selectionOnlyProp = new BooleanProperty(false);

function eqIfDef<T>(a: T | undefined, b: T | undefined) {
    return a === undefined || b === undefined || a === b;
}

function replaceValue<T>(value: T, property: Property<T | undefined>): T {
    const propValue = property.getValue();
    return propValue === undefined ? value : propValue;
}

function findAndDelete(replace: boolean) {
    MapIO.forEachElement(
        element => {
            if (element.type !== findGroup.type.getValue())
                return;
            switch (element.type) {
                case "wall":
                    if (!eqIfDef(element.tertiaryColour, findGroup.tertiaryColour.getValue()))
                        return;
                case "small_scenery":
                case "large_scenery":
                    if (!eqIfDef(element.identifier, findGroup.identifier.getValue()))
                        return;
                    if (!eqIfDef(element.primaryColour, findGroup.primaryColour.getValue()))
                        return;
                    if (!eqIfDef(element.secondaryColour, findGroup.secondaryColour.getValue()))
                        return;
                    const callback = replace ? ((removed: boolean) => {
                        if (removed)
                            MapIO.place([{
                                ...element,
                                identifier: replaceValue(element.identifier, replaceGroup.identifier),
                                primaryColour: replaceValue(element.primaryColour, replaceGroup.primaryColour),
                                secondaryColour: replaceValue(element.secondaryColour, replaceGroup.secondaryColour),
                            }]);
                    }) : undefined;
                    return MapIO.removeElement(element, false, callback);
                case "footpath":
                    return ui.showError("TODO", "footpath");
            }
        },
        selectionOnlyProp.getValue() ? (ui.tileSelection.range || ui.tileSelection.tiles) : undefined,
    );
}

export default new GUI.Tab({
    frameBase: 5205,
    frameCount: 16,
    frameDuration: 4,
}, undefined, undefined, 384).add(
    findGroup,
    new GUI.HBox(
        [1, 1, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.Space(),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Find and Delete",
            onClick: () => findAndDelete(false),
        }),
    ),
    replaceGroup,
    new GUI.HBox(
        [1, 1, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.Space(),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Find and Replace",
            onClick: () => findAndDelete(true),
        }),
    ),
    new GUI.HBox(
        [1, 1, 1],
    ).add(
        new GUI.Checkbox({
            text: "Selected area only",
        }).bindValue(selectionOnlyProp),
        new GUI.TextButton({
            text: "Select area",
            onClick: Selector.activate,
        }),
    ),
);
