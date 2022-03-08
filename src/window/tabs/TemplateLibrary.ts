/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Events from "../../utils/Events";
import * as Storage from "../../persistence/Storage";

import FileExplorer from "../widgets/FileExplorer";
import GUI from "../../gui/GUI";
import TemplateView from "../widgets/TemplateView";

export default new GUI.Tab({
    image: {
        frameBase: 5277,
        frameCount: 7,
        frameDuration: 4,
    },
}).add(
    new FileExplorer(
        new class extends TemplateView {
            constructor() {
                super();
                Events.startup.register(() => this.watch(Storage.libraries.templates));
            }

            openFile(file: IFile<TemplateData>): void {
                Clipboard.load(file.getContent());
            }
        }(),
    ),
);
