/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";

class Utilities {
    constructor(_manager: SceneryManager) { }

    build(builder: BoxBuilder): void {
        builder.addLabel({ text: "coming soon" });
    }
}
export default Utilities;
