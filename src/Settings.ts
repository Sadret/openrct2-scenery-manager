import { Filter, Options } from "./SceneryUtils";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";

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
        const rotationLabel: string = "Rotation: " + (this.options.rotation === 0 ? "none" : (this.options.rotation * 90 + " degree"));
        const mirroredLabel: string = "Mirrored: " + (this.options.mirrored ? "yes" : "no");
        const absoluteLabel: string = this.options.absolute ? "Absolute height" : "Relative to surface";

        const hbox = builder.getHBox([1, 1]);
        {
            const group = hbox.getGroupBox();
            for (let key in this.filter)
                group.addCheckbox({
                    text: key,
                    isChecked: this.filter[key],
                    onChange: isChecked => {
                        this.filter[key] = isChecked;
                        this.manager.invalidate();
                    },
                });
            hbox.addGroupBox({
                text: "Filter",
            }, group);
        } {
            const group = hbox.getGroupBox();
            group.addTextButton({
                text: rotationLabel,
                onClick: () => {
                    this.options.rotation = (this.options.rotation + 1) & 3;
                    this.manager.invalidate();
                },
            });
            group.addTextButton({
                text: mirroredLabel,
                onClick: () => {
                    this.options.mirrored = !this.options.mirrored;
                    this.manager.invalidate();
                },
            });
            group.addTextButton({
                text: absoluteLabel,
                onClick: () => {
                    this.options.absolute = !this.options.absolute;
                    this.manager.invalidate();
                },
            });
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel({
                    text: "Height offset",
                });
                heightOffset.addSpinner({
                    text: String(this.options.height),
                    onDecrement: () => {
                        this.options.height--;
                        this.manager.invalidate();
                    },
                    onIncrement: () => {
                        this.options.height++;
                        this.manager.invalidate();
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
