/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BoxBuilder from "../gui/WindowBuilder";
import Brush from "../widgets/Brush";
import SceneryManager from "../SceneryManager";
import * as Arrays from "../utils/Arrays";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as Tools from "../utils/Tools";

class Benches {
    public static readonly instance: Benches = new Benches();
    private constructor() { }

    private entries: string[] = ["rct2.bench1"];
    private objects: Object[] = [undefined];

    private getName(idx: number): string {
        return "bench_dropdown_" + idx;
    }
    private getLabel(object: Object) {
        return object === undefined ? "(empty)" : object.name + " (" + object.identifier + ")";
    }
    private getIndex(entry: string): number {
        return entry === undefined ? 0 : Arrays.findIdx<Object>(this.objects, (object: Object) => object !== undefined && object.identifier === entry);
    };
    private updateEntry: (entryIdx: number, objectIdx: number) => void = (entryIdx: number, objectIdx: number) => {
        this.entries[entryIdx] = this.objects[objectIdx].identifier;
        SceneryManager.handle.findWidget<DropdownWidget>(this.getName(entryIdx)).selectedIndex = objectIdx;
    }

    private provide(tiles: CoordsXY[]): TemplateData {
        return {
            elements: SceneryUtils.read(tiles).filter(
                (element: ElementData) => element.type === "footpath"
            ).map<FootpathAdditionData>((element: ElementData) => ({
                ...element,
                type: "footpath_addition",
                identifier: this.entries[CoordUtils.parity(CoordUtils.worldToTileCoords(element), this.entries.length)],
            })).filter((data: FootpathAdditionData) => data.identifier !== undefined),
            tiles: tiles,
        };
    }

    public build(builder: BoxBuilder): void {
        Brush.build(builder);
        Brush.provider = (tiles: CoordsXY[]) => this.provide(tiles);
        Brush.mode = "move";
        Brush.activate();

        this.objects = context.getAllObjects("footpath_addition");
        this.objects.unshift(undefined);
        const pattern = builder.getGroupBox();

        this.entries.forEach((entry: string, idx: number) => {
            const hbox = pattern.getHBox([10, 4, 4]);
            hbox.addDropdown({
                name: this.getName(idx),
                items: this.objects.map(this.getLabel),
                selectedIndex: this.getIndex(entry),
                onChange: (index: number) => this.updateEntry(idx, index),
            });
            hbox.addTextButton({
                text: "Pick",
                onClick: () => Tools.pick(
                    (element: BaseTileElement) => {
                        if (element.type !== "footpath")
                            return (ui.showError("Cannot use this element...", "Element must be a footpath addition."), false);
                        const footpath: FootpathElement = <FootpathElement>element;
                        if (footpath.addition === null)
                            return (ui.showError("Cannot use this element...", "Footpath has no addition."), false);
                        return (this.updateEntry(idx, this.getIndex(SceneryUtils.getIdentifier({
                            type: "footpath_addition",
                            object: footpath.addition,
                        }))), true);
                    }),
            });
            hbox.addTextButton({
                text: "Remove",
                onClick: () => {
                    this.entries.splice(idx, 1);
                    SceneryManager.reload();
                },
            });
            pattern.addBox(hbox);
        });

        const hbox = pattern.getHBox([14, 4]);
        hbox.addSpace();
        hbox.addTextButton({
            text: "Add",
            onClick: () => {
                this.entries.push(undefined);
                SceneryManager.reload();
            },
        });
        pattern.addBox(hbox);

        builder.addGroupBox({
            text: "Pattern",
        }, pattern);
    }
}
export default Benches.instance;
