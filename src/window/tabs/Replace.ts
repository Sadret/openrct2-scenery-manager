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
    ride: [] as SceneryObjectInfo[],
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
                            break;
                    case "small_scenery":
                    case "wall":
                        library[element.type][element.object].count++;
                        break;
                    case "footpath":
                        library["footpath_surface"][element.surfaceObject].count++;
                        library["footpath_railings"][element.railingsObject].count++;
                        break;
                }
            }
        );

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
}, 384);

const filterProp = new Property<"all" | SceneryObjectType>("all");
const searchProp = new Property<string>("");

function updateItems(): void {
    const filterType = filterProp.getValue();
    const items = types.filter(
        type => filterType === "all" || filterType === type
    ).map(
        type => library[type]
    ).reduce(
        (acc, val) => acc.concat(val), []
    ).filter(
        info => {
            const name = info.name.toLowerCase();
            const identifier = info.identifier.toLowerCase();
            const search = searchProp.getValue().toLowerCase();
            return name.includes(search) || identifier.includes(search);
        }
    );

    listView.setItems(items.map(info => [
        Strings.toDisplayString(info.type),
        info.name,
        info.identifier,
        String(info.count),
    ]));
    listView.setOnClick(index => onClick(items[index]));
}
filterProp.bind(updateItems);
searchProp.bind(updateItems);

function onClick(info: SceneryObjectInfo): void {
    console.log(info);
}

export default new GUI.Tab({
    frameBase: 5221,
    frameCount: 8,
    frameDuration: 4,
}, undefined, undefined, 768).add(
    new GUI.HBox([1, 3]).add(
        new GUI.Label({
            text: "Search for name or identifier:",
        }),
        new GUI.TextBox({
        }).bindValue(searchProp),
        new GUI.TextButton({
            text: "clear",
            onClick: () => searchProp.setValue(""),
        })
    ),
    new GUI.GroupBox({
        text: "Filter",
    }).add(
        new GUI.HBox([10, 10, 2, 8, 1, 2, 8, 1, 2, 8, 1]).add(
            new GUI.Label({
                text: "Type:"
            }),
            new GUI.Dropdown({
            }).bindValue(filterProp, [
                "all",
                ...types,
            ], Strings.toDisplayString),
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Primary Colour:",
            }),
            new GUI.ColourPicker({
            }),
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Secondary Colour:",
            }),
            new GUI.ColourPicker({
                isDisabled: true,
            }),
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Secondary Colour:",
            }),
            new GUI.ColourPicker({
            }),
        ),
    ),
    listView,
);
