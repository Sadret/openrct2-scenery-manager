/// <reference path="./../../openrct2.d.ts" />
import Oui from "./OliUI";
import * as Config from "./Config";
import { File } from "./FileSystem";
import * as CopyPaste from "./CopyPaste";
import { FolderView } from "./FolderView";

export function open(): void {
    const window = new Oui.Window("library", "Library");
    window.setWidth(384);
    window._openAtPosition = true;
    window._x = (ui.width - 384) / 2;
    window._y = (ui.height - 128) / 2;

    const currentPath = new Oui.Widgets.Label("");
    window.addChild(currentPath);

    const folderView: FolderView = new class extends FolderView {
        constructor() {
            super(Config.getLibrary());
        }

        onReload() {
            currentPath.setText(this.getPath());
        }

        onFileSelect(file: File) {
            CopyPaste.pasteTemplate(file.content);
        }
    }();
    window.addChild(folderView.widget);

    window.open();
}
