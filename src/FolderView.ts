import Oui from "./OliUI";
import { Folder, File, FileSystem } from "./FileSystem";

export class FolderView {
    readonly widget: any;;
    readonly folderStack: Folder[] = [];
    readonly items: (Folder | File)[] = [];
    readonly fileSystem: FileSystem;

    constructor(fileSystem: FileSystem) {
        this.fileSystem = fileSystem;
        this.widget = new Oui.Widgets.ListView();
        this.widget.setHeight(128);
        this.widget.setColumns(["Name", "Width", "Length", "Size"]);
        let columns = this.widget.getColumns();
        for (let idx = 0; idx < 4; idx++)
            columns[idx].setRatioWidth([3, 1, 1, 1][idx]);
        this.widget.setCanSelect(true);
        this.widget.setOnClick((row: number) => {
            let item: (Folder | File) = this.items[row];
            if (item === undefined)
                this.onParentSelect();
            else if ((<any>item).content === undefined)
                this.onFolderSelect(<Folder>item);
            else
                this.onFileSelect(<File>item);
        });
        this.folderStack.push(fileSystem.getRoot());
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

    onParentSelect() {
        this.goUp();
    }

    onFolderSelect(folder: Folder) {
        this.goDown(folder);
    }

    onFileSelect(file: File) {
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

    reload(): void {
        this.items.length = 0;
        this.widget._items.length = 0;
        this.widget.requestRefresh();

        const folder: Folder = this.getFolder();
        if (folder === undefined)
            return;

        const parent: Folder = this.getParent();
        if (parent !== undefined) {
            this.addEmptyItem("../");
            this.items.push(undefined);
        }

        for (let key in folder.folders) {
            let child: Folder = folder.folders[key];
            this.addEmptyItem(child.name + "/");
            this.items.push(child);
        }

        for (let key in folder.files) {
            let child: File = folder.files[key];
            let template: SceneryTemplate = child.content;
            this.widget.addItem([
                template.name,
                String(template.size.x / 32 + 1),
                String(template.size.y / 32 + 1),
                String(template.data.length),
            ]);
            this.items.push(child);
        }

        this.onReload();
    }

    onReload(): void {

    }

    addFolder() {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                if (this.fileSystem.hasFolder(this.getFolder(), name))
                    return ui.showError("Can't create new folder...", "Folder with this name already exists.");
                this.fileSystem.addFolder(this.getFolder(), name);
                this.reload();
            },
        });
    }

    addFile(name: string, content: any): void {
        if (this.fileSystem.hasFile(this.getFolder(), name))
            return ui.showError("Can't create new file...", "File with this name already exists.");
        this.fileSystem.addFile(this.getFolder(), name, content);
        this.reload();
    }
}
