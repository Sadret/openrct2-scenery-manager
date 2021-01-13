/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Storage from "../persistence/Storage";
import { BoxBuilder } from "../gui/WindowBuilder";

export type Action = "error" | "warning" | "ignore";

export function getOnMissingElement(): Action {
    switch (Storage.get<number>("onMissingElement")) {
        case 0: return "error";
        case 1: return "warning";
        case 2: return "ignore";
    }
}

class Configuration {
    public static readonly instance: Configuration = new Configuration();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        {
            const hbox = builder.getHBox([3, 1]);
            hbox.addLabel({
                text: "behaviour if element unavailable:",
            });
            hbox.addDropdown({
                items: [
                    "error",
                    "warning",
                    "ignore",
                ],
                selectedIndex: Storage.get<number>("onMissingElement"),
                onChange: (idx: number) => Storage.set<number>("onMissingElement", idx),
            });
            builder.addBox(hbox);
        }
    }
}
export default Configuration.instance;
