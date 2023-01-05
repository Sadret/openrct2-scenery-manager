/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../libs/gui/GUI";

import Template from "../template/Template";

export default class extends GUI.WindowManager {
    constructor(
        templateData: TemplateData,
        loadCallback: Task,
    ) {
        const set = {} as { [key: string]: { [key: string]: true } };
        templateData.tiles.forEach(tileData =>
            tileData.elements.forEach(element =>
                Template.getMissingObjects(element).forEach(object => {
                    set[object.type] ||= { };
                    set[object.type][object.qualifier] = true;
                })
            )
        );

        const items = [] as ListViewItem[];
        Object.keys(set).forEach(type =>
            Object.keys(set[type]).forEach(qualifier =>
                items.push([type, qualifier])
            )
        );

        super(
            {
                width: 384,
                title: "Missing Objects",
                colours: [7, 7, 6],
            },
            new GUI.Window().add(
                new GUI.Label({
                    text: "The following objects from this template are missing:"
                }),
                new GUI.ListView({
                    height: 256,
                    showColumnHeaders: true,
                    canSelect: false,
                    columns: [{
                        header: "Type",
                        width: 128,
                        canSort: true,
                    }, {
                        header: "Identifier",
                        canSort: true,
                    },],
                    items: items,
                }),
                new GUI.Horizontal().add(
                    new GUI.TextButton({
                        text: "Load anyway",
                        onClick: () => {
                            this.close();
                            loadCallback();
                        },
                    }),
                    new GUI.Space(),
                    new GUI.TextButton({
                        text: "Cancel",
                        onClick: () => this.close(),
                    }),
                )
            ),
        );
    }
}
