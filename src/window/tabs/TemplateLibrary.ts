/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Events from "../../utils/Events";
import * as GUI from "../../libs/gui/GUI";
import * as Storage from "../../persistence/Storage";

import File from "../../libs/persistence/File";
import FileExplorer from "../widgets/FileExplorer";
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
                Events.startup.bind(() => this.watch(Storage.libraries.templates));
            }

            openFile(file: File<TemplateData>): void {
                Clipboard.load(file.getContent());
            }
        }(),
    ),
);
