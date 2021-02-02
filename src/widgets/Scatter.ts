/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BoxBuilder from "../gui/WindowBuilder";
import LargeScenery from "../template/LargeScenery";
import SmallScenery from "../template/SmallScenery";
import Template from "../template/Template";
import Brush from "../widgets/Brush";
import SceneryManager from "../SceneryManager";
import * as Storage from "../persistence/Storage";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as Tools from "../utils/Tools";

class Scatter {
    public static readonly instance: Scatter = new Scatter();
    private constructor() { }

    private entries: ElementData[] = [];
    private weights: number[] = [];
    private weight: number = 0;

    private getName(idx: number): string {
        return "scatter_spinner_" + idx;
    }
    private getLabel(data: SmallSceneryData) {
        return SceneryUtils.getObject(data).name + " (" + data.identifier + ")";
    }
    private updateEntry(idx: number, weight: number): void {
        if (weight < 0)
            weight = 0;
        if (weight > 100)
            weight = 100;
        this.weight -= this.weights[idx];
        if (this.weight + weight > 100)
            weight = 100 - this.weight;
        this.weights[idx] = weight;
        this.weight += this.weights[idx];
        SceneryManager.handle.findWidget<SpinnerWidget>(this.getName(idx)).text = String(weight) + "%";
        SceneryManager.handle.findWidget<SpinnerWidget>("scatter_spinner_empty").text = String(100 - this.weight) + "%";
    }

    private getRandomEntry(): ElementData {
        let rnd = Math.random() * 100;
        for (let i = 0; i < this.entries.length; i++)
            if ((rnd -= this.weights[i]) < 0)
                return this.entries[i];
        return undefined;
    }

    private provide(tiles: CoordsXY[]): TemplateData {
        return {
            elements: tiles.map<ElementData>((coords: CoordsXY) => {
                let data: ElementData = this.getRandomEntry();
                const z: number = SceneryUtils.getSurfaceHeight(coords);
                if (data === undefined || z == undefined)
                    return undefined;

                if (Storage.get<boolean>("config.scatter.randomise.rotation"))
                    data = Template.get(data).rotate(data, Math.floor(Math.random() * 4));

                if (Storage.get<boolean>("config.scatter.randomise.quadrant"))
                    if (data.type === "small_scenery")
                        data = SmallScenery.setQuadrant(<SmallSceneryData>data, Math.floor(Math.random() * 4));

                return {
                    ...data,
                    ...coords,
                    z: z,
                };
            }).filter((data: ElementData) => data !== undefined),
            tiles: tiles,
        };
    }

    public build(builder: BoxBuilder): void {
        Brush.build(builder);
        Brush.provider = (tiles: CoordsXY[]) => this.provide(tiles);
        Brush.activate();

        const options = builder.getGroupBox();
        {
            const hbox = options.getHBox([1, 1]);
            hbox.addCheckbox({
                text: "Randomise rotation",
                isChecked: Storage.get<boolean>("config.scatter.randomise.rotation"),
                onChange: (isChecked: boolean) => {
                    Storage.set<boolean>("config.scatter.randomise.rotation", isChecked);
                },
            });
            hbox.addCheckbox({
                text: "Randomise quadrant",
                isChecked: Storage.get<boolean>("config.scatter.randomise.quadrant"),
                onChange: (isChecked: boolean) => {
                    Storage.set<boolean>("config.scatter.randomise.quadrant", isChecked);
                },
            });
            options.addBox(hbox);
        }
        builder.addGroupBox({
            text: "Options",
        }, options);

        const pattern = builder.getGroupBox();

        this.entries.forEach((entry: SmallSceneryData, idx: number) => {
            const hbox = pattern.getHBox([10, 4, 2, 2, 3,]);
            hbox.addLabel({
                text: this.getLabel(entry),
            });
            hbox.addSpinner({
                name: this.getName(idx),
                text: String(this.weights[idx]) + "%",
                onDecrement: () => this.updateEntry(idx, this.weights[idx] - 1),
                onIncrement: () => this.updateEntry(idx, this.weights[idx] + 1),
            });
            hbox.addTextButton({
                text: "-10%",
                onClick: () => this.updateEntry(idx, this.weights[idx] - 10),
            });
            hbox.addTextButton({
                text: "+10%",
                onClick: () => this.updateEntry(idx, this.weights[idx] + 10),
            });
            hbox.addTextButton({
                text: "Remove",
                onClick: () => {
                    this.updateEntry(idx, 0);
                    this.entries.splice(idx, 1);
                    this.weights.splice(idx, 1);
                    SceneryManager.reload();
                },
            });
            pattern.addBox(hbox);
        });

        const hbox = pattern.getHBox([10, 4, 2, 2, 3,]);
        hbox.addLabel({
            text: "(empty)",
            isDisabled: true,
        });
        hbox.addSpinner({
            name: "scatter_spinner_empty",
            text: String(100 - this.weight) + "%",
            isDisabled: true,
            onDecrement: undefined,
            onIncrement: undefined,
        });
        hbox.addSpace();
        hbox.addSpace();
        hbox.addTextButton({
            text: "Add",
            onClick: () => Tools.pick(
                (element: BaseTileElement) => {
                    let data: ElementData;
                    switch (element.type) {
                        case "small_scenery":
                            data = SmallScenery.createFromTileData(undefined, <SmallSceneryElement>element);
                            break;
                        case "large_scenery":
                            data = LargeScenery.createFromTileData(undefined, <LargeSceneryElement>element, true);
                            break;
                        default:
                            return (ui.showError("Cannot use this element...", "Element must be either small scenery or large scenery."), false);
                    }
                    this.entries.push(data);
                    this.weights.push(0);
                    ui.tool.cancel();
                    SceneryManager.reload();
                    return false; // do not cancel active build tool
                }),
        });
        pattern.addBox(hbox);

        builder.addGroupBox({
            text: "Pattern",
        }, pattern);
    }
}
export default Scatter.instance;
