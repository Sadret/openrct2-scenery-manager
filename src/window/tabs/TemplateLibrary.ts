/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as StartUp from "../../StartUp";
import * as Storage from "../../persistence/Storage";

import FileExplorer from "../widgets/FileExplorer";
import GUI from "../../gui/GUI";
import Template from "../../template/Template";
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

            openFile(file: IFile): void {
                Clipboard.addTemplate(new Template(file.getContent<TemplateData>()));
            }
        }(),
    ),
);
