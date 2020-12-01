/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder } from "./../gui/WindowBuilder";
import Clipboard from "./../widgets/Clipboard";
import CopyPaste from "./../widgets/CopyPaste";
import LibraryView from "./../widgets/LibraryView";
import Settings from "./../widgets/Settings";
import SceneryManager from "./../SceneryManager";

class Main {
    readonly manager: SceneryManager;

    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly libraryView: LibraryView;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.libraryView = new LibraryView(this);
    }

    build(builder: BoxBuilder): void {
        this.copyPaste.build(builder);
        this.settings.build(builder);
        this.clipboard.build(builder);
        this.libraryView.build(builder);
    }
}
export default Main;
