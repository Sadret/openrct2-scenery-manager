/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as StringUtils from "../utils/StringUtils";
import { BoxBuilder } from "../gui/WindowBuilder";
import { Filter, Options } from "../utils/SceneryUtils";

class Settings {
    public static instance: Settings = new Settings();
    private constructor() { }

    public readonly filter: Filter = {
        banner: true,
        entrance: true,
        footpath: true,
        footpath_addition: true,
        large_scenery: true,
        small_scenery: true,
        track: true,
        wall: true,
    };
    public readonly options: Options = {
        rotation: 0,
        mirrored: false,
        absolute: false,
        height: 0,
        ghost: false,
    };

    public build(builder: BoxBuilder): void {
        const rotationLabel: () => string = () => String(this.options.rotation === 0 ? "none" : (this.options.rotation * 90 + " deg"));
        const mirroredLabel: () => string = () => "Mirrored: " + (this.options.mirrored ? "yes" : "no");
        const absoluteLabel: () => string = () => this.options.absolute ? "Absolute height" : "Relative to surface";

        const hbox = builder.getHBox([1, 1]);
        {
            const group = hbox.getGroupBox();
            for (let key in this.filter)
                group.addCheckbox({
                    text: StringUtils.toDisplayString(key),
                    isChecked: this.filter[key],
                    onChange: isChecked => this.filter[key] = isChecked,
                });
            hbox.addGroupBox({
                text: "Filter",
            }, group);
        } {
            const group = hbox.getGroupBox();
            {
                const rotation = group.getHBox([1, 1]);
                rotation.addLabel({
                    text: "Rotation:",
                });
                rotation.addSpinner({
                    text: rotationLabel(),
                    name: "options_rotation",
                    onDecrement: () => {
                        this.options.rotation = (this.options.rotation + 3) & 3;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_rotation").text = rotationLabel();
                    },
                    onIncrement: () => {
                        this.options.rotation = (this.options.rotation + 1) & 3;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_rotation").text = rotationLabel();
                    },
                });
                group.addBox(rotation);
            }
            group.addTextButton({
                text: mirroredLabel(),
                name: "options_mirrored",
                onClick: () => {
                    this.options.mirrored = !this.options.mirrored;
                    SceneryManager.handle.findWidget<ButtonWidget>("options_mirrored").text = mirroredLabel();
                },
            });
            group.addTextButton({
                text: absoluteLabel(),
                name: "options_absolute",
                onClick: () => {
                    this.options.absolute = !this.options.absolute;
                    SceneryManager.handle.findWidget<ButtonWidget>("options_absolute").text = absoluteLabel();
                },
            });
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel({
                    text: "Height offset:",
                });
                heightOffset.addSpinner({
                    text: String(this.options.height),
                    name: "options_height",
                    onDecrement: () => {
                        this.options.height--;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.options.height);
                    },
                    onIncrement: () => {
                        this.options.height++;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.options.height);
                    },
                });
                group.addBox(heightOffset);
            }
            // group.addSpace();
            // group.addSpace();
            // group.addSpace();
            // group.addSpace();
            hbox.addGroupBox({
                text: "Options",
            }, group);
        }
        builder.addBox(hbox);
    }
}
export default Settings.instance;
