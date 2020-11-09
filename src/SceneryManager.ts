/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import CopyPaste from "./widgets/CopyPaste";
import Settings from "./widgets/Settings";
import Clipboard from "./widgets/Clipboard";
import Library from "./widgets/Library";
import LibraryManager from "./widgets/LibraryManager";
import Configuration from "./widgets/Configuration";
import About from "./widgets/About";
import { TabBuilder, Margin } from "./gui/WindowBuilder";

export class SceneryManager {
    static readonly TAB_MAIN: number = 0;
    static readonly TAB_LIBRARY: number = 1;
    static readonly TAB_CONFIGURATION: number = 2;
    static readonly TAB_ABOUT: number = 3;

    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;
    readonly libraryManager: LibraryManager;
    readonly configuration: Configuration;
    readonly about: About;

    handle: Window = undefined;
    isToolActive: boolean = false;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);
        this.libraryManager = new LibraryManager(this);
        this.configuration = new Configuration(this);
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

        const configurationTab: TabBuilder = new TabBuilder(384);
        if (tabIndex === SceneryManager.TAB_CONFIGURATION)
            this.configuration.build(configurationTab);

        const aboutTab: TabBuilder = new TabBuilder(384, 8, Margin.uniform(8));
        if (tabIndex === SceneryManager.TAB_ABOUT)
            this.about.build(aboutTab);

        const activeTab = [mainTab, libraryTab, configurationTab, aboutTab][tabIndex];
        if (x === undefined)
            x = (ui.width - activeTab.getWidth()) / 2;
        if (y === undefined)
            y = (ui.height - activeTab.getHeight()) / 2;

        this.handle = ui.openWindow({
            classification: "scenery-manager",
            x: x,
            y: y,
            width: activeTab.getWidth(),
            height: activeTab.getHeight(),
            title: "Scenery Manager",
            tabs: [{
                image: 5465,
                widgets: mainTab.getWidgets(),
            }, {
                image: {
                    frameBase: 5277,
                    frameCount: 7,
                    frameDuration: 4,
                },
                widgets: libraryTab.getWidgets(),
            }, {
                image: {
                    frameBase: 5205,
                    frameCount: 16,
                    frameDuration: 4,
                },
                widgets: configurationTab.getWidgets(),
            }, {
                image: {
                    frameBase: 5367,
                    frameCount: 8,
                    frameDuration: 4,
                },
                widgets: aboutTab.getWidgets(),
            }],
            tabIndex: tabIndex,
            onClose: () => {
                this.handle = undefined;
                if (this.isToolActive)
                    ui.tool.cancel();
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
