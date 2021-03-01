/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/Data.d.ts" />

import BoxBuilder from "../gui/WindowBuilder";
import { File } from "../persistence/File";
import { StorageFileSystem } from "../persistence/Storage";
import * as ArrayUtils from "../utils/ArrayUtils";
import * as StringUtils from "../utils/StringUtils";
import * as StartUp from "../StartUp";

export default abstract class LibraryWidget {
    readonly name: string;

    private path: File;
    private readonly files: File[] = [];

    private selected: File = undefined;

    constructor(name: string, fs: StorageFileSystem) {
        this.name = name;
        StartUp.addTask(() => this.open(fs.getRoot()));
    }

    // must be overridden
    abstract getWindow(): Window;
    abstract getColumns(): ListViewColumn[];
    abstract getItem(file: File): ListViewItem;

    // can be overriden
    onFileDeselect(): void { }
    onFileSelect(): void { }
    onUpdate(): void { }

    // public methods

    getFolder(): File {
        return this.path;
    }

    getSelected(): File {
        return this.selected;
    }

    select(file: File): void {
        if (File.equals(file, this.selected))
            if (file !== undefined && file.isFolder())
                // file is folder and already selected: open folder
                return this.open(file);
            else
                // file is already selected, but not a folder: do nothing
                return;
        else
            if (file !== undefined && File.equals(file, this.path.getParent()))
                // file is not undefined and equals root: open root
                return this.open(file);
            else {
                if (this.selected !== undefined && this.selected.isFile())
                    this.onFileDeselect();

                // file is not selected and does not equal root: update selected
                this.selected = file;

                if (this.selected !== undefined && this.selected.isFile())
                    this.onFileSelect();
            }

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
            columns: this.getColumns(),
            items: this.getItems(),
            selectedCell: this.getSelectedCell(),
            onClick: (row: number) => this.select(this.files[row]),
        }, height);
    }

    public update(): void {
        if (this.getWindow() === undefined) return;

        const widget: ListView = this.getWindow().findWidget(this.name);
        if (widget === null) return;

        const oldItems: ListViewItem[] | string[] = widget.items;
        const newItems: ListViewItem[] = this.getItems();
        if (!ArrayUtils.deepEquals(oldItems, newItems))
            widget.items = this.getItems();

        const selectedCell = this.getSelectedCell();
        if (widget.selectedCell ?.row !== selectedCell ?.row)
            widget.selectedCell = selectedCell;

        this.onUpdate();
    }

    // private methods

    private getItems(): ListViewItem[] {
        const items: ListViewItem[] = [];

        const addItem = (item: File, info: ListViewItem) => {
            this.files.push(item);
            items.push(info);
        };

        this.files.length = 0;

        while (!this.path.isFolder())
            this.open(this.path.getParent());

        if (this.path.getParent() !== undefined)
            addItem(this.path.getParent(), ["../"]);

        this.path.getFiles(
        ).filter((file: File) =>
            file.isFolder()
        ).sort(
            (a: File, b: File) => StringUtils.compare(a.getName(), b.getName())
        ).forEach((file: File) =>
            addItem(file, [file.getName() + "/"])
        );

        this.path.getFiles(
        ).filter((file: File) =>
            file.isFile()
        ).sort(
            (a: File, b: File) => StringUtils.compare(a.getName(), b.getName())
        ).forEach(
            (file: File) => addItem(file, this.getItem(file))
        );

        return items;
    }

    private getSelectedCell(): RowColumn {
        if (this.selected === undefined)
            return undefined;

        for (let row = 0; row < this.files.length; row++) {
            const file: File = this.files[row];
            if (file.getPath() === this.selected.getPath())
                return {
                    row: row,
                    column: 0,
                };
        }

        this.select(undefined);
        return undefined;
    }
}
