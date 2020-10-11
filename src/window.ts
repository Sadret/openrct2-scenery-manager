/// <reference path="./../../openrct2.d.ts" />

import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import * as Options from "./Options";
import * as Clipboard from "./Clipboard";
import * as Library from "./Library";

export default showWindow;

function showWindow(): void {
    Library.init();

    const window = new Oui.Window("clipboard", "Clipboard");
    window.setWidth(384);

    window.addChild(CopyPaste.widget);
    window.addChild(Options.widget);
    window.addChild(Clipboard.widget);
    window.addChild(Library.widget);

    window.open();
}
