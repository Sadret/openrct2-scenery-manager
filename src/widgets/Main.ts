/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Clipboard from "./Clipboard";
import CopyPaste from "./CopyPaste";
import LibraryView from "./LibraryView";
import Settings from "./Settings";
import { BoxBuilder } from "../gui/WindowBuilder";

class Main {
    public static readonly instance: Main = new Main();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        CopyPaste.build(builder);
        Settings.build(builder);
        Clipboard.build(builder);
        LibraryView.build(builder);
    }
}
export default Main.instance;
