import Oui from "./OliUI";
import { Filter, Options } from "./SceneryUtils";
import { Window } from "./Window";
import { BoxBuilder } from "./WindowBuilder";

class Settings {
    readonly window: Window;
    readonly widget: any;

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

    constructor(window: Window) {
        this.window = window;
        this.widget = this.getWidget();
    }

    getWidget() {
        const widget = new Oui.HorizontalBox();
        widget.setPadding(0, 0, 0, 0);
        widget.setMargins(0, 0, 0, 0);

        // FILTER
        {
            const vbox = new Oui.GroupBox("Filter");
            vbox.setRelativeWidth(50);
            widget.addChild(vbox);

            for (let key in this.filter) {
                const chckbx = new Oui.Widgets.Checkbox(key, (checked: boolean) => this.filter[key] = checked);
                chckbx.setChecked(this.filter[key]);
                vbox.addChild(chckbx);
            }
        }

        // OPTIONS
        {
            const vbox = new Oui.GroupBox("Options");
            vbox.setRelativeWidth(50);
            widget.addChild(vbox);

            let getRotationLabel = () => "Rotation: " + (this.options.rotation === 0 ? "none" : (this.options.rotation * 90 + " degree"));
            const rotation = new Oui.Widgets.TextButton(getRotationLabel(), () => {
                this.options.rotation = (this.options.rotation + 1) & 3;
                rotation.setText(getRotationLabel());
            });
            vbox.addChild(rotation);

            let getMirrorLabel = () => "Mirrored: " + (this.options.mirrored ? "yes" : "no");
            const mirror = new Oui.Widgets.TextButton(getMirrorLabel(), () => {
                this.options.mirrored = !this.options.mirrored;
                mirror.setText(getMirrorLabel());
            });
            vbox.addChild(mirror);

            let getAbsoluteLabel = () => this.options.absolute ? "Absolute height" : "Relative to surface";
            const absolute = new Oui.Widgets.TextButton(getAbsoluteLabel(), () => {
                this.options.absolute = !this.options.absolute;
                absolute.setText(getAbsoluteLabel());
            });
            vbox.addChild(absolute);

            const hbox = new Oui.HorizontalBox();
            hbox.setPadding(0, 0, 0, 0);
            hbox.setMargins(0, 0, 0, 0);
            vbox.addChild(hbox);

            const label = new Oui.Widgets.Label("Height offset:");
            label.setRelativeWidth(50);
            hbox.addChild(label);

            const spinner = new Oui.Widgets.Spinner(this.options.height, 1, (value: number) => this.options.height = value);
            spinner.setRelativeWidth(50);
            hbox.addChild(spinner);
        }

        return widget;
    }

    build(builder: BoxBuilder): void {
        const hbox = builder.getHBox([1, 1]);
        {
            const group = hbox.getGroupBox();
            for (let key in this.filter)
                group.addCheckbox(key);
            hbox.addGroupBox("Filter", group);
        } {
            const group = hbox.getGroupBox();
            group.addTextButton("Rotation: none");
            group.addTextButton("Mirrored: no");
            group.addTextButton("Relative to surface");
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel("Height offset");
                heightOffset.addSpinner("0");
                group.addBox(heightOffset);
            }
            hbox.addGroupBox("Options", group);
        }
        builder.addBox(hbox);
    }
}
export default Settings;
