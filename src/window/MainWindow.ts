/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Events from "../utils/Events";

import About from "./tabs/About";
import Benches from "./tabs/Benches";
import Configuration from "./tabs/Configuration";
import CopyPaste from "./tabs/CopyPaste";
import GUI from "../gui/GUI";
import Objects from "./tabs/Objects";
import Replace from "./tabs/Replace";
import Research from "./tabs/Research";
import Scatter from "./tabs/Scatter";
import TemplateLibrary from "./tabs/TemplateLibrary";

export default new GUI.WindowManager(
    {
        width: 384,
        classification: "scenery-manager.main",
        title: "Scenery Manager",
        colours: [7, 7, 6,], // shades of blue
        onOpen: reOpen => Events.mainWindowOpen.trigger(reOpen),
    }, [
        CopyPaste,
        TemplateLibrary,
        Scatter,
        Benches,
        Objects,
        Replace,
        Configuration,
        Research,
        About,
    ],
);
