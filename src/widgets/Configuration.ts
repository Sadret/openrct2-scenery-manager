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

export function getOnMissingElement(): Action {
    switch (Storage.get<number>("onMissingElement")) {
        case 0: return "error";
        case 1: return "warning";
        case 2: return "ignore";
    }
}

class Configuration {
    public static readonly instance: Configuration = new Configuration();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        const content = builder.getVBox(4, Margin.uniform(8));
        this.content(content);
        builder.addBox(content);
    }

    private content(builder: BoxBuilder) {
        {
            const hbox = builder.getHBox([11, 10]);
            hbox.addLabel({
                text: "behaviour if element unavailable:",
            });
            hbox.addDropdown({
                items: [
                    "error",
                    "warning",
                    "ignore",
                ],
                selectedIndex: Storage.get<number>("onMissingElement"),
                onChange: (idx: number) => Storage.set<number>("onMissingElement", idx),
            });
            builder.addBox(hbox);
        }
        builder.addSpace(4);
        builder.addCheckbox({
            text: "Enable height offset with mouse cursor",
            isChecked: Storage.get<boolean>("cursorHeightOffset"),
            onChange: (isChecked: boolean) => {
                Storage.set<boolean>("cursorHeightOffset", isChecked);
                SceneryManager.handle.findWidget<CheckboxWidget>("config_small_steps").isDisabled = !isChecked;
            },
        });
        {
            const hbox = builder.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_small_steps",
                text: "Enable small step size (not suited for footpaths)",
                isDisabled: !(Storage.get<boolean>("cursorHeightOffset")),
                isChecked: Storage.get<boolean>("smallSteps"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("smallSteps", isChecked),
            });
            builder.addBox(hbox);
        }
        builder.addSpace(4);
        builder.addCheckbox({
            text: "Enable rotation with mouse cursor",
            isChecked: Storage.get<boolean>("cursorRotation"),
            onChange: (isChecked: boolean) => {
                Storage.set<boolean>("cursorRotation", isChecked);
                SceneryManager.handle.findWidget<CheckboxWidget>("config_flip_rotation").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<LabelWidget>("config_sensitvity_label").isDisabled = !isChecked;
                SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").isDisabled = !isChecked;
            },
        });
        {
            const hbox = builder.getHBox([1, 20]);
            hbox.addSpace();
            hbox.addCheckbox({
                name: "config_flip_rotation",
                text: "Flip rotation direction",
                isDisabled: !(Storage.get<boolean>("cursorRotation")),
                isChecked: Storage.get<boolean>("flipRotation"),
                onChange: (isChecked: boolean) => Storage.set<boolean>("flipRotation", isChecked),
            });
            builder.addBox(hbox);
        }
        {
            const hbox = builder.getHBox([1, 10, 10]);
            hbox.addSpace();
            hbox.addLabel({
                name: "config_sensitvity_label",
                text: "Sensitivity:",
                isDisabled: !(Storage.get<boolean>("cursorRotation")),
            })
            hbox.addSpinner({
                name: "config_sensitvity",
                text: String(Storage.get<number>("sensitivity")),
                isDisabled: !(Storage.get<boolean>("cursorRotation")),
                onDecrement: () => {
                    const value: number = Storage.get<number>("sensitivity") - 1;
                    if (value < 0)
                        return;
                    Storage.set<number>("sensitivity", value);
                    SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").text = String(value);
                },
                onIncrement: () => {
                    const value: number = Storage.get<number>("sensitivity") + 1;
                    Storage.set<number>("sensitivity", value);
                    SceneryManager.handle.findWidget<SpinnerWidget>("config_sensitvity").text = String(value);
                },
            });
            builder.addBox(hbox);
        }
    }
}
export default Configuration.instance;
