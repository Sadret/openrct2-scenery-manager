/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import * as Storage from "../../persistence/Storage";
import * as Clipboard from "../../core/Clipboard";
import Template from "../../template/Template";
import * as StartUp from "../../StartUp";
import { File } from "../../persistence/File";
import FileExplorer from "../widgets/FileExplorer";
import TemplateView from "../widgets/TemplateView";

export default new GUI.Tab({
    frameBase: 5277,
    frameCount: 7,
    frameDuration: 4,
}).add(
    new FileExplorer(
        new class extends TemplateView {
            constructor() {
                super();
                StartUp.addTask(() => this.watch(Storage.libraries.templates));
            }

            openFile(file: File): void {
                Clipboard.addTemplate(new Template(file.getContent<TemplateData>()));
            }
        }(),
    ),
);
