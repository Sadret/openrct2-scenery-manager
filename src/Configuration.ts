/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./_Save.d.ts" />

import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";

class Configuration {
    readonly manager: SceneryManager;

    constructor(manager: SceneryManager) {
        this.manager = manager;
    }


    build(builder: BoxBuilder): void {
        const hbox: BoxBuilder = builder.getHBox([1, 1]);
        hbox.addLabel({ text: "If part of scenery is unavailable:", });
        hbox.addDropdown({
            items: ["Paste available scenery.", "Throw error and prohibit paste."],
            onChange: () => { },
        })
        builder.addBox(hbox);
    }

    update(): void {
    }
}
export default Configuration;
