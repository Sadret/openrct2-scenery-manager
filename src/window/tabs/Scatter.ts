/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as MapIO from "../../core/MapIO";
import * as Storage from "../../persistence/Storage";

import Brush from "../../tools/Brush";
import BrushBox from "../widgets/BrushBox";
import Configuration from "../../config/Configuration";
import Dialog from "../../utils/Dialog";
import GUI from "../../gui/GUI";
import NumberProperty from "../../config/NumberProperty";
import ObjectIndex from "../../core/ObjectIndex";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";
import ScatterPatternView from "../widgets/ScatterPatternView";
import Template from "../../template/Template";
import * as SmallScenery from "../../template/SmallScenery";

const EMPTY_STRING = "(empty)";

// TODO: test max size
const entries = Arrays.create(5, () => new Property<ScatterData | null>(null));
const empty: NumberProperty = new NumberProperty(100);
entries.forEach(entry => entry.bind(updateEmpty));

function updateEmpty() {
    empty.setValue(
        entries.reduce<number>(
            (prev, curr) => {
                const data = curr.getValue();
                return data === null ? prev : (prev - data.weight);
            },
            100,
        )
    );
}

const picker = new class extends Picker {
    public entry: Property<ScatterData | null> = entries[0];

    protected accept(element: TileElement): boolean {
        if (element.type !== "small_scenery" && element.type !== "large_scenery")
            return (ui.showError("Cannot use this element...", "Element must be either small scenery or large scenery."), false);
        const data = <SmallSceneryData | LargeSceneryData>Template.copyFrom(element);
        this.entry.setValue({
            element: data,
            weight: 0,
        });
        return true;
    }
}("sm-picker-scatter");

function provide(coordsList: CoordsXY[]): TileData[] {
    const result = [] as TileData[];
    coordsList.forEach(coords => {
        let data = getRandomData();
        if (data === null)
            return;

        const z = MapIO.getSurfaceHeight(MapIO.getTile(coords));
        data.baseZ = z;
        data.baseHeight = z / 8;

        if (Configuration.scatter.randomise.rotation.getValue())
            data = Template.get(data).rotate(data, Math.floor(Math.random() * 4));

        if (Configuration.scatter.randomise.quadrant.getValue())
            if (data.type === "small_scenery")
                data = SmallScenery.setQuadrant(data, Math.floor(Math.random() * 4));

        result.push({
            ...coords,
            elements: [data],
        });
    });
    return result;
}

function getLabel(entry: ScatterData | null): string {
    if (entry === null)
        return EMPTY_STRING;
    const object = ObjectIndex.getObject(entry.element.type, entry.element.qualifier);
    if (object === null)
        return EMPTY_STRING;
    return `${object.name} (${object.qualifier})`;
}

function getRandomData(): ElementData | null {
    let rnd = Math.random() * 100;
    for (let i = 0; i < entries.length; i++) {
        const data = entries[i].getValue();
        if (data !== null && (rnd -= data.weight) < 0)
            return data.element;
    }
    return null;
}

function save(): void {
    const data = entries.map(
        entry => entry.getValue()
    ).filter<ScatterData>(
        (data): data is ScatterData => data !== null
    );

    Dialog.showSave({
        title: "Save pattern",
        fileSystem: Storage.libraries.scatterPattern,
        fileView: new ScatterPatternView(),
        fileContent: data,
    });
}

function load(): void {
    Dialog.showLoad({
        title: "Load pattern",
        fileSystem: Storage.libraries.scatterPattern,
        fileView: new ScatterPatternView(),
        onLoad: pattern => {
            const available = pattern;
            // TODO: [scatter] check availability
            // .filter(
            //     data => Template.isAvailable(data.element)
            // );

            if (available.length !== pattern.length) {
                const action = Configuration.scatter.onMissingElement.getValue();
                switch (action) {
                    case "error":
                        return ui.showError("Can't load pattern...", "Pattern includes scenery which is unavailable.");
                    case "warning":
                        ui.showError("Can't load entire template...", "Pattern includes scenery which is unavailable.");
                }
            }

            entries.forEach((entry, idx) => entry.setValue(available[idx]));
        },
    });
}

function updateEntryWeight(entry: Property<ScatterData | null>, delta: number): void {
    const data = entry.getValue();
    if (data === null)
        return;

    let weight = data.weight;
    empty.increment(weight);
    weight += delta;
    if (weight < 0)
        weight = 0;
    if (weight > empty.getValue())
        weight = empty.getValue();
    entry.setValue({
        element: data.element,
        weight: weight,
    });
}

export default new GUI.Tab({ image: 5459 }).add(
    new BrushBox(
        new class extends Brush {
            constructor() {
                super(
                    "sm-brush-scatter",
                    undefined,
                    ["terrain"],
                );
                Configuration.scatter.dragToPlace.bind(
                    value => this.mode = value ? "move" : "down",
                );
            }

            protected getTileDataFromTiles(tiles: CoordsXY[]): TileData[] {
                return provide(tiles);
            }
        }(),
    ),
    new GUI.GroupBox({
        text: "Options",
    }).add(
        new GUI.HBox([1, 1]).add(
            new GUI.Checkbox({
                text: "Randomise rotation",
            }).bindValue(
                Configuration.scatter.randomise.rotation,
            ),
            new GUI.Checkbox({
                text: "Randomise quadrant",
            }).bindValue(
                Configuration.scatter.randomise.quadrant,
            ),
        ),
    ),
    new GUI.GroupBox({
        text: "Pattern",
    }).add(
        ...entries.map(entry =>
            new GUI.HBox([10, 4, 2, 2, 3,]).add(
                new GUI.Label({}).bindText(
                    entry,
                    getLabel,
                ),
                new GUI.Spinner({
                    onDecrement: () => updateEntryWeight(entry, -1),
                    onIncrement: () => updateEntryWeight(entry, +1),
                }).bindIsDisabled(
                    entry,
                    data => data === null,
                ).bindText(
                    entry,
                    data => String(data === null ? 0 : data.weight) + "%",
                ),
                new GUI.TextButton({
                    text: "-10%",
                    onClick: () => updateEntryWeight(entry, -10),
                }).bindIsDisabled(
                    entry,
                    data => data === null,
                ),
                new GUI.TextButton({
                    text: "+10%",
                    onClick: () => updateEntryWeight(entry, +10),
                }).bindIsDisabled(
                    entry,
                    data => data === null,
                ),
                new GUI.TextButton({
                    onClick: () => {
                        if (entry.getValue() === null) {
                            picker.entry = entry;
                            picker.activate();
                        } else
                            entry.setValue(null);
                    },
                }).bindText(
                    entry,
                    data => data === null ? "Pick" : "Clear",
                ),
            ),
        ),
        new GUI.HBox([10, 4, 2, 2, 3,]).add(
            new GUI.Label({
                text: "(empty)",
                isDisabled: true,
            }),
            new GUI.Spinner({
                isDisabled: true,
            }).bindText(
                empty,
                value => String(value) + "%",
            ),
            new GUI.Space(),
            new GUI.Space(),
            new GUI.Space(),
        ),
        new GUI.Space(2),
        new GUI.HBox([7, 7, 7]).add(
            new GUI.TextButton({
                text: "Save",
                onClick: save,
            }),
            new GUI.TextButton({
                text: "Load",
                onClick: load,
            }),
            new GUI.TextButton({
                text: "Clear all",
                onClick: () => entries.forEach(entry => entry.setValue(null)),
            }),
        ),
    ),
);
