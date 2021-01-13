/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder } from "../gui/WindowBuilder";

class Coloring {
    public static readonly instance: Coloring = new Coloring();
    constructor() { }

    public build(builder: BoxBuilder): void {
        builder.addLabel({ text: "coming soon" });
    }
}
export default Coloring.instance;
