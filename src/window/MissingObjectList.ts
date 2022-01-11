/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";
import Template from "../template/Template";

const listView = new GUI.ListView({
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
}, 256);

const load = new GUI.TextButton({
    text: "Load anyway",
});

const window: GUI.WindowManager = new GUI.WindowManager(
    {
        width: 384,
        height: 0,
        classification: "scenery-manager.missing_objects",
        title: "Missing Objects",
        colours: [7, 7, 6],
    },
    new GUI.Window().add(
        new GUI.Label({
            text: "The following objects from this template are missing:"
        }),
        listView,
        new GUI.HBox([1, 1, 1]).add(
            load,
            new GUI.Space(),
            new GUI.TextButton({
                text: "Cancel",
                onClick: () => window.close(),
            }),
        )
    ),
);

export function open(templateData: TemplateData, loadCallback: Task): void {
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
    listView.setItems(items);

    load.setOnClick(() => {
        window.close();
        loadCallback();
    });

    window.open(true);
}
