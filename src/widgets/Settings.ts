/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as StringUtils from "../utils/StringUtils";
import { BoxBuilder } from "../gui/WindowBuilder";

class Settings {
    public static readonly instance: Settings = new Settings();
    private constructor() { }

    public readonly filter: { [key in ElementType]: boolean } = {
        banner: true,
        entrance: true,
        footpath: true,
        footpath_addition: true,
        large_scenery: true,
        small_scenery: true,
        track: true,
        wall: true,
    };

    public rotation: number = 0;
    public mirrored: boolean = false;
    public height: number = 0;
    public ghost: boolean = false;

    public build(builder: BoxBuilder): void {
        const rotationLabel: () => string = () => (this.rotation === 0 ? "none" : (this.rotation * 90 + " deg"));
        const mirroredLabel: () => string = () => (this.mirrored ? "yes" : "no");

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
                        this.rotation = (this.rotation + 3) & 3;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_rotation").text = rotationLabel();
                    },
                    onIncrement: () => {
                        this.rotation = (this.rotation + 1) & 3;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_rotation").text = rotationLabel();
                    },
                });
                group.addBox(rotation);
            }
            {
                const mirrored = group.getHBox([1, 1]);
                mirrored.addLabel({
                    text: "Mirrored:",
                });
                mirrored.addTextButton({
                    text: mirroredLabel(),
                    name: "options_mirrored",
                    onClick: () => {
                        this.mirrored = !this.mirrored;
                        SceneryManager.handle.findWidget<ButtonWidget>("options_mirrored").text = mirroredLabel();
                    },
                });
                group.addBox(mirrored);
            }
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel({
                    text: "Height offset:",
                });
                heightOffset.addSpinner({
                    text: String(this.height),
                    name: "options_height",
                    onDecrement: () => {
                        this.height--;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.height);
                    },
                    onIncrement: () => {
                        this.height++;
                        SceneryManager.handle.findWidget<SpinnerWidget>("options_height").text = String(this.height);
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
