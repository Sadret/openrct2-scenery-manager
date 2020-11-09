/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { Filter, Options } from "./../utils/SceneryUtils";
import { SceneryManager } from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";

class Settings {
    readonly manager: SceneryManager;

    readonly filter: Filter = {
        footpath: true,
        small_scenery: true,
        wall: true,
        large_scenery: true,
        banner: true,
        footpath_addition: true,
    };
    readonly options: Options = {
        rotation: 0,
        mirrored: false,
        absolute: false,
        height: 0,
        ghost: false,
    };

    constructor(manager: SceneryManager) {
        this.manager = manager;
    }

    build(builder: BoxBuilder): void {
        const rotationLabel: () => string = () => "Rotation: " + (this.options.rotation === 0 ? "none" : (this.options.rotation * 90 + " degree"));
        const mirroredLabel: () => string = () => "Mirrored: " + (this.options.mirrored ? "yes" : "no");
        const absoluteLabel: () => string = () => this.options.absolute ? "Absolute height" : "Relative to surface";

        const hbox = builder.getHBox([1, 1]);
        {
            const group = hbox.getGroupBox();
            for (let key in this.filter)
                group.addCheckbox({
                    text: key,
                    isChecked: this.filter[key],
                    onChange: isChecked => this.filter[key] = isChecked,
                });
            hbox.addGroupBox({
                text: "Filter",
            }, group);
        } {
            const group = hbox.getGroupBox();
            group.addTextButton({
                text: rotationLabel(),
                name: "options_rotation",
                onClick: () => {
                    this.options.rotation = (this.options.rotation + 1) & 3;
                    this.manager.handle.findWidget<ButtonWidget>("options_rotation").text = rotationLabel();
                },
            });
            group.addTextButton({
                text: mirroredLabel(),
                name: "options_mirrored",
                onClick: () => {
                    this.options.mirrored = !this.options.mirrored;
                    this.manager.handle.findWidget<ButtonWidget>("options_mirrored").text = mirroredLabel();
                },
            });
            group.addTextButton({
                text: absoluteLabel(),
                name: "options_absolute",
                onClick: () => {
                    this.options.absolute = !this.options.absolute;
                    this.manager.handle.findWidget<ButtonWidget>("options_absolute").text = absoluteLabel();
                },
            });
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel({
                    text: "Height offset",
                });
                heightOffset.addSpinner({
                    text: String(this.options.height),
                    name: "options_height",
                    onDecrement: () => {
                        this.options.height--;
                        this.manager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.options.height);
                    },
                    onIncrement: () => {
                        this.options.height++;
                        this.manager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.options.height);
                    },
                });
                group.addBox(heightOffset);
            }
            group.addSpace();
            group.addSpace();
            hbox.addGroupBox({
                text: "Options",
            }, group);
        }
        builder.addBox(hbox);
    }
}
export default Settings;
