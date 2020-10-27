import CopyPaste from "./CopyPaste";
import Settings from "./Settings";
import Clipboard from "./Clipboard";
import Library from "./Library";
import Oui from "./OliUI";
import { WindowBuilder, BoxBuilder } from "./WindowBuilder";

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

    open2(): void {
        const window: WindowBuilder = new WindowBuilder(256);
        window.addLabel("Yy");
        window.addCheckbox("Yy");
        window.addCheckbox("Yy");
        window.addLabel("Yy");
        window.addTextButton("Yy");
        window.addTextButton("Yy");
        window.addLabel("Yy");
        window.addDropdown(["Yy", "this", "is", "it"]);
        window.addDropdown(["Yy", "this", "is", "it"]);
        window.addLabel("Yy");
        window.addSpinner("Yy");
        window.addSpinner("Yy");
        window.addLabel("Yy");
        {
            const groupBox: BoxBuilder = window.getGroupBox();
            groupBox.addLabel("Yy");
            groupBox.addSpinner("Yy");
            groupBox.addLabel("Yy");
            window.addGroupBox("Yy", groupBox);
        }
        window.addLabel("Yy");
        window.addViewport({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            rotation: 0,
            zoom: 0,
            visibilityFlags: 0,
            getCentrePosition: () => undefined,
            moveTo: () => { },
            scrollTo: () => { },
        }, 64);
        window.addLabel("Yy");
        {
            const hbox: BoxBuilder = window.getHBox([1, 1,]);
            hbox.addLabel("Yy");
            hbox.addLabel("Yy");
            window.addBox(hbox);
        }
        {
            const hbox: BoxBuilder = window.getHBox([1, 1,]);
            hbox.addCheckbox("Yy");
            {
                const vbox: BoxBuilder = hbox.getVBox();
                vbox.addTextButton("Yy");
                vbox.addTextButton("Yy");
                hbox.addBox(vbox);
            }
            window.addBox(hbox);
        }

        ui.openWindow({
            classification: "clipboard",
            x: 500,
            y: 100,
            width: window.getWidth(),
            height: window.getHeight(),
            title: "Clipboard",
            widgets: window.getWidgets(),
        });
    }
}
