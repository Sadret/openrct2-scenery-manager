/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Brush from "../../tools/Brush";
import * as Coordinates from "../../utils/Coordinates";
import * as Map from "../../core/Map";
import * as Picker from "../../tools/Picker";

import GUI from "../../gui/GUI";
import NumberProperty from "../../config/NumberProperty";
import ObjectIndex from "../../core/ObjectIndex";
import Property from "../../config/Property";
import Template from "../../template/Template";

const EMPTY_STRING = "(empty)";

const NUM = 8; // max 11
const size = new NumberProperty(4, 1, NUM);
const entries = Arrays.create(NUM, _ => new Property<IndexedObject | null>(null));

const dropdowns = entries.map((_, idx) => new GUI.Dropdown({
}).bindIsDisabled(
    size,
    size => size <= idx,
));

function provide(coords: CoordsXY): TileData {
    const idx = Coordinates.parity(coords, size.getValue());
    const entry = entries[idx].getValue();
    const elements = [] as FootpathData[];

    if (entry !== null)
        Map.getTile(
            coords
        ).elements.forEach(
            element => {
                if (element.type === "footpath")
                    elements.push({
                        ...Template.copyFrom(element) as FootpathData,
                        qualifier: null,
                        surfaceQualifier: null,
                        railingsQualifier: null,
                        additionQualifier: entry.qualifier,
                    });
            },
        );

    return {
        ...coords,
        elements: elements,
    };
}

export default new GUI.Tab({
    image: 5464,
    onOpen: () => {
        const loadedEntries = [null as (IndexedObject | null)].concat(
            ObjectIndex.getAllObjects("footpath_addition")
        );

        dropdowns.forEach((dropdown, idx) => {
            const oldEntry = entries[idx].getValue();
            if (oldEntry !== null)
                entries[idx].setValue(Arrays.find(
                    loadedEntries,
                    entry => entry !== null && entry.qualifier === oldEntry.qualifier,
                ));

            dropdown.bindValue(
                entries[idx],
                loadedEntries,
                entry => entry === null ? EMPTY_STRING : `${entry.name} (${entry.qualifier})`,
            );
        });
    },
}).add(
    new GUI.TextButton({
        text: "Activate brush",
        onClick: () => Brush.activate(
            "Path Additions",
            provide,
        ),
    }),
    new GUI.GroupBox({
        text: "Options",
    }).add(
        new GUI.HBox([3, 2]).add(
            new GUI.Label({
                text: "Pattern size:",
            }),
            new GUI.Spinner({
            }).bindValue(size),
            new GUI.Space(),
        ),
    ),
    new GUI.GroupBox({
        text: "Pattern",
    }).add(
        ...entries.map((entry, idx) =>
            new GUI.HBox([4, 1, 1,]).add(
                dropdowns[idx],
                new GUI.TextButton({
                    text: "Pick",
                    onClick: () => Picker.activate(element => {
                        if (element.type !== "footpath")
                            return (ui.showError("Cannot use this element...", "Element must be a footpath addition."), false);
                        const footpath = element;
                        if (footpath.addition === null)
                            return (ui.showError("Cannot use this element...", "Footpath has no addition."), false);
                        const object = ObjectIndex.getObject("footpath_addition", footpath.addition);
                        entry.setValue(object);
                        return true;
                    }),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
                new GUI.TextButton({
                    text: "Empty",
                    onClick: () => entry.setValue(null),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
            ),
        ),
    ),
);
