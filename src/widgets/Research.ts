/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, Margin } from "../gui/WindowBuilder";
import SceneryManager from "../SceneryManager";

class Research {
    constructor(_manager: SceneryManager) { }

    build(builder: BoxBuilder): void {
        const content = builder.getVBox(4, Margin.uniform(8));
        this.content(content);
        builder.addBox(content);
    }

    content(builder: BoxBuilder) {
        builder.addLabel({ text: "Version: 1.1.3" });
        builder.addSpace(0);
        {
            const group = builder.getGroupBox(builder.padding, builder.margin);

            group.addLabel({ text: "- [BETA] Trackitecture is now supported." });
            group.addLabel({ text: "- Custom scenery is now supported." });

            builder.addGroupBox({ text: "Latest changes" }, group);
        }
        builder.addSpace(0);
        {
            const group = builder.getGroupBox(builder.padding, builder.margin);

            group.addLabel({ text: "- Sloped fences and walls do not copy." });
            group.addLabel({ text: "- Banner text and color do not copy." });
            group.addLabel({ text: "- Large scenery does not mirror." });
            group.addLabel({ text: "- Ghost banners sometimes does not show." });
            group.addLabel({ text: "- Scroll position resets when list content changes." });

            builder.addGroupBox({ text: "Known problems" }, group);
        }
        builder.addSpace(0);
        {
            const group = builder.getGroupBox(builder.padding, builder.margin);

            group.addLabel({ text: "- Colour brush." });
            group.addLabel({ text: "- Path replacing tool." });
            group.addLabel({ text: "- Flood fill tool." });
            group.addSpace(0);
            group.addLabel({ text: "- Trackitecture support." });
            group.addLabel({ text: "- Blueprint placing." });
            group.addLabel({ text: "- Localisation (language support)." });
            group.addLabel({ text: "- Share your creations online." });
            group.addSpace(0);
            group.addLabel({ text: "- (Edit history and undo function.)" });
            group.addLabel({ text: "- (Instancing system.)" });
            group.addSpace(0);
            group.addLabel({ text: "- Whatever you propose." });

            builder.addGroupBox({ text: "Planned features" }, group);
        }
        builder.addSpace(0);
        builder.addLabel({ text: "Visit GitHub for future updates or to report any issues:" });
        builder.addLabel({ text: "https://github.com/Sadret/openrct2-scenery-manager" });
        builder.addSpace(0);
        builder.addLabel({ text: "Follow me on social media to learn about upcoming features:" });
        {
            const hbox = builder.getHBox([1, 1]);
            hbox.addLabel({ text: "YouTube: Sadret Gaming" });
            hbox.addLabel({ text: "Twitter: @SadretGaming" });
            builder.addBox(hbox);
        }
    }
}
export default Research;
