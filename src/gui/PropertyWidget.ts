/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { Property } from "../config/Property";
import { BoxBuilder } from "../gui/WindowBuilder";
import * as WindowManager from "../window/WindowManager";

export function addBooleanWidget(data: { box: BoxBuilder, name: string, label: string, property: Property<boolean> }) {
    data.box.addCheckbox({
        name: data.name,
        text: data.label,
        isChecked: data.property.getValue(),
        onChange: isChecked => data.property.setValue(isChecked),
    });
    data.property.addListener(value => WindowManager.getWidget<CheckboxWidget>(data.name).isChecked = value);
}
