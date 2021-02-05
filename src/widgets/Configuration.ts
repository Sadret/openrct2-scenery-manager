/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as Storage from "../persistence/Storage";
import { BoxBuilder, Margin } from "../gui/WindowBuilder";

export type Action = "error" | "warning" | "ignore";
const actions: Action[] = ["error", "warning", "ignore"];

class Configuration {
    public static readonly instance: Configuration = new Configuration();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        const content = builder.getVBox(4, Margin.uniform(8));
        content.addLabel({ text: "Configuration:" });
        this.buildCopyPaste(content);
        this.buildScatter(content);
        builder.addBox(content);
    }

    private buildCopyPaste(builder: BoxBuilder) {
        const group = builder.getGroupBox();
        {
            const hbox = group.getHBox([16, 5]);
            hbox.addLabel({
                text: "behaviour if element unavailable:",
            });
            hbox.addDropdown({
                items: [
                    "error",
                    "warning",
                    "ignore",
                ],
                selectedIndex: actions.indexOf(Storage.get<Action>("config.copyPaste.onMissingElement")),
                onChange: (idx: number) => Storage.set<Action>("config.copyPaste.onMissingElement", actions[idx]),
            });
            group.addBox(hbox);
        }
        group.addSpace(4);
        group.addCheckbox({
            text: "Enable height offset with mouse cursor",
            isChecked: Storage.get<boolean>("config.copyPaste.cursor.height.enabled"),
            onChange: (isChecked: boolean) => {
                console.log(isChecked);
                Storage.set<boolean>("config.copyPaste.cursor.height.enabled", isChecked);
                SceneryManager.handle.findWidget<CheckboxWidget>("config_small_steps").isDisabled = !isChecked;
            },
        });
        {
            const hbox = group.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_small_steps",
                text: "Enable small step size (not suited for footpaths)",
                isDisabled: !(Storage.get<boolean>("config.copyPaste.cursor.height.enabled")),
                isChecked: Storage.get<boolean>("config.copyPaste.cursor.height.smallSteps"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("config.copyPaste.cursor.height.smallSteps", isChecked),
            });
            group.addBox(hbox);
        }
        group.addSpace(4);
        group.addCheckbox({
            text: "Enable rotation with mouse cursor",
            isChecked: Storage.get<boolean>("config.copyPaste.cursor.rotation.enabled"),
            onChange: (isChecked: boolean) => {
                Storage.set<boolean>("config.copyPaste.cursor.rotation.enabled", isChecked);
                SceneryManager.handle.findWidget<CheckboxWidget>("config_flip_rotation").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<LabelWidget>("config_sensitvity_label").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").isDisabled = !isChecked;
            },
        });
        {
            const hbox = group.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_flip_rotation",
                text: "Flip rotation direction",
                isDisabled: !(Storage.get<boolean>("config.copyPaste.cursor.rotation.enabled")),
                isChecked: Storage.get<boolean>("config.copyPaste.cursor.rotation.flip"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("config.copyPaste.cursor.rotation.flip", isChecked),
            });
            group.addBox(hbox);
        }
        {
            const hbox = group.getHBox([1, 10, 10]);
            hbox.addSpace();
            hbox.addLabel({
                name: "config_sensitvity_label",
                text: "Sensitivity:",
                isDisabled: !(Storage.get<boolean>("cursorRotation")),
            })
            hbox.addSpinner({
                name: "config_sensitvity",
                text: String(Storage.get<number>("config.copyPaste.cursor.rotation.sensitivity")),
                isDisabled: !(Storage.get<boolean>("config.copyPaste.cursor.rotation.enabled")),
                onDecrement: () => {
                    const value: number = Storage.get<number>("config.copyPaste.cursor.rotation.sensitivity") - 1;
                    if (value < 0)
                        return;
                    Storage.set<number>("config.copyPaste.cursor.rotation.sensitivity", value);
                    SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").text = String(value);
                },
                onIncrement: () => {
                    const value: number = Storage.get<number>("config.copyPaste.cursor.rotation.sensitivity") + 1;
                    Storage.set<number>("config.copyPaste.cursor.rotation.sensitivity", value);
                    SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").text = String(value);
                },
            });
            group.addBox(hbox);
        }

        builder.addGroupBox({
            text: "Copy & Paste",
        }, group);
    }

    private buildScatter(builder: BoxBuilder) {
        const group = builder.getGroupBox();

        group.addCheckbox({
            text: "Drag to place",
            isChecked: Storage.get<boolean>("config.scatter.dragToPlace"),
            onChange: (isChecked: boolean) => Storage.set<boolean>("config.scatter.dragToPlace", isChecked),
        });
        group.addSpace(4);
        group.addCheckbox({
            text: "Show library",
            isChecked: Storage.get<boolean>("config.scatter.library.show"),
            onChange: (isChecked: boolean) => {
                Storage.set<boolean>("config.scatter.library.show", isChecked);
                SceneryManager.handle.findWidget<CheckboxWidget>("config_scatter_library_confirm_overwrite").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<CheckboxWidget>("config_scatter_library_confirm_delete").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<CheckboxWidget>("config_scatter_library_onMissingElement").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<CheckboxWidget>("config_scatter_library_onMissingElement_label").isDisabled = !isChecked;
            },
        });
        {
            const hbox = group.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_scatter_library_confirm_overwrite",
                text: "Confirm pattern overwrite",
                isDisabled: !(Storage.get<boolean>("config.scatter.library.show")),
                isChecked: Storage.get<boolean>("config.scatter.library.confirm.overwrite"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("config.scatter.library.confirm.overwrite", isChecked),
            });
            group.addBox(hbox);
        }
        {
            const hbox = group.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_scatter_library_confirm_delete",
                text: "Confirm pattern delete",
                isDisabled: !(Storage.get<boolean>("config.scatter.library.show")),
                isChecked: Storage.get<boolean>("config.scatter.library.confirm.delete"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("config.scatter.library.confirm.delete", isChecked),
            });
            group.addBox(hbox);
        }
        {
            const hbox = group.getHBox([1, 15, 5]);
            hbox.addSpace();
            hbox.addLabel({
                name: "config_scatter_library_onMissingElement_label",
                text: "behaviour if element unavailable:",
            });
            hbox.addDropdown({
                name: "config_scatter_library_onMissingElement",
                items: actions,
                selectedIndex: actions.indexOf(Storage.get<Action>("config.scatter.library.onMissingElement")),
                onChange: (idx: number) => Storage.set<Action>("config.scatter.library.onMissingElement", actions[idx]),
            });
            group.addBox(hbox);
        }

        builder.addGroupBox({
            text: "Scatter Tool",
        }, group);
    }
}
export default Configuration.instance;
