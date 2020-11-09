/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/_Save.d.ts" />

import { File } from "./../persistence/File";
import { BoxBuilder } from "./../gui/WindowBuilder";

export class FolderView {
    readonly name: string;
    readonly getWindow: () => Window;

    path: File;
    readonly files: File[] = [];

    selected: File = undefined;

    constructor(name: string, getWindow: () => Window, path: File) {
        this.name = name;
        this.getWindow = getWindow;

        this.open(path);
    }

    getPath(): string {
        return this.path.getPath();
    }

    select(file: File): void {
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

        this.update();
    }

    open(file: File): void {
        if (!file.isFolder())
            return;
        this.path = file;
        this.select(undefined);
    }

    build(builder: BoxBuilder, height: number): void {
        builder.addListView({
            name: this.name,
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
            items: this.getItems(),
            selectedCell: this.getSelectedCell(),
            onClick: (row: number) => this.select(this.files[row]),
        }, height);
    }

    update(): void {
        const widget: ListView = this.getWindow().findWidget(this.name);

        const oldItems: ListViewItem[] | string[] = widget.items;
        const newItems: ListViewItem[] = this.getItems();
        if (!oldItems.deepEquals(newItems))
            widget.items = this.getItems();

        const selectedCell = this.getSelectedCell();
        if (widget.selectedCell ?.row !== selectedCell ?.row)
            widget.selectedCell = selectedCell;
    }

    getItems(): ListViewItem[] {
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

        this.path.getFiles(
        ).filter((file: File) =>
            file.isFolder()
        ).sort((a: File, b: File) =>
            a.getName().localeCompare(b.getName())
        ).forEach((file: File) =>
            addItem(file, [file.getName() + "/", "", "", ""])
        );

        this.path.getFiles(
        ).filter((file: File) =>
            file.isFile()
        ).sort((a: File, b: File) =>
            a.getName().localeCompare(b.getName())
        ).forEach((file: File) => {
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

        return items;
    }

    getSelectedCell(): RowColumn {
        if (this.selected === undefined)
            return undefined;

        for (let row = 0; row < this.files.length; row++) {
            const file: File = this.files[row];
            if (file !== undefined && file.getPath() === this.selected.getPath())
                return {
                    row: row,
                    column: 0,
                };
        }

        this.select(undefined);
        return undefined;
    }
}