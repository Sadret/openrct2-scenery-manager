/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import { File } from "../../persistence/File";
import FileExplorer from "../widgets/FileExplorer";
import * as Storage from "../../persistence/Storage";
import * as StartUp from "../../StartUp";
import * as Coordinates from "../../utils/Coordinates";
import * as Clipboard from "../../core/Clipboard";
import * as Core from "../../core/Core";
import Template from "../../template/Template";

export default new GUI.Tab({
    frameBase: 5277,
    frameCount: 7,
    frameDuration: 4,
}).add(
    new class extends FileExplorer {
        constructor() {
            super({
                columns: [{
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
            }, 256);
            StartUp.addTask(() => this.watch(Storage.libraries.templates));
        }

        protected getItem(file: File): ListViewItem {
            const data: TemplateData = file.getContent<TemplateData>();
            const size: CoordsXY = Coordinates.getSize(Coordinates.toMapRange(data.tiles));
            return [file.name, String(size.x), String(size.y), String(data.elements.length)];
        }

        protected openFile(file: File): void {
            Clipboard.addTemplate(new Template(file.getContent<TemplateData>()));
            Core.paste();
        }
    }(),
);
