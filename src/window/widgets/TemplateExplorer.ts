/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { File, } from "../../persistence/File";
import FileExplorer from "./FileExplorer";
import * as Coordinates from "../../utils/Coordinates";

export default abstract class extends FileExplorer {
    constructor(height: number) {
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
        }, height);
    }

    protected getItem(file: File): ListViewItem {
        const data = file.getContent<TemplateData>();
        const size = Coordinates.getSize(Coordinates.toMapRange(data.tiles));
        return [file.name, String(size.x), String(size.y), String(data.elements.length)];
    }
};
