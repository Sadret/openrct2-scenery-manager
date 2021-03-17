/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";
import CopyPaste from "./tabs/CopyPaste";
import Scatter from "./tabs/Scatter";
import TemplateLibrary from "./tabs/TemplateLibrary";

export default new GUI.WindowManager(
    {
        width: 384,
        height: 0,
        classification: "scenery-manager.main",
        title: "Scenery Manager",
        colours: [7, 7, 6,], // shades of blue
    }, [
        CopyPaste,
        TemplateLibrary,
        Scatter,
    ],
);
