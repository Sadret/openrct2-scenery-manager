/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as SceneryIndex from "../core/SceneryIndex";

import GUI from "../gui/GUI";
import ObjectList from "./widgets/ObjectList";



export default class extends GUI.WindowManager {
    constructor(
        type: SceneryObjectType,
        callback: (object: SceneryObject) => boolean,
    ) {
        super(
            {
                width: 768,
                height: 0,
                classification: "scenery-manager.object_chooser",
                title: "Select Object",
                colours: [7, 7, 6],
            }, new GUI.Window().add(
                new ObjectList(
                    SceneryIndex.getSceneryIndex(() => { }, []),
                    false,
                    object => callback(object) && this.close(),
                    type,
                ),
            ),
        );
    }
}
