import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import { WindowBuilder } from "./WindowBuilder";

export class SceneryManager {
    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;

    handle: Window = undefined;
    reloadRequested: boolean = false;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);
    }

    open(x?: number, y?: number): void {
        if (this.handle !== undefined)
            return;

        const window: WindowBuilder = new WindowBuilder(384);

        this.copyPaste.build(window);
        this.settings.build(window);
        this.clipboard.build(window);
        this.library.build(window);

        if (x === undefined)
            x = (ui.width - window.getWidth()) / 2;
        if (y === undefined)
            y = (ui.height - window.getHeight()) / 2;

        this.handle = ui.openWindow({
            classification: "clipboard",
            x: x,
            y: y,
            width: window.getWidth(),
            height: window.getHeight(),
            title: "Clipboard",
            widgets: window.getWidgets(),
            onUpdate: () => this.update(),
            // onClose: () => { if (ui.tool) ui.tool.cancel(); },
        });
    }

    invalidate(): void {
        this.reloadRequested = true;
    }

    update(): void {
        if (!this.reloadRequested)
            return;

        const x = this.handle.x;
        const y = this.handle.y;
        this.handle.close();
        this.handle = undefined;

        this.open(x, y);

        this.reloadRequested = false;
    }
}
