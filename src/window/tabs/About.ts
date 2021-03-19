/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";

const text = [
    [
        "Copyright (c) 2020-2021 Sadret",
        "The OpenRCT2 plug-in \"Scenery Manager\" is licensed",
        "under the GNU General Public License version 3.",
    ], [
        "If you like this plug-in, please leave a star on GitHub.",
        "https://github.com/Sadret/openrct2-scenery-manager",
    ], [
        "If you want to support me, you can buy me a coffee:",
        "https://www.BuyMeACoffee.com/SadretGaming",
    ], [
        "If you find any bugs or if you have any ideas for",
        "improvements, you can open an issue on GitHub",
        "or contact me on Discord: Sadret#2502",
    ],
];
const separator = "+++++++++++++++++++++++++++++++++++++++++++++++++++";

export default new GUI.Tab(
    {
        frameBase: 5367,
        frameCount: 8,
        frameDuration: 4,
    },
    0,
    GUI.Margin.uniform(8),
).add(
    ...text.map(lines => new GUI.VBox(0, GUI.Margin.none).add(
        new GUI.Label({
            text: separator,
            textAlign: "centred",
        }),
        new GUI.VBox(8, GUI.Margin.uniform(16)).add(
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
