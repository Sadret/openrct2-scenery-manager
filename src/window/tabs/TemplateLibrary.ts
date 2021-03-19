/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import * as Storage from "../../persistence/Storage";
import * as Clipboard from "../../core/Clipboard";
import * as Core from "../../core/Core";
import * as Library from "../../core/Library";
import Template from "../../template/Template";
import * as StartUp from "../../StartUp";
import FileExplorer from "../widgets/FileExplorer";
import * as Coordinates from "../../utils/Coordinates";
import { File } from "../../persistence/File";

const explorer = new class extends FileExplorer {
    constructor() {
        super(
            [{
                header: "Name",
                ratioWidth: 5,
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
            256,
        );
    }

    getItem(file: File): ListViewItem {
        const data = file.getContent<TemplateData>();
        const size = Coordinates.getSize(Coordinates.toMapRange(data.tiles));
        return [file.getName(), String(size.x), String(size.y), String(data.elements.length)];
    }

    openFile(file: File): void {
        Clipboard.addTemplate(new Template(file.getContent<TemplateData>()));
        Core.paste();
    }
}();
StartUp.addTask(() => explorer.watch(Storage.libraries.templates));

export default new GUI.Tab({
    frameBase: 5277,
    frameCount: 7,
    frameDuration: 4,
}).add(
    explorer,
    new GUI.HBox([1, 1, 1]).add(
        new GUI.TextButton({
            text: "Paste",
            onClick: () => {
                const file = explorer.getSelectedFile();
                if (file === undefined)
                    return ui.showError("Can't paste template...", "No file selected!");
                Clipboard.addTemplate(new Template(file.getContent<TemplateData>()));
                Core.paste();
            },
        }),
        new GUI.TextButton({
            text: "Rename",
            onClick: () => {
                const file = explorer.getSelectedFile();
                if (file === undefined)
                    return ui.showError("Can't rename file...", "No file selected!");
                Library.renameFile(file);
            },
        }),
        new GUI.TextButton({
            text: "Delete",
            onClick: () => {
                const file = explorer.getSelectedFile();
                if (file === undefined)
                    return ui.showError("Can't delete file...", "No file selected!");
                Library.deleteFile(file);
            },
        }),
    ),
);
