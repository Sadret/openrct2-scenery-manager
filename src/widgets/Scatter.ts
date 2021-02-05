/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Library from "../gui/Library";
import BoxBuilder from "../gui/WindowBuilder";
import LargeScenery from "../template/LargeScenery";
import SmallScenery from "../template/SmallScenery";
import Template from "../template/Template";
import Brush from "../widgets/Brush";
import SceneryManager from "../SceneryManager";
import * as Storage from "../persistence/Storage";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as UiUtils from "../utils/UiUtils";
import * as Tools from "../utils/Tools";
import { Action } from "../widgets/Configuration";
import { File } from "../persistence/File";

class Scatter {
    public static readonly instance: Scatter = new Scatter();

    private data: ScatterData[] = [];
    private empty: number = 100;

    public library: Library = new class extends Library {
        constructor() {
            super("scatter");
        }
        getWindow(): Window {
            return SceneryManager.handle;
        }
        getColumns(): ListViewColumn[] {
            return [{
                header: "Name",
                ratioWidth: 4,
            }, {
                header: "Size",
                ratioWidth: 1,
            }, {
                header: "Density",
                ratioWidth: 1,
            }];
        }
        getItem(file: File): ListViewItem {
            const data: ScatterData[] = file.getContent<ScatterData[]>();
            const density: number = data.reduce((previous: number, current: ScatterData) => previous + current.weight, 0);
            return [file.name, String(data.length), String(density) + "%"];
        }
    }();

    private constructor() {
        this.library.onUpdate = () => this.update();
    }

    private getName(idx: number): string {
        return "scatter_spinner_" + idx;
    }
    private getLabel(element: ElementData) {
        return SceneryUtils.getObject(element).name + " (" + element.identifier + ")";
    }
    private updateEntry(idx: number, weight: number): void {
        if (weight < 0)
            weight = 0;
        if (weight > 100)
            weight = 100;
        this.empty += this.data[idx].weight;
        if (this.empty - weight < 0)
            weight = this.empty;
        this.data[idx] = {
            ...this.data[idx],
            weight: weight,
        };
        this.empty -= weight;
        SceneryManager.handle.findWidget<SpinnerWidget>(this.getName(idx)).text = String(weight) + "%";
        SceneryManager.handle.findWidget<SpinnerWidget>("scatter_spinner_empty").text = String(this.empty) + "%";
    }

    private getRandomEntry(): ElementData {
        let rnd = Math.random() * 100;
        for (let i = 0; i < this.data.length; i++)
            if ((rnd -= this.data[i].weight) < 0)
                return this.data[i].element;
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
        Brush.mode = Storage.get<boolean>("config.scatter.dragToPlace") ? "move" : "down";
        Brush.activate();

        this.buildOptions(builder);
        this.buildPattern(builder);
        this.buildLibrary(builder);
    }

    private buildOptions(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        const hbox = group.getHBox([1, 1]);
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
        group.addBox(hbox);
        builder.addGroupBox({
            text: "Options",
        }, group);
    }

