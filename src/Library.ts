import Oui from "./OliUI";
import { SceneryGroup } from "./SceneryUtils";
import * as Config from "./Config";
import { Folder, File } from "./Config";

class FolderView {
    readonly widget: any = new Oui.Widgets.ListView();
    readonly folderStack: Folder[] = [Config.root];
    readonly items: (Folder | File)[] = [];

    onParentSelect: () => void = undefined;
    onFolderSelect: (folder: Folder) => void = undefined;
    onFileSelect: (file: File) => void = undefined;
    onReload: () => void = undefined;

    constructor() {
        this.widget = new Oui.Widgets.ListView();
        this.widget.setColumns(["Name", "Width", "Length", "Size"]);
        let columns = this.widget.getColumns();
        columns[0].setRatioWidth(3);
        columns[1].setRatioWidth(1);
        columns[2].setRatioWidth(1);
        columns[3].setRatioWidth(1);
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
        this.reload();
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

    goUp(): void {
        this.folderStack.pop();
        this.reload();
    }

    goDown(folder: Folder): void {
        this.folderStack.push(folder);
        this.reload();
    }

    reload(): void {
        this.widget._items.length = 0;
        this.items.length = 0;
        this.widget.requestRefresh();


        const folder: Folder = this.getFolder();
        if (folder === undefined)
            return;

        const parent: Folder = this.getParent();
        if (parent !== undefined) {
            this.widget.addItem(["../", "", "", ""]);
            this.items.push(undefined);
        }

        for (let key in folder.folders) {
            let child: Folder = folder.folders[key];
            this.widget.addItem([child.name + "/", "", "", ""]);
            this.items.push(child);
        }

        for (let key in folder.files) {
            let child: File = folder.files[key];
            let group: SceneryGroup = (child.content);
            this.widget.addItem([group.name, String(group.size.x), String(group.size.y), String(group.objects.length)]);
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

export const widget = new Oui.GroupBox("Library");

const currentPath = new Oui.Widgets.Label("");
widget.addChild(currentPath);

const folderView: FolderView = new FolderView();
widget.addChild(folderView.widget);
folderView.setOnReload(() => currentPath.setText(folderView.getPath()));

widget.addChild(new Oui.Widgets.TextButton("Add new folder", () => folderView.addFolder()));

export function save(group: SceneryGroup) {
    if (group.name === undefined)
        ui.showTextInput({
            title: "Scenery group name",
            description: "Enter a name for the scenery group:",
            callback: name => {
                save({
                    ...group,
                    name: name,
                });
            },
        });
    else
        folderView.addFile(group.name, group);
}
