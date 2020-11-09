/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import LibraryManager from "./LibraryManager";
import About from "./About";
import { TabBuilder, Margin } from "./WindowBuilder";

export class SceneryManager {
    static readonly TAB_MAIN: number = 0;
    static readonly TAB_LIBRARY: number = 1;
    static readonly TAB_ABOUT: number = 2;

    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;
    readonly libraryManager: LibraryManager;
    readonly about: About;

    handle: Window = undefined;
    isToolActive: boolean = false;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);
        this.libraryManager = new LibraryManager(this);
        this.about = new About(this);
    }

    open(x?: number, y?: number, tabIndex: number = 0): void {
        if (this.handle !== undefined)
            return;

        const mainTab: TabBuilder = new TabBuilder(384);
        if (tabIndex === SceneryManager.TAB_MAIN) {
            this.copyPaste.build(mainTab);
            this.settings.build(mainTab);
            this.clipboard.build(mainTab);
            this.library.build(mainTab);
        }

        const libraryTab: TabBuilder = new TabBuilder(384);
        if (tabIndex === SceneryManager.TAB_LIBRARY)
            this.libraryManager.build(libraryTab);

        const aboutTab: TabBuilder = new TabBuilder(384, 8, Margin.uniform(8));
        if (tabIndex === SceneryManager.TAB_ABOUT)
            this.about.build(aboutTab);

        const tabs: TabBuilder[] = [mainTab, libraryTab, aboutTab];

        if (x === undefined)
            x = (ui.width - tabs[tabIndex].getWidth()) / 2;
        if (y === undefined)
            y = (ui.height - tabs[tabIndex].getHeight()) / 2;

        this.handle = ui.openWindow({
            classification: "clipboard",
            x: x,
            y: y,
            width: tabs[tabIndex].getWidth(),
            height: tabs[tabIndex].getHeight(),
            title: "Clipboard",
            tabs: [{
                image: 5465,
                widgets: tabs[0].getWidgets(),
            }, {
                image: {
                    frameBase: 5277,
                    frameCount: 7,
                    frameDuration: 4,
                },
                widgets: tabs[1].getWidgets(),
            }, {
                image: {
                    frameBase: 5367,
                    frameCount: 8,
                    frameDuration: 4,
                },
                widgets: tabs[2].getWidgets(),
            }],
            tabIndex: tabIndex,
            onClose: () => {
                if (this.isToolActive)
                    ui.tool.cancel();
                this.handle = undefined;
            },
            onTabChange: () => this.setActiveTab(this.handle.tabIndex),
        });
    }

    setActiveTab(tabIndex: number) {
        const x = this.handle.x;
        const y = this.handle.y;

        this.handle.close();

        this.open(x, y, tabIndex);
    }

    setToolActive(isToolActive: boolean): void {
        this.isToolActive = isToolActive;
    }
}
