/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import Property from "../../config/Property";

type SceneryObjectType =
    "footpath_surface" |
    "footpath_railings" |
    "small_scenery" |
    "large_scenery" |
    "wall";

const types: SceneryObjectType[] = [
    "footpath_surface",
    "footpath_railings",
    "small_scenery",
    "large_scenery",
    "wall",
];

type SceneryObjectInfo = {
    type: SceneryObjectType,
    name: string,
    identifier: string,
    count: number,
};

// cf. Template.ts
const library = {
    footpath_surface: [] as SceneryObjectInfo[],
    footpath_railings: [] as SceneryObjectInfo[],
    small_scenery: [] as SceneryObjectInfo[],
    large_scenery: [] as SceneryObjectInfo[],
    wall: [] as SceneryObjectInfo[],
};

types.forEach(type => {
    context.getAllObjects(type).forEach(object => {
        library[type][object.index] = {
            type: type,
            name: object.name,
            identifier: object.identifier,
            count: 0,
        };
    });
});

for (let x = 0; x < map.size.x; x++)
    for (let y = 0; y < map.size.y; y++)
        map.getTile(x, y).elements.forEach(
            element => {
                switch (element.type) {
                    case "large_scenery":
                        if (element.sequence !== 0)
                            return;
                    case "small_scenery":
                    case "wall":
                        return library[element.type][element.object].count++;
                    case "footpath":
                        library["footpath_surface"][element.surfaceObject].count++;
                        library["footpath_railings"][element.railingsObject].count++;
                }
            }
        );

function getItems(): ListViewItem[] {
    const filterType = filterProp.getValue();
    return types.filter(
        type => filterType === "all" || filterType === type
    ).map(
        type => library[type]
    ).reduce(
        (acc, val) => acc.concat(val), []
    ).map(info => [
        Strings.toDisplayString(info.type),
        info.name,
        info.identifier,
        String(info.count),
    ]);
}

const filterProp = new Property<"all" | SceneryObjectType>("all");
const listView: GUI.ListView = new GUI.ListView({
    showColumnHeaders: true,
    columns: [{
        header: "Type",
        width: 128,
    }, {
        header: "Name",
        width: 256,
    }, {
        header: "Identifier",
        width: 256,
    }, {
        header: "Count",
    },],
    items: getItems(),
}, 384);
filterProp.bind(filter => listView.setItems(getItems()));

export default new GUI.Tab({
    frameBase: 5221,
    frameCount: 8,
    frameDuration: 4,
}, undefined, undefined, 768).add(
    new GUI.GroupBox({
        text: "Filter",
    }).add(
        new GUI.HBox([1, 1, 1, 1, 1, 1]).add(
            new GUI.Label({
                text: "Type:"
            }),
            new GUI.Dropdown({
            }).bindValue(filterProp, [
                "all",
                ...types,
            ], Strings.toDisplayString),
        ),
    ),
    listView,
);
