/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as  MapIO from "../core/MapIO";

import ElementIterator from "./ElementIterator";
import GUI from "../gui/GUI";
import Property from "../config/Property";

const defaultLabel = "Jump to next instance";

export default class Jumper {
    private iter: ElementIterator;
    private inParkOnlyProp: Property<boolean>;
    private button: GUI.TextButton;
    private btnLabel: string;

    public constructor(
        matcher: (element: TileElement) => boolean,
        inParkOnlyProp: Property<boolean>,
        button: GUI.TextButton,
    ) {
        this.iter = new ElementIterator(matcher);
        this.inParkOnlyProp = inParkOnlyProp;
        this.button = button;
        this.btnLabel = button.getText() || defaultLabel;

        button.setText(this.btnLabel);
        button.setOnClick(() => this.jump());
    }

    private jump(): void {
        this.button.setText("Searching...");
        this.button.setIsDisabled(true);
        this.iter.next(
            (data, index) => {
                const inParkOnly = this.inParkOnlyProp.getValue();
                if (data === undefined) {
                    ui.showError(
                        `${index === 0 ? "No" : "Last"} element found...`,
                        "Reached end of map!",
                    );
                } else {
                    const tile = data[0];
                    if (inParkOnly && !MapIO.hasOwnership(tile))
                        return this.jump();
                    ui.mainViewport.scrollTo({
                        x: tile.x * 32,
                        y: tile.y * 32,
                        z: data[1].baseZ,
                    });
                }
                this.button.setText(this.btnLabel);
                this.button.setIsDisabled(false);
            },
            (_done, progress) => {
                this.button.setText(`Searching ${Math.floor(progress * 100)}%`);
            },
        );
    }

    public reset(): void {
        this.iter.reset();
        this.button.setText(this.btnLabel);
        this.button.setIsDisabled(false);
    }
};
