/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../../core/Context";
import * as MapIO from "../../core/MapIO";
import * as Coordinates from "../../utils/Coordinates";
import * as Arrays from "../../utils/Arrays";
import * as Tools from "../../utils/Tools";
import Brush from "../widgets/Brush";
import GUI from "../../gui/GUI";
import { NumberProperty, Property } from "../../config/Property";

const NUM = 8; // max 11
const size = new NumberProperty(4, 1, NUM);
const entries = Arrays.create<Property<Object | undefined>>(NUM,
    idx => new Property<Object | undefined>(idx === 0 ? Context.getObject({
        type: "footpath_addition",
        identifier: "rct2.bench1",
    }) : undefined),
);

const objects = context.getAllObjects("footpath_addition") as (Object | undefined)[];
objects.unshift(undefined);

function getLabel(object: Object | undefined) {
    return object === undefined ? "(empty)" : object.name + " (" + object.identifier + ")";
}

function provide(tiles: CoordsXY[]): TemplateData {
    return {
        elements: MapIO.read(tiles).filter(
            (element: ElementData) => element.type === "footpath"
        ).map<FootpathAdditionData | undefined>(element => {
            const idx = Coordinates.parity(Coordinates.worldToTileCoords(element), size.getValue());
            const entry = entries[idx].getValue();
            return entry === undefined ? undefined : {
                ...element,
                type: "footpath_addition",
                identifier: Context.getIdentifierFromObject(entry),
            };
        }).filter<FootpathAdditionData>(
            (data: FootpathAdditionData | undefined): data is FootpathAdditionData => data !== undefined
        ),
        tiles: tiles,
    };
}

function updateEntry(entry: Property<Object | undefined>, clear: boolean): void {
    if (clear)
        return entry.setValue(undefined);

    Tools.pick(
        element => {
            if (element.type !== "footpath")
                return (ui.showError("Cannot use this element...", "Element must be a footpath addition."), false);
            const footpath: FootpathElement = <FootpathElement>element;
            if (footpath.addition === null)
                return (ui.showError("Cannot use this element...", "Footpath has no addition."), false);
            entry.setValue(context.getObject("footpath_addition", footpath.addition));
            return true;
        }
    );
}

export default new GUI.Tab(5464).add(
    new Brush(
        tiles => provide(tiles),
        "move",
    ),
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
            new GUI.HBox([3, 1, 1,]).add(
                new GUI.Dropdown({
                    items: objects.map(getLabel),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ).bindValue<object | undefined>(
                    entry,
                    objects,
                    getLabel,
                ),
                new GUI.TextButton({
                    text: "Pick",
                    onClick: () => updateEntry(entry, false),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
                new GUI.TextButton({
                    text: "Empty",
                    onClick: () => updateEntry(entry, true),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
            ),
        ),
    ),
);
