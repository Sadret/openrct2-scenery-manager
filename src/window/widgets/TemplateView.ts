/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Selections from "../../utils/Selections";

import File from "../../libs/persistence/File";
import FileView from "./FileView";

export default class extends FileView<TemplateData> {
    constructor(height?: number) {
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
            height,
        );
    }

    getItem(file: File<TemplateData>): ListViewItem {
        const data = file.getContent();
        if (!data)
            return [
                file.getName(),
                "?",
                "?",
                "?",
            ];

        const range = Selections.toMapRange(data.selection);
        const num: number = data.tiles.reduce((acc, tile) => acc + tile.elements.length, 0);
        return [
            file.getName(),
            String(range.rightBottom.x - range.leftTop.x + 1),
            String(range.rightBottom.y - range.leftTop.y + 1),
            String(num),
        ];
    }
};
