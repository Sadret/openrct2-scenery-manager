/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import FileView from "./FileView";

export default class extends FileView<ScatterPattern> {
    constructor(height?: number) {
        super(
            [{
                header: "Name",
                ratioWidth: 5,
            }, {
                header: "Density",
                ratioWidth: 1,
            }],
            height,
        );
    }

    getItem(file: IFile<ScatterPattern>): ListViewItem {
        const data = file.getContent();
        const density = data && data.reduce<number>((sum, entry) => sum + entry.weight, 0);
        return [file.getName(), density === undefined ? "" : (String(density) + "%")];
    }
};
