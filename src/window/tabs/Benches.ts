/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Context from "../../core/Context";
import * as Coordinates from "../../utils/Coordinates";
import * as MapIO from "../../core/MapIO";

import Brush from "../../tools/Brush";
import BrushBox from "../widgets/BrushBox";
import GUI from "../../gui/GUI";
import NumberProperty from "../../config/NumberProperty";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";

const NUM = 8; // max 11
const size = new NumberProperty(4, 1, NUM);
const entries = Arrays.create<Property<LoadedObject | undefined>>(NUM,
    idx => new Property<LoadedObject | undefined>(idx === 0 ? Context.getObject(
        "footpath_addition",
        "rct2.bench1",
    ) : undefined),
);

const picker = new class extends Picker {
    private entry: Property<LoadedObject | undefined> = entries[0];
    public setEntry(entry: Property<LoadedObject | undefined>): void {
        this.entry = entry;
    }

    protected accept(element: TileElement): boolean {
        if (element.type !== "footpath")
            return (ui.showError("Cannot use this element...", "Element must be a footpath addition."), false);
        const footpath = element;
        if (footpath.addition === null)
            return (ui.showError("Cannot use this element...", "Footpath has no addition."), false);
        this.entry.setValue(context.getObject("footpath_addition", footpath.addition));
        return true;
    }
}(`sm-picker-benches`);

const objects = context.getAllObjects("footpath_addition") as (LoadedObject | undefined)[];
objects.unshift(undefined);

function getLabel(object: LoadedObject | undefined) {
    return object === undefined ? "(empty)" : object.name + " (" + object.identifier + ")";
}

function provide(tiles: CoordsXY[]): TileData[] {
    return MapIO.read(tiles).map(
        (tile: TileData) => ({
            ...tile,
            elements: tile.elements.filter(
                (element: ElementData): element is FootpathData => element.type === "footpath"
            ).map<FootpathData | undefined>(element => {
                const idx = Coordinates.parity(tile, size.getValue());
                const entry = entries[idx].getValue();
                return entry && {
                    ...element,
                    type: "footpath",
                    additionIdentifier: Context.getIdentifierFromObject(entry),
                };
            }).filter<FootpathData>(
                (data: FootpathData | undefined): data is FootpathData => data !== undefined
            ),
        })
    );
}

export default new GUI.Tab(5464).add(
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
                new GUI.Dropdown({
                    items: objects.map(getLabel),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ).bindValue<LoadedObject | undefined>(
                    entry,
                    objects,
                    getLabel,
                ),
                new GUI.TextButton({
                    text: "Pick",
                    onClick: () => {
                        picker.setEntry(entry);
                        picker.activate();
                    },
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
                new GUI.TextButton({
                    text: "Empty",
                    onClick: () => entry.setValue(undefined),
                }).bindIsDisabled(
                    size,
                    size => size <= idx,
                ),
            ),
        ),
    ),
);
