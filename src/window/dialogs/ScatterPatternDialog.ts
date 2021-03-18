/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import ScatterPatternExplorer from "../widgets/ScatterPatternExplorer";
import * as Storage from "../../persistence/Storage";
import { File } from "../../persistence/File";

export function save(pattern: ScatterPattern, name?: string): void {
    if (name === undefined)
        return ui.showTextInput({
            title: "Pattern name",
            description: "Enter a name for this pattern:",
            callback: name => save(pattern, name),
        });

    const file = Storage.libraries.scatterPattern.getRoot().addFile<ScatterPattern>(name, pattern);
    if (file === undefined)
        return ui.showError("Can't save pattern...", "Pattern with this name already exists!");
}

export function load(callback: (pattern: ScatterPattern) => void) {
    const manager = new GUI.WindowManager(
        {
            width: 384,
            height: 0,
            classification: "scenery-manager.dialog",
            title: "Load Scatter Pattern",
            colours: [7, 7, 6,], // shades of blue
        }, new GUI.Window().add(
            new class extends ScatterPatternExplorer {
                constructor() {
                    super(256);
                    this.watch(Storage.libraries.scatterPattern);
                }

                protected openFile(file: File): void {
                    callback(file.getContent<ScatterPattern>());
                    manager.close();
                }
            }(),
        ),
    );
    manager.open(true);
};
