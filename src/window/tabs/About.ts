/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../../libs/gui/GUI";

const text = [
    [
        "Copyright (c) 2020-2022 Sadret",
        "The OpenRCT2 plugin \"Scenery Manager\" is licensed",
        "under the GNU General Public License version 3.",
    ], [
        "If you like this plugin, please leave a star on GitHub.",
        "https://github.com/Sadret/openrct2-scenery-manager",
    ], [
        "If you want to support me, you can buy me a coffee:",
        "https://ko-fi.com/sadret",
    ], [
        "If you find any bugs or if you have any ideas for",
        "improvements, you can open an issue on GitHub",
        "or contact me on Discord: Sadret#2502",
    ],
];
const separator = "+++++++++++++++++++++++++++++++++++++++++++++++++++";

export default new GUI.Tab({
    image: {
        frameBase: 5367,
        frameCount: 8,
        frameDuration: 4,
    },
    padding: 0,
    margin: GUI.Margin.uniform(8),
}).add(
    ...text.map(lines => new GUI.Vertical({
        padding: 0,
        margin: GUI.Margin.none,
    }).add(
        new GUI.Label({
            text: separator,
            textAlign: "centred",
        }),
        new GUI.Vertical({
            padding: 8,
            margin: GUI.Margin.uniform(16),
        }).add(
            ...lines.map(line => new GUI.Label({
                text: line,
                textAlign: "centred",
            })),
        ),
    )),
    new GUI.Label({
        text: separator,
        textAlign: "centred",
    }),
);
