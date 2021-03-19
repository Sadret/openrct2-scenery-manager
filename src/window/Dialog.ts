/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";

export default class extends GUI.WindowManager {
    constructor(title: string, box: GUI.Box, open: boolean = true) {
        super(
            {
                width: 384,
                height: 0,
                classification: "scenery-manager.dialog",
                title: title,
                colours: [7, 7, 6,], // shades of blue
            },
            new GUI.Window().add(
                box,
            ),
        );
        if (open)
            this.open(true);
    }
}
