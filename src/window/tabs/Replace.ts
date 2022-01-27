/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../../core/MapIO";
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
    new MapIterator(
        selectionOnlyProp.getValue() ? MapIO.getTileSelection() : undefined
    ).forEach(
        coords => {
            const tile = MapIO.getTile(coords);
            if (inParkOnly && !MapIO.hasOwnership(tile))
                return;
            if (mode === "raw" && replace)
                tile.elements.forEach(
                    element => findGroup.match(element) && replaceGroup.replace(element)
                );
            else {
                const elements = MapIO.read(tile);
                elements.forEach(
                    element => {
                        if (findGroup.match(element)) {
                            const callback = replace ? () => {
                                // safe only
                                replaceGroup.replace(element);
                                MapIO.place([{
                                    ...coords,
                                    elements: [Template.copyFrom(element)],
                                }], "safe", element.isGhost, () => true);
                            } : undefined;
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
            }
        },
    );
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
            text: "Search and Delete",
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
            text: "Search and Replace",
            onClick: () => findAndDelete(true),
        }).bindIsDisabled(
            replaceGroup.error,
        ),
    ),
    new GUI.Checkbox({
        text: "Selected area only",
    }).bindValue(selectionOnlyProp),
    new GUI.Checkbox({
        text: "In park only",
    }).bindValue(inParkOnlyProp),
    new GUI.HBox([1, 1]).add(
        new GUI.Label({
            text: "Place mode:",
        }),
        new GUI.Dropdown({
        }).bindValue<PlaceMode>(
            Configuration.tools.placeMode,
            ["safe", "raw"],
            Strings.toDisplayString,
        )
    ),
);
