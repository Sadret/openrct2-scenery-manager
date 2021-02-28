/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Core from "../core/Core";
import * as Strings from "../utils/Strings";
import Settings from "../config/Settings";
import BoxBuilder from "../gui/WindowBuilder";
import { PropertyCheckboxWidget, PropertyToggleWidget, PropertySpinnerWidget } from "../gui/PropertyWidget";

class CopyPaste {
    public static readonly instance: CopyPaste = new CopyPaste();

    private widgets = {
        filter: {},
        rotation: undefined as PropertySpinnerWidget,
        mirrored: undefined as PropertyToggleWidget,
        height: undefined as PropertySpinnerWidget,
    };

    private constructor() {
        for (let key in Settings.filter)
            this.widgets.filter[key] = new PropertyCheckboxWidget(Settings.filter[key], "settings.filter." + key);
        this.widgets.rotation = new PropertySpinnerWidget(Settings.rotation, "settings.rotation", value => (value & 3) === 0 ? "none" : ((value & 3) * 90 + " deg"));
        this.widgets.mirrored = new PropertyToggleWidget(Settings.mirrored, "settings.mirrored");
        this.widgets.height = new PropertySpinnerWidget(Settings.height, "settings.height");
    }

    public build(builder: BoxBuilder): void {
        const hbox = builder.getHBox([3, 2]);
        const vbox = hbox.getVBox();
        // select, copy, paste
        {
            const group = vbox.getGroupBox();
            group.addTextButton({
                text: "Select area",
                onClick: Core.select,
            });
            group.addTextButton({
                text: "Copy area",
                onClick: Core.copy,
            });
            group.addTextButton({
                text: "Paste template",
                onClick: Core.paste,
            });
            vbox.addGroupBox({
                text: "Copy & Paste",
            }, group);
        }
        // hack: make both sides the same height
        vbox.addSpace(6);
        // options
        {
            const group = vbox.getGroupBox();
            {
                const rotation = group.getHBox([1, 1]);
                rotation.addLabel({
                    text: "Rotation:",
                });
                this.widgets.rotation.build(rotation);
                group.addBox(rotation);
            }
            {
                const mirrored = group.getHBox([1, 1]);
                mirrored.addLabel({
                    text: "Mirrored:",
                });
                this.widgets.mirrored.build(mirrored);
                group.addBox(mirrored);
            }
            {
                const heightOffset = group.getHBox([1, 1]);
                heightOffset.addLabel({
                    text: "Height offset:",
                });
                this.widgets.height.build(heightOffset);
                group.addBox(heightOffset);
            }
            vbox.addGroupBox({
                text: "Options",
            }, group);
        }
        // finalize vbox
        hbox.addBox(vbox);
        // filter
        {
            const group = hbox.getGroupBox();
            for (let key in Settings.filter)
                this.widgets.filter[key].build(group, Strings.toDisplayString(key));
            hbox.addGroupBox({
                text: "Filter",
            }, group);
        }
        // finalize hbox
        builder.addBox(hbox);
    }
}
export default CopyPaste.instance;