    private buildPattern(builder: BoxBuilder): void {
        const group = builder.getGroupBox();

        this.data.forEach((entry: ScatterData, idx: number) => {
            const hbox = group.getHBox([10, 4, 2, 2, 3,]);
            hbox.addLabel({
                text: this.getLabel(entry.element),
            });
            hbox.addSpinner({
                name: this.getName(idx),
                text: String(entry.weight) + "%",
                onDecrement: () => this.updateEntry(idx, this.data[idx].weight - 1),
                onIncrement: () => this.updateEntry(idx, this.data[idx].weight + 1),
            });
            hbox.addTextButton({
                text: "-10%",
                onClick: () => this.updateEntry(idx, this.data[idx].weight - 10),
            });
            hbox.addTextButton({
                text: "+10%",
                onClick: () => this.updateEntry(idx, this.data[idx].weight + 10),
            });
            hbox.addTextButton({
                text: "Remove",
                onClick: () => {
                    this.updateEntry(idx, 0);
                    this.data.splice(idx, 1);
                    SceneryManager.reload();
                },
            });
            group.addBox(hbox);
        });

        {
            const hbox = group.getHBox([10, 4, 2, 2, 3,]);
            hbox.addLabel({
                text: "(empty)",
                isDisabled: true,
            });
            hbox.addSpinner({
                name: "scatter_spinner_empty",
                text: String(this.empty) + "%",
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
                        this.data.push({
                            element: data,
                            weight: 0,
                        });
                        ui.tool.cancel();
                        SceneryManager.reload();
                        return false; // do not cancel active build tool
                    }),
            });
            group.addBox(hbox);
        }

        {
            const hbox = group.getHBox([2, 1]);
            hbox.addSpace();
            hbox.addTextButton({
                text: "Save to library",
                onClick: () => this.saveToLibrary(),
            });
            group.addBox(hbox);
        }

        builder.addGroupBox({
            text: "Pattern",
        }, group);
    }

    private buildLibrary(builder: BoxBuilder): void {
        if (!Storage.get<boolean>("config.scatter.library.show"))
            return;

        const group = builder.getGroupBox();

        this.library.build(group, 128);

        const hbox = group.getHBox([1, 1, 1, 1]);
        hbox.addTextButton({
            text: "Save",
            name: "scatter_library_save",
            isDisabled: this.library.getSelected() === undefined,
            onClick: () => this.save(),
        });
        hbox.addTextButton({
            text: "Load",
            name: "scatter_library_load",
            isDisabled: this.library.getSelected() === undefined,
            onClick: () => this.load(),
        });
        hbox.addTextButton({
            text: "Rename",
            name: "scatter_library_rename",
            isDisabled: this.library.getSelected() === undefined,
            onClick: () => this.rename(),
        });
        hbox.addTextButton({
            text: "Delete",
            name: "scatter_library_delete",
            isDisabled: this.library.getSelected() === undefined,
            onClick: () => this.delete(),
        });
        group.addBox(hbox);

        builder.addGroupBox({
            text: "Library",
        }, group);
    }

    private update(): void {
        if (SceneryManager.handle === undefined) return;

        const handle: Window = SceneryManager.handle;
        const isDisabled: boolean = this.library.getSelected() === undefined;

        handle.findWidget<ButtonWidget>("scatter_library_save").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("scatter_library_load").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("scatter_library_rename").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("scatter_library_delete").isDisabled = isDisabled;
    }

    private counter: number = 0;
    private saveToLibrary(): void {
        const name: string = "unnamed-" + this.counter++;
        const file: File = this.library.getFolder().addFile<ScatterData[]>(name, this.data.map(x => x));

        if (file === undefined)
            return this.saveToLibrary();

        this.library.update();
    }

    private save(): void {
        const file: File = this.library.getSelected();
        const act: () => void = () => {
            file.setContent<ScatterData[]>(this.data.map(x => x));
            this.library.update();
        }
        if (Storage.get<boolean>("config.scatter.library.confirm.overwrite"))
            UiUtils.showConfirm(
                "Overwrite pattern",
                ["Do you really want to overwrite pattern", `"${file.name}"?`],
                confirmed => {
                    if (confirmed)
                        act();
                },
                "Overwrite",
            );
        else
            act();
    }

    private load(): void {
        const file: File = this.library.getSelected();
        const data: ScatterData[] = file.getContent<ScatterData[]>().map(x => x);
        const available: ScatterData[] = data.filter((data: ScatterData) => Template.isAvailable(data.element));
        const onMissingElement: Action = Storage.get<Action>("config.scatter.library.onMissingElement");

        if (available.length !== data.length)
            if (onMissingElement === "error")
                return ui.showError("Can't use pattern...", "Pattern includes scenery which is unavailable.");
            else if (onMissingElement === "warning")
                ui.showError("Can't use entire pattern...", "Pattern includes scenery which is unavailable.");

        this.data = available;
        SceneryManager.reload();
    }

    private rename(): void {
        const file: File = this.library.getSelected();
        ui.showTextInput({
            title: "Rename pattern",
            description: "Enter a new name for this pattern:",
            callback: name => {
                const newFile: File = file.rename(name);
                if (newFile === undefined)
                    return ui.showError("Can't rename pattern...", "Pattern with this name already exists.");
                this.library.select(newFile);
            },
        });

    }

    private delete(): void {
        const file: File = this.library.getSelected();
        const act: () => void = () => {
            file.delete();
            this.library.update();
        }
        if (Storage.get<boolean>("config.scatter.library.confirm.delete"))
            UiUtils.showConfirm(
                "Delete pattern",
                ["Do you really want to delete pattern", `"${file.name}"?`],
                confirmed => {
                    if (confirmed)
                        act();
                },
                "Delete",
            );
        else
            act();
    }

}
export default Scatter.instance;
