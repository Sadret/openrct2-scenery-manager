/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import About from "./tabs/About";
import Benches from "./tabs/Benches";
import Configuration from "./tabs/Configuration";
import CopyPaste from "./tabs/CopyPaste";
import GUI from "../gui/GUI";
import ObjectList from "./tabs/ObjectList";
import Research from "./tabs/Research";
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
        Benches,
        ObjectList,
        Configuration,
        Research,
        About,
    ],
);
