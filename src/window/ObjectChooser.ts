/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Strings from "../utils/Strings";

import GUI from "../gui/GUI";
import ObjectList from "./widgets/ObjectList";

const classification = "scenery-manager.object_chooser";

export default class ObjectChooser extends GUI.WindowManager {
    public constructor(
        type: SceneryObjectType,
        objects: SceneryObject[],
        callback: (object: SceneryObject) => boolean,
    ) {
        ObjectChooser.closeAll();
        const objectList = new ObjectList(
            objects,
            object => callback(object) && this.close(),
            false,
        );
        super(
            {
                width: 512,
                classification: classification,
                title: "Select Object",
                colours: [7, 7, 6],
            }, new GUI.Window().add(
                new GUI.HBox([1, 3, 2, 3, 1]).add(
                    new GUI.Label({
                        text: "Type:",
                    }),
                    new GUI.Label({
                        text: Strings.toDisplayString(type),
                    }),
                    ...objectList.searchWidgets,
                ),
                objectList,
            ),
        );
    }

    public static closeAll(): void {
        ui.getWindow(classification) ?.close();
    }
}
