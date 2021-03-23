/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Context from "../../core/Context";
import * as MapIO from "../../core/MapIO";
import * as StartUp from "../../StartUp";
import * as Storage from "../../persistence/Storage";

import Brush from "../../tools/Brush";
import BrushBox from "../widgets/BrushBox";
import Configuration from "../../config/Configuration";
import Dialog from "../../utils/Dialog";
import FileExplorer from "../widgets/FileExplorer";
import GUI from "../../gui/GUI";
import LargeScenery from "../../template/LargeScenery";
import NumberProperty from "../../config/NumberProperty";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";
import ScatterPatternView from "../widgets/ScatterPatternView";
import SmallScenery from "../../template/SmallScenery";
import Template from "../../template/Template";

const data = Arrays.create<Property<ScatterData>>(5, () => new Property<ScatterData>({
    element: undefined,
    weight: 0,
}));
let empty: NumberProperty = new NumberProperty(100);

const saveDialog = new Dialog(
    "Save pattern",
    new class extends FileExplorer {
        onFileCreation(file: IFile): void {
            file.setContent<ScatterPattern>(savePattern());
            this.getWindow() ?.close();
        }
    }(
        new class extends ScatterPatternView {
            constructor() {
                super();
                StartUp.addTask(() => this.watch(Storage.libraries.scatterPattern));
            }

            openFile(file: IFile): void {
                file.setContent<ScatterPattern>(savePattern());
                this.getWindow() ?.close();
            }
        }(),
        true,
    ),
    undefined,
    false,
);
const loadDialog = new Dialog(
    "Load template",
    new FileExplorer(
        new class extends ScatterPatternView {
            constructor() {
                super();
                StartUp.addTask(() => this.watch(Storage.libraries.scatterPattern));
            }

            openFile(file: IFile): void {
                loadPattern(file.getContent<ScatterPattern>());
                this.getWindow() ?.close();
            }
        }(),
    ),
    undefined,
    false,
);

function getLabel(element: ElementData | undefined): string {
    return element === undefined ? "(empty)" : (Context.getObject(element).name + " (" + element.identifier + ")");
}

function getRandomEntry(): ElementData | undefined {
    let rnd = Math.random() * 100;
    for (let i = 0; i < data.length; i++)
        if ((rnd -= data[i].getValue().weight) < 0)
            return data[i].getValue().element;
    return undefined;
}

function provide(tiles: CoordsXY[]): TemplateData {
    return {
        elements: tiles.map<ElementData | undefined>((coords: CoordsXY) => {
            let data: ElementData | undefined = getRandomEntry();
            const z: number = MapIO.getSurfaceHeight(coords);
            if (data === undefined || z == undefined)
                return undefined;

            if (Configuration.scatter.randomise.rotation.getValue())
                data = Template.get(data).rotate(data, Math.floor(Math.random() * 4));

            if (Configuration.scatter.randomise.quadrant.getValue())
                if (data.type === "small_scenery")
                    data = SmallScenery.setQuadrant(<SmallSceneryData>data, Math.floor(Math.random() * 4));

            return {
                ...data,
                ...coords,
                z: z,
            };
        }).filter<ElementData>((data: ElementData | undefined): data is ElementData => data !== undefined),
        tiles: tiles,
    };
}

function clearEntry(entry: Property<ScatterData>): void {
    empty.increment(entry.getValue().weight);
    entry.setValue({
        element: undefined,
        weight: 0,
    });
}

function updateEntryElement(entry: Property<ScatterData>): void {
    clearEntry(entry);
    new class extends Picker {
        protected accept(element: BaseTileElement): boolean {
            let data: ElementData | undefined;
            switch (element.type) {
                case "small_scenery":
                    data = SmallScenery.createFromTileData(<SmallSceneryElement>element);
                    break;
                case "large_scenery":
                    data = LargeScenery.createFromTileData(<LargeSceneryElement>element, undefined, true);
                    break;
                default:
                    return (ui.showError("Cannot use this element...", "Element must be either small scenery or large scenery."), false);
            }
            entry.setValue({
                element: data,
                weight: 0,
            });
            return true;
        }
    }(
        "sm-picker-scatter",
    ).activate();
}
function savePattern(): ScatterPattern {
    return data.map(property => property.getValue());
}

function loadPattern(pattern: ScatterPattern): void {
    data.forEach(entry => clearEntry(entry));
    pattern.forEach((entry, idx) => data[idx].setValue(entry));
}

function updateEntryWeight(entry: Property<ScatterData>, delta: number): void {
    let weight = entry.getValue().weight;
    empty.increment(weight);
    weight += delta;
    if (weight < 0)
        weight = 0;
    if (weight > empty.getValue())
        weight = empty.getValue();
    empty.decrement(weight);
    entry.setValue({
        element: entry.getValue().element,
        weight: weight,
    });
}

export default new GUI.Tab(5459).add(
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

            protected getTemplateFromTiles(tiles: CoordsXY[], _offset: CoordsXY): TemplateData {
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
        ...data.map(entry =>
            new GUI.HBox([10, 4, 2, 2, 3,]).add(
                new GUI.Label({}).bindText(
                    entry,
                    data => getLabel(data.element),
                ),
                new GUI.Spinner({
                    onDecrement: () => updateEntryWeight(entry, -1),
                    onIncrement: () => updateEntryWeight(entry, +1),
                }).bindIsDisabled(
                    entry,
                    data => data.element === undefined,
                ).bindText(
                    entry,
                    data => String(data.weight) + "%",
                ),
                new GUI.TextButton({
                    text: "-10%",
                    onClick: () => updateEntryWeight(entry, -10),
                }).bindIsDisabled(
                    entry,
                    data => data.element === undefined,
                ),
                new GUI.TextButton({
                    text: "+10%",
                    onClick: () => updateEntryWeight(entry, +10),
                }).bindIsDisabled(
                    entry,
                    data => data.element === undefined,
                ),
                new GUI.TextButton({
                    onClick: () => (entry.getValue().element === undefined) ? updateEntryElement(entry) : clearEntry(entry),
                }).bindText(
                    entry,
                    data => data.element === undefined ? "Pick" : "Clear",
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
                onClick: () => saveDialog.open(),
            }),
            new GUI.TextButton({
                text: "Load",
                onClick: () => loadDialog.open(),
            }),
            new GUI.TextButton({
                text: "Clear all",
                onClick: () => data.forEach(entry => clearEntry(entry)),
            }),
        ),
    ),
);
