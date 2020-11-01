import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import { TabBuilder } from "./WindowBuilder";

export class SceneryManager {
    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;

    handle: Window = undefined;
    reloadRequested: boolean = false;
    reloading: boolean = false;
    activeTool: boolean = false;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);
    }

    open(x?: number, y?: number): void {
        if (this.handle !== undefined)
            return;

        const main: TabBuilder = new TabBuilder(384);

        this.copyPaste.build(main);
        this.settings.build(main);
        this.clipboard.build(main);
        this.library.build(main);

        if (x === undefined)
            x = (ui.width - main.getWidth()) / 2;
        if (y === undefined)
            y = (ui.height - main.getHeight()) / 2;

        this.handle = ui.openWindow({
            classification: "clipboard",
            x: x,
            y: y,
            width: main.getWidth(),
            height: main.getHeight(),
            title: "Clipboard",
            tabs: [{
                image: 5459,
                widgets: main.getWidgets(),
            },],
            onUpdate: () => this.update(),
            onClose: () => {
                if (!this.reloading && this.activeTool) {
                    ui.tool.cancel();
                    this.handle == undefined;
                }
            },
        });
    }

    invalidate(): void {
        this.reloadRequested = true;
    }

    update(): void {
        if (!this.reloadRequested)
            return;

        this.reloading = true;

        const x = this.handle.x;
        const y = this.handle.y;
        this.handle.close();
        this.handle = undefined;

        this.open(x, y);

        this.reloadRequested = false;
        this.reloading = false;
    }
}
