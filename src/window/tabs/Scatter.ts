/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Brush from "../../tools/Brush";
import * as FileDialogs from "../FileDialogs";
import * as Map from "../../core/Map";
import * as Picker from "../../tools/Picker";
import * as SmallScenery from "../../template/SmallScenery";
import * as Storage from "../../persistence/Storage";

import BooleanProperty from "../../config/BooleanProperty";
import Configuration from "../../config/Configuration";
import GUI from "../../gui/GUI";
import NumberProperty from "../../config/NumberProperty";
import ObjectIndex from "../../core/ObjectIndex";
import Property from "../../config/Property";
import ScatterPatternView from "../widgets/ScatterPatternView";
import Template from "../../template/Template";

const heightOffsetEnabled = new BooleanProperty(false);
const heightOffset = new NumberProperty(0, 0);

const surfaceAvgOffsets = [
    0, // 0 0 0 0
    0, // 0 0 0 1
    0, // 0 0 1 0
    1, // 0 0 1 1
    0, // 0 1 0 0
    0, // 0 1 0 1
    1, // 0 1 1 0
    2, // 0 1 1 1
    0, // 1 0 0 0
    1, // 1 0 0 1
    0, // 1 0 1 0
    2, // 1 0 1 1
    1, // 1 1 0 0
    2, // 1 1 0 1
    2, // 1 1 1 0
    2, // 1 1 1 1
]

function getSurfaceHeight(surface: SurfaceElement, requiresFlatSurface: boolean): number {
    const height = surface.baseHeight;
    const slope = surface.slope;
    if (requiresFlatSurface) {
        if (slope === 0)
            return height;
        if (slope > 0xf)
            return height + 4;
        else
            return height + 2;
    } else {
        if (slope > 0xf)
            return height + 2;
        else
            return height + surfaceAvgOffsets[slope];
    }
}

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

function provide(coords: CoordsXY): TileData {
    const result = {
        ...coords,
        elements: [] as ElementData[],
    };

    let data: ElementData | null = getRandomData();
    if (data === null)
        return result;

    const surface = Map.getSurface(Map.getTile(coords));
    if (surface === null)
        return result;

    const requiresFlatSurface = data.type === "small_scenery" && SmallScenery.requiresFlatSurface(data);

    const surfaceHeight = getSurfaceHeight(surface, requiresFlatSurface);
    const offset = heightOffsetEnabled.getValue() ? heightOffset.getValue() : 0;
    const height = surfaceHeight + offset;

    data.clearanceHeight -= data.baseHeight;
    data.clearanceZ -= data.baseZ;
    data.baseHeight = height;
    data.baseZ = height * 8;
    data.clearanceHeight += data.baseHeight;
    data.clearanceZ += data.baseZ;

    if (!heightOffsetEnabled.getValue() && !requiresFlatSurface)
        data.onSurface = true;

    if (Configuration.scatter.randomiseRotation.getValue())
        data = Template.get(data).rotate(data, Math.floor(Math.random() * 4));

    if (Configuration.scatter.randomiseQuadrant.getValue())
        if (data.type === "small_scenery")
            data = SmallScenery.setQuadrant(data, Math.floor(Math.random() * 4));

    result.elements.push(data);
    return result;
}

function activateBrush(): void {
    Brush.activate(
        "Scenery Scatter",
        provide,
    );
}

function getLabel(entry: ScatterData | null): string {
    if (entry === null)
        return "(empty)";
    const object = ObjectIndex.getObject(entry.element.type, entry.element.qualifier);
    return `${object === null ? "?" : object.name} (${entry.element.qualifier})`;
}

function getRandomData(): SmallSceneryData | LargeSceneryData | null {
    let rnd = Math.random() * 100;
    for (let i = 0; i < entries.length; i++) {
        const data = entries[i].getValue();
        if (data !== null && (rnd -= data.weight) < 0)
            return { ...data.element };
    }
    return null;
}

function save(): void {
    const data = entries.map(
        entry => entry.getValue()
    ).filter<ScatterData>(
        (data): data is ScatterData => data !== null
    );

    FileDialogs.showSave({
        title: "Save pattern",
        fileSystem: Storage.libraries.scatterPattern,
        fileView: new ScatterPatternView(),
        fileContent: data,
    });
}

function load(): void {
    FileDialogs.showLoad({
        title: "Load pattern",
        fileSystem: Storage.libraries.scatterPattern,
        fileView: new ScatterPatternView(),
        onLoad: pattern => {
            const isAvailable = Arrays.find(pattern, data => !Template.isAvailable(data.element)) === null;

            if (!isAvailable) {
                const action = Configuration.tools.onMissingElement.getValue();
                switch (action) {
                    case "error":
                        return ui.showError("Can't load pattern...", "Pattern includes scenery which is unavailable.");
                    case "warning":
                        ui.showError("Can't load entire template...", "Pattern includes scenery which is unavailable.");
                }
            }

            pattern.forEach((data, idx) => entries[idx].setValue(data));

            activateBrush();
        },
    });
}

function updateEntryWeight(entry: Property<ScatterData | null>, value: number, absolute: boolean = false): void {
    const data = entry.getValue();
    if (data === null)
        return;

    let weight = data.weight;
    empty.increment(weight);
    if (absolute)
        weight = value;
    else
        weight += value;
    if (weight < 0)
        weight = 0;
    if (weight > empty.getValue())
        weight = empty.getValue();
    entry.setValue({
        element: data.element,
        weight: weight,
    });
}

export default new GUI.Tab({
    image: 5459,
}).add(
    new GUI.GroupBox({
        text: "Options",
    }).add(
        new GUI.HBox([2, 3]).add(
            new GUI.VBox().add(
                new GUI.Checkbox({
                    text: "Randomise rotation",
                }).bindValue(
                    Configuration.scatter.randomiseRotation,
                ),
                new GUI.Checkbox({
                    text: "Randomise quadrant",
                }).bindValue(
                    Configuration.scatter.randomiseQuadrant,
                ),
            ),
            new GUI.VBox().add(
                new GUI.HBox([1, 1]).add(
                    new GUI.Checkbox({
                        text: "Height offset:",
                    }).bindValue(
                        heightOffsetEnabled
                    ),
                    new GUI.Spinner({
                    }).bindValue(
                        heightOffset,
                    ).bindIsDisabled(
                        heightOffsetEnabled,
                        enabled => !enabled,
                    ),
                ),
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
                ).enableOnClick(
                    value => {
                        if (!isNaN(Number(value)))
                            updateEntryWeight(entry, Number(value), true);
                    }
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
                        if (entry.getValue() === null)
                            Picker.activate(element => {
                                if (element.type !== "small_scenery" && element.type !== "large_scenery")
                                    return (ui.showError("Cannot use this element...", "Element must be either small scenery or large scenery."), false);
                                const data = <SmallSceneryData | LargeSceneryData>Template.copyFrom(element);
                                if (data.type === "large_scenery")
                                    data.sequence = 0;
                                entry.setValue({
                                    element: data,
                                    weight: 0,
                                });
                                activateBrush();
                                return true;
                            });
                        else
                            entry.setValue(null);
                    },
                }).bindText(
                    entry,
                    data => data === null ? "Pick" : "Clear",
                ),
            ),
        ),
        new GUI.HBox([10, 4, 7,]).add(
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
            new GUI.TextButton({
                text: "Clear all",
                onClick: () => entries.forEach(entry => entry.setValue(null)),
            }),
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
                text: "Activate brush",
                onClick: activateBrush,
            }),
        ),
    ),
);
