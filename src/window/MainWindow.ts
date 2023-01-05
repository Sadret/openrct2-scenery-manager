/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Events from "../utils/Events";
import * as GUI from "../libs/gui/GUI";

import About from "./tabs/About";
import Benches from "./tabs/Benches";
import Configuration from "./tabs/Configuration";
import CopyPaste from "./tabs/CopyPaste";
import Objects from "./tabs/Objects";
import Replace from "./tabs/Replace";
import Research from "./tabs/Research";
import Scatter from "./tabs/Scatter";
import TemplateLibrary from "./tabs/TemplateLibrary";

export default new GUI.WindowManager(
    {
        width: 384,
        title: "Scenery Manager",
        colours: [7, 7, 6,], // shades of blue
        onOpen: () => Events.mainWindowOpen.trigger(),
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
