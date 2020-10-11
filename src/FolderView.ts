import * as Config from "./Config";
import Oui from "./OliUI";
import { Folder, File } from "./Config";

export class FolderView {
    readonly widget: any = new Oui.Widgets.ListView();
    readonly folderStack: Folder[] = [];
    readonly items: (Folder | File)[] = [];

    onParentSelect: () => void = undefined;
    onFolderSelect: (folder: Folder) => void = undefined;
    onFileSelect: (file: File) => void = undefined;
    onReload: () => void = undefined;

    getRootInfo: () => string[] = undefined;
    getFolderInfo: (folder: Folder) => string[] = undefined;
    getFileInfo: (file: File) => string[] = undefined;

    constructor(columnNames: string[], columnRatios: number[]) {
        this.widget.setHeight(128);
        this.widget.setColumns(columnNames);
        let columns = this.widget.getColumns();
        for (let idx = 0; idx < columnNames.length; idx++)
            columns[idx].setRatioWidth(columnRatios[idx]);
        this.widget.setCanSelect(true);
        this.widget.setOnClick((row: number) => {
            let item: (Folder | File) = this.items[row];
            if (item === undefined)
                if (this.onParentSelect === undefined)
                    this.goUp();
                else
                    this.onParentSelect();
            else if ((<any>item).content === undefined)
                if (this.onFolderSelect === undefined)
                    this.goDown(<Folder>item);
                else
                    this.onFolderSelect(<Folder>item);
            else
                if (this.onFileSelect !== undefined)
                    this.onFileSelect(<File>item);
        });
    }

    getFolder(): Folder {
        return this.folderStack.length > 0 ? this.folderStack[this.folderStack.length - 1] : undefined;
    }

    getParent(): Folder {
        return this.folderStack.length > 1 ? this.folderStack[this.folderStack.length - 2] : undefined;
    }

    getPath(): string {
        let path: string = "";
        this.folderStack.forEach((folder: Folder) => path += folder.name + "/");
        return path;
    }

    setOnParentSelect(callback: () => void): void {
        this.onParentSelect = callback;
    }

    setOnFolderSelect(callback: (folder: Folder) => void): void {
        this.onFolderSelect = callback;
    }

    setOnFileSelect(callback: (file: File) => void): void {
        this.onFileSelect = callback;
    }

    setOnReload(callback: () => void, executeNow: boolean = true): void {
        this.onReload = callback;
        if (executeNow)
            callback();
    }

    setGetRootInfo(callback: () => string[]): void {
        this.getFolderInfo = callback;
        this.reload();
    }

    setGetFolderInfo(callback: (folder: Folder) => string[]): void {
        this.getFolderInfo = callback;
        this.reload();
    }

    setGetFileInfo(callback: (file: File) => string[]): void {
        this.getFileInfo = callback;
        this.reload();
    }

    goUp(): void {
        this.folderStack.pop();
        this.reload();
    }

    goDown(folder: Folder): void {
        this.folderStack.push(folder);
        this.reload();
    }

    addEmptyItem(name: string) {
        const info: string[] = [];
        info[0] = name;
        for (let idx = 1; idx < this.widget.getColumns().length; idx++)
            info.push("");
        this.widget.addItem(info);
    }

    init(): void {
        this.folderStack.push(Config.getRoot());
        this.reload();
    }

    reload(): void {
        this.items.length = 0;
        this.widget._items.length = 0;
        this.widget.requestRefresh();

        const folder: Folder = this.getFolder();
        if (folder === undefined)
            return;

        const parent: Folder = this.getParent();
        if (parent !== undefined) {
            if (this.getRootInfo === undefined)
                this.addEmptyItem("../");
            else
                this.widget.addItem(this.getRootInfo());
            this.items.push(undefined);
        }

        for (let key in folder.folders) {
            let child: Folder = folder.folders[key];
            if (this.getFolderInfo === undefined)
                this.addEmptyItem(child.name + "/");
            else
                this.widget.addItem(this.getFolderInfo(child));
            this.items.push(child);
        }

        for (let key in folder.files) {
            let child: File = folder.files[key];
            if (this.getFileInfo === undefined)
                this.addEmptyItem(child.name);
            else
                this.widget.addItem(this.getFileInfo(child));
            this.items.push(child);
        }

        if (this.onReload !== undefined)
            this.onReload();
    }

    addFolder() {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                if (Config.hasFolder(this.getFolder(), name))
                    ui.showError("Can't create new folder...", "Folder with this name already exists.");
                else {
                    Config.addFolder(this.getFolder(), name);
                    this.reload();
                }
            },
        });
    }

    addFile(name: string, content: any): void {
        if (Config.hasFile(this.getFolder(), name))
            ui.showError("Can't create new file...", "File with this name already exists.");
        else {
            Config.addFile(this.getFolder(), name, content);
            this.reload();
        }
    }
}
