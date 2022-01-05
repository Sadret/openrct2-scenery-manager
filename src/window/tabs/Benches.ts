/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Coordinates from "../../utils/Coordinates";
import * as MapIO from "../../core/MapIO";

import Brush from "../../tools/Brush";
import BrushBox from "../widgets/BrushBox";
import GUI from "../../gui/GUI";
import NumberProperty from "../../config/NumberProperty";
import ObjectIndex from "../../core/ObjectIndex";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";

type Entry = { identifier: string, name: string } | null;
const EMPTY_STRING = "(empty)";

const NUM = 8; // max 11
const size = new NumberProperty(4, 1, NUM);
const entries = Arrays.create(NUM, _ => new Property<Entry>(null));

const picker = new class extends Picker {
    public entry: Property<Entry> = entries[0];

    protected accept(element: TileElement): boolean {
        if (element.type !== "footpath")
            return (ui.showError("Cannot use this element...", "Element must be a footpath addition."), false);
        const footpath = element;
        if (footpath.addition === null)
            return (ui.showError("Cannot use this element...", "Footpath has no addition."), false);
        const object = ObjectIndex.getObject("footpath_addition", footpath.addition);
        if (object === null)
            return false;
        const identifier = ObjectIndex.getIdentifier(object);
        this.entry.setValue({ identifier: identifier, name: object.name });
        return true;
    }
}(`sm-picker-benches`);

const dropdowns = entries.map((_, idx) => new GUI.Dropdown({
}).bindIsDisabled(
    size,
    size => size <= idx,
));

function provide(tiles: CoordsXY[]): TileData[] {
    return MapIO.read(tiles).map(
        (tile: TileData) => ({
            ...tile,
            elements: tile.elements.map<FootpathData | undefined>(element => {
                if (element.type !== "footpath")
                    return undefined;
                const idx = Coordinates.parity(tile, size.getValue());
                const entry = entries[idx].getValue();
                return entry === null ? undefined : {
                    ...element,
                    additionIdentifier: entry.identifier,
                };
            }).filter<FootpathData>(
                (data): data is FootpathData => data !== undefined
            ),
        })
    );
}

export default new GUI.Tab({
    image: 5464,
    onOpen: () => {
        const loadedEntries = [null as Entry].concat(
            ObjectIndex.getAllObjects("footpath_addition").map(
                object => ({
                    identifier: ObjectIndex.getIdentifier(object),
                    name: object.name,
                })
            )
        );

        dropdowns.forEach((dropdown, idx) => {
            const oldEntry = entries[idx].getValue();
            if (oldEntry !== null)
                entries[idx].setValue(Arrays.find(
                    loadedEntries,
                    entry => entry !== null && entry.identifier === oldEntry.identifier,
                ));

            dropdown.bindValue(
                entries[idx],
                loadedEntries,
                entry => entry === null ? EMPTY_STRING : `${entry.name} (${entry.identifier})`,
            );
        });
    },
}).add(
    new BrushBox(
        new class extends Brush {
            constructor() {
                super("sm-brush-benches");
                this.mode = "move";
            }

            protected getTileDataFromTiles(tiles: CoordsXY[]): TileData[] {
                return provide(tiles);
            }
        }(),
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
                dropdowns[idx],
                new GUI.TextButton({
                    text: "Pick",
                    onClick: () => {
                        picker.entry = entry;
                        picker.activate();
                    },
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
