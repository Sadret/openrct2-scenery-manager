/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";
import CopyPaste from "./../widgets/CopyPaste";
import Settings from "./../widgets/Settings";
import Clipboard from "./../widgets/Clipboard";
import LibraryView from "./../widgets/LibraryView";

class Main {
    readonly manager: SceneryManager;

    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: LibraryView;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new LibraryView(this);
    }

    build(builder: BoxBuilder): void {
        this.copyPaste.build(builder);
        this.settings.build(builder);
        this.clipboard.build(builder);
        this.library.build(builder);
    }
}
export default Main;
