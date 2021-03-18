/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import { File } from "../../persistence/File";
import * as Storage from "../../persistence/Storage";
import * as Clipboard from "../../core/Clipboard";
import * as Core from "../../core/Core";
import * as Library from "../../core/Library";
import Template from "../../template/Template";
import * as StartUp from "../../StartUp";
import TemplateExplorer from "../widgets/TemplateExplorer";

const explorer = new class extends TemplateExplorer {
    constructor() {
        super(256);
    }

    protected openFile(file: File): void {
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
