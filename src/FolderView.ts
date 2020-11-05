/// <reference path="./_Save.d.ts" />

import { File } from "./File";

export class FolderView {
    path: File;
    readonly files: File[] = [];

    selected: File = undefined;

    constructor(path: File) {
        this.path = path;
    }

    getPath(): string {
        return this.path.getPath();
    }

    select(file: File): void {
        this.onDeselect();

        if (File.equals(file, this.selected))
            if (file !== undefined && file.isFolder())
                // file is folder and already selected: open folder
                this.open(file);
            else
                // file is already selected, but not a folder: do nothing
                return;
        else
            if (file !== undefined && File.equals(file, this.path.getParent()))
                // file is not undefined and equals root: open root
                this.open(file);
            else
                // file is not selected and does not equal root: update selected
                this.selected = file;

        this.onSelect();
    }

    onDeselect(): void { }

    onSelect(): void { }

    open(file: File): void {
        if (!file.isFolder())
            return;
        this.path = file;
        this.select(undefined);
    }

    getWidget(): {
        scrollbars: ScrollbarType;
        columns: ListViewColumn[];
        items: ListViewItem[];
        selectedCell: RowColumn;
        onClick: (item: number, column: number) => void;
    } {
        let selectedRow: number = undefined;
        const items: ListViewItem[] = [];

        const addItem = (item: File, info: ListViewItem) => {
            this.files.push(item);
            items.push(info);
        };

        this.files.length = 0;

        while (!this.path.isFolder()) {
            this.path = this.path.getParent();
            this.select(undefined);
        }

        if (this.path.getParent() !== undefined)
            addItem(this.path.getParent(), ["../", "", "", ""]);

        this.path.getFiles().filter((file: File) =>
            file.isFolder()
        ).forEach((file: File) => {
            if (this.selected !== undefined && file.getPath() === this.selected.getPath())
                selectedRow = items.length;
            addItem(file, [file.getName() + "/", "", "", ""]);
        });

        this.path.getFiles().filter((file: File) =>
            file.isFile()
        ).forEach((file: File) => {
            if (this.selected !== undefined && file.getPath() === this.selected.getPath())
                selectedRow = items.length;
            let template: SceneryTemplate = file.getContent();
            if (template === undefined)
                addItem(file, [file.getName(), "", "", ""]);
            else
                addItem(file, [
                    file.getName(),
                    String(template.size.x / 32 + 1),
                    String(template.size.y / 32 + 1),
                    String(template.data.length),
                ]);
        });

        if (selectedRow === undefined)
            this.select(undefined);

        return {
            scrollbars: "vertical",
            columns: [{
                header: "Name",
                ratioWidth: 3,
            }, {
                header: "Width",
                ratioWidth: 1,
            }, {
                header: "Length",
                ratioWidth: 1,
            }, {
                header: "Size",
                ratioWidth: 1,
            }],
            items: items,
            selectedCell: {
                row: selectedRow,
                column: 0,
            },
            onClick: (row: number) => this.select(this.files[row]),
        };
    }
}
