import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import LibraryManager from "./LibraryManager";
import { TabBuilder } from "./WindowBuilder";

export class SceneryManager {
    static readonly TAB_MAIN: number = 0;
    static readonly TAB_LIBRARY: number = 1;

    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;
    readonly libraryManager: LibraryManager;

    handle: Window = undefined;
    isToolActive: boolean = false;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);
        this.libraryManager = new LibraryManager(this);
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

        const tabs: TabBuilder[] = [mainTab, libraryTab, new TabBuilder(384)];

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
                image: 5459,
                widgets: tabs[0].getWidgets(),
            }, {
                image: 5460,
                widgets: tabs[1].getWidgets(),
            }, {
                image: 5461,
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
