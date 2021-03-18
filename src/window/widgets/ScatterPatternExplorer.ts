/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { File } from "../../persistence/File";
import FileExplorer from "./FileExplorer";

export default abstract class extends FileExplorer {
    constructor(height: number) {
        super({
            columns: [{
                header: "Name",
                ratioWidth: 5,
            }, {
                header: "Density",
                ratioWidth: 3,
            }],
        }, height);
    }

    protected getItem(file: File): ListViewItem {
        const data = file.getContent<ScatterPattern>();
        const density = data.reduce<number>((sum, entry) => sum + entry.weight, 0);
        return [file.name, String(density)];
    }
};
