import Oui from "./OliUI";
import { SceneryFilter } from "./SceneryUtils";

export interface Options {
    filter: SceneryFilter;
    rotation: number,
    mirrored: boolean,
    absolute: boolean;
    height: number;
    ghost: boolean;
}

export const options: Options = {
    filter: {
        footpath: true,
        small_scenery: true,
        wall: true,
        large_scenery: true,
        banner: true,
        footpath_addition: true,
    },
    rotation: 0,
    mirrored: false,
    absolute: false,
    height: 0,
    ghost: false,
}

//MARGINS ETC

export const widget = new Oui.HorizontalBox();
widget.setPadding(0, 0, 0, 0);
widget.setMargins(0, 0, 0, 0);

{
    const vbox = new Oui.GroupBox("Filter");
    vbox.setRelativeWidth(50);
    widget.addChild(vbox);

    for (let key in options.filter) {
        const chckbx = new Oui.Widgets.Checkbox(key, (checked: boolean) => options.filter[key] = checked);
        chckbx.setChecked(options.filter[key]);
        vbox.addChild(chckbx);
    }
}

{
    const vbox = new Oui.GroupBox("Options");
    vbox.setRelativeWidth(50);
    widget.addChild(vbox);

    let getRotationLabel = () => "Rotation: " + (options.rotation === 0 ? "none" : (options.rotation * 90 + " degree"));
    const rotation = new Oui.Widgets.TextButton(getRotationLabel(), () => {
        options.rotation = (options.rotation + 1) & 3;
        rotation.setText(getRotationLabel());
    });
    vbox.addChild(rotation);

    let getMirrorLabel = () => "Mirrored: " + (options.mirrored ? "yes" : "no");
    const mirror = new Oui.Widgets.TextButton(getMirrorLabel(), () => {
        options.mirrored = !options.mirrored;
        mirror.setText(getMirrorLabel());
    });
    vbox.addChild(mirror);

    let getAbsoluteLabel = () => options.absolute ? "Absolute height" : "Relative to surface";
    const absolute = new Oui.Widgets.TextButton(getAbsoluteLabel(), () => {
        options.absolute = !options.absolute;
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

    const spinner = new Oui.Widgets.Spinner(options.height, 1, (value: number) => options.height = value);
    spinner.setRelativeWidth(50);
    hbox.addChild(spinner);
}
