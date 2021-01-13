/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, Margin } from "../gui/WindowBuilder";

class About {
    public static readonly instance: About = new About();
    private constructor() { }

    public build(builder: BoxBuilder): void {
        const content = builder.getVBox(8, Margin.uniform(4));
        this.content(content);
        builder.addBox(content);
    }

    private content(builder: BoxBuilder) {
        const separator: string = "++++++++++++++++++++++++++++++++++++++++++++++++++++";

        builder.addLabel({ text: separator });
        builder.addSpace(0);
        this.addText(builder, [
            "Copyright (c) 2020-2021 Sadret",
            "The OpenRCT2 plug-in \"Scenery Manager\" is licensed",
            "under the GNU General Public License version 3.",
        ]);
        builder.addSpace(0);
        builder.addLabel({ text: separator });
        builder.addSpace(0);
        this.addText(builder, [
            "If you like this plug-in, please leave a star on GitHub.",
            "https://github.com/Sadret/openrct2-scenery-manager",
        ]);
        builder.addSpace(0);
        builder.addLabel({ text: separator });
        builder.addSpace(0);
        this.addText(builder, [
            "If you want to support me, you can buy me a coffee:",
            "https://www.BuyMeACoffee.com/SadretGaming",
        ]);
        builder.addSpace(0);
        builder.addLabel({ text: separator });
        builder.addSpace(0);
        this.addText(builder, [
            "If you find any bugs or if you have any ideas for",
            "improvements, you can open an issue on GitHub",
            "or contact me on Discord: Sadret#2502",
        ]);
        builder.addSpace(0);
        builder.addLabel({ text: separator });
    }

    private addText(builder: BoxBuilder, lines: string[]) {
        const hbox = builder.getHBox([1, 8, 1], 0);
        hbox.addSpace(0);

        const vbox = hbox.getVBox(builder.padding);
        lines.forEach((line: string) => vbox.addLabel({ text: line }));
        hbox.addBox(vbox);

        hbox.addSpace(0);
        builder.addBox(hbox);
    }
}
export default About.instance;
