/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";

export default new GUI.Tab({
    image: {
        frameBase: 5327,
        frameCount: 8,
        frameDuration: 4,
    },
    padding: 8,
    margin: GUI.Margin.uniform(8),
}).add(
    new GUI.Label({ text: "Version:  2.0.2  (2023-06-24)", }),
    new GUI.GroupBox({ text: "Latest changes" }).add(
        new GUI.Label({ text: "- Fix footpath addition place in safe mode." }),
        new GUI.Label({ text: "- Tertiary colours for large scenery." }),
        new GUI.Space(2),
        new GUI.Label({ text: "- Raw place mode, copy & paste surface / terrain." }),
        new GUI.Label({ text: "- Restrict pasting vertically." }),
        new GUI.Label({ text: "- Height offset in scatter tool." }),
        new GUI.Label({ text: "- NSF (.park) support." }),
        new GUI.Label({ text: "- Object index, jump to instance of object." }),
        new GUI.Label({ text: "- Search and replace scenery and footpaths." }),
        new GUI.Label({ text: "- Multi-select area." }),
    ),
    new GUI.GroupBox({ text: "Known problems" }).add(
        new GUI.Label({ text: "- [Safe mode] Copy / paste does not work well on sloped surfaces." }),
        new GUI.Label({ text: "- [Safe mode] Banner object, text and colour do not copy." }),
        new GUI.Label({ text: "- [Safe mode] Queue layouts do not copy correctly." }),
        new GUI.Label({ text: "- Scroll position resets when list content changes." }),
        new GUI.Label({ text: "- Large scenery does not mirror." }),
        new GUI.Label({ text: "- Trackitecture does not work cross-map." }),
    ),
    new GUI.GroupBox({ text: "Planned features" }).add(
        new GUI.Label({ text: "- Blueprint placing." }),
        new GUI.Label({ text: "- Localisation (language support)." }),
        new GUI.Label({ text: "- Share your creations online." }),
        new GUI.Space(2),
        new GUI.Label({ text: "- (Edit history and undo function.)" }),
        new GUI.Label({ text: "- (Instancing system.)" }),
        new GUI.Space(2),
        new GUI.Label({ text: "- Whatever you propose." }),
    ),
    new GUI.VBox().add(
        new GUI.Label({ text: "Visit GitHub for future updates or to report any issues:" }),
        new GUI.Label({ text: "https://github.com/Sadret/openrct2-scenery-manager" }),
    ),
);
