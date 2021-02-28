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
import * as PropertyWidget from "../gui/PropertyWidget";

class CopyPaste {
    public static readonly instance: CopyPaste = new CopyPaste();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        // select, copy, paste
        {
            const group = builder.getGroupBox();
            const hbox = group.getHBox([1, 1, 1]);
            hbox.addTextButton({
                text: "Select area",
                onClick: Core.select,
            });
            hbox.addTextButton({
                text: "Copy area",
                onClick: Core.copy,
            });
            hbox.addTextButton({
                text: "Paste template",
                onClick: Core.paste,
            });
            group.addBox(hbox);
            builder.addGroupBox({
                text: "Copy & Paste",
            }, group);
        }
        const hbox = builder.getHBox([1, 1]);
        // filter
        {
            const group = hbox.getGroupBox();
            for (let key in Settings.filter)
                PropertyWidget.addBooleanWidget({
                    box: group,
                    name: "filter_" + key,
                    label: Strings.toDisplayString(key),
                    property: Settings.filter[key],
                });
            hbox.addGroupBox({
                text: "Filter",
            }, group);
        }
        builder.addBox(hbox);
    }
}
export default CopyPaste.instance;
