/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
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

export function setElement(object: SceneryObject): void {
    switch (object.type) {
        case "footpath":
        case "footpath_surface":
            findGroup.type.setValue("footpath");
            findGroup.identifier.setValue(object.identifier);
            break;
        case "footpath_railings":
            findGroup.type.setValue("footpath");
            findGroup.railings.setValue(object.identifier);
            break;
        case "footpath_addition":
            findGroup.type.setValue("footpath");
            findGroup.addition.setValue(object.identifier);
            break;
        default:
            findGroup.type.setValue(object.type);
            findGroup.identifier.setValue(object.identifier);
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

function findAndDelete(replace: boolean): void {
    // TODO: Replace
    // MapIO.forEachElement(
    //     element => {
    //         if (element.type !== findGroup.type.getValue())
    //             return;
    // switch (element.type) {
    //     case "footpath":
    //         if (!eqIfDef(element.surfaceIdentifier, findGroup.identifier.getValue()))
    //             return;
    //         if (!eqIfDef(element.railingsIdentifier, findGroup.railings.getValue()))
    //             return;
    //         const callbackFp = replace ? ((removed: boolean) => {
    //             if (removed)
    //                 MapIO.place([{
    //                     ...element,
    //                     surfaceIdentifier: replaceValue(element.surfaceIdentifier, replaceGroup.identifier),
    //                     railingsIdentifier: replaceValue(element.railingsIdentifier, replaceGroup.railings),
    //                 }]);
    //         }) : undefined;
    //         return MapIO.removeElement(element, false, callbackFp);
    //     case "wall":
    //         if (!eqIfDef(element.tertiaryColour, findGroup.tertiaryColour.getValue()))
    //             return;
    //     case "small_scenery":
    //     case "large_scenery":
    //         if (!eqIfDef(element.identifier, findGroup.identifier.getValue()))
    //             return;
    //         if (!eqIfDef(element.primaryColour, findGroup.primaryColour.getValue()))
    //             return;
    //         if (!eqIfDef(element.secondaryColour, findGroup.secondaryColour.getValue()))
    //             return;
    //         const callback = replace ? ((removed: boolean) => {
    //             if (removed)
    //                 MapIO.place([{
    //                     ...element,
    //                     identifier: replaceValue(element.identifier, replaceGroup.identifier),
    //                     primaryColour: replaceValue(element.primaryColour, replaceGroup.primaryColour),
    //                     secondaryColour: replaceValue(element.secondaryColour, replaceGroup.secondaryColour),
    //                     ...element.type === "wall" ? {
    //                         tertiaryColour: replaceValue(element.tertiaryColour, replaceGroup.tertiaryColour),
    //                     } : {},
    //                 }]);
    //         }) : undefined;
    //         return MapIO.removeElement(element, false, callback);
    // }
    //     },
    //     selectionOnlyProp.getValue() ? MapIO.getTileSelection() : undefined,
    // );
}

export default new GUI.Tab({
    image: {
        frameBase: 5205,
        frameCount: 16,
        frameDuration: 4,
    },
}).add(
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
