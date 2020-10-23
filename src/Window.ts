import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import Oui from "./OliUI";

export class Window {
    readonly copyPaste: CopyPaste;
    readonly settings: Settings;
    readonly clipboard: Clipboard;
    readonly library: Library;

    readonly window: any;

    constructor() {
        this.copyPaste = new CopyPaste(this);
        this.settings = new Settings(this);
        this.clipboard = new Clipboard(this);
        this.library = new Library(this);

        this.window = new Oui.Window("clipboard", "Clipboard");
        this.window.setWidth(384);

        this.window.addChild(this.copyPaste.widget);
        this.window.addChild(this.settings.widget);
        this.window.addChild(this.clipboard.widget);
        this.window.addChild(this.library.widget);

        this.window.setOnClose(() => { if (ui.tool) ui.tool.cancel(); });
    }

    open(): void {
        this.window.open();
    }
}
