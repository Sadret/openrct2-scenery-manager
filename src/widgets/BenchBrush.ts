/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as Brush from "../utils/Brush";
import * as ArrayUtils from "../utils/ArrayUtils";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import { BoxBuilder } from "../gui/WindowBuilder";

class BenchBrush {
    private static TOOL_ID: string = "scenery-manager-bench-brush";

    public static readonly instance: BenchBrush = new BenchBrush();
    private constructor() { }

    private brushShape: number = 1;
    private brushSize: number = 15;

    private entries: string[] = ["rct2.bench1"];
    private objects: Object[] = [undefined];

    private getName(idx: number): string {
        return "bench_dropdown_" + idx;
    }
    private getLabel(object: Object) {
        return object === undefined ? "(empty)" : object.name + " (" + object.identifier + ")";
    }
    private getIndex(entry: string): number {
        return entry === undefined ? 0 : ArrayUtils.findIdx<Object>(this.objects, (object: Object) => object !== undefined && object.identifier === entry);
    };
    private updateEntry: (entryIdx: number, objectIdx: number) => void = (entryIdx: number, objectIdx: number) => {
        this.entries[entryIdx] = this.objects[objectIdx].identifier;
        SceneryManager.handle.findWidget<DropdownWidget>(this.getName(entryIdx)).selectedIndex = objectIdx;
    }

    private onChange(): void {
        const active: boolean = ui.tool && ui.tool.id === BenchBrush.TOOL_ID;
        SceneryManager.reload();
        if (active)
            this.activate();
    }

    private activate(): void {
        Brush.activate((coords: CoordsXY) => {
            const tiles: CoordsXY[] = CoordUtils.circle(coords, this.brushSize);
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
        }, BenchBrush.TOOL_ID, undefined, true);
    }

    public build(builder: BoxBuilder): void {
        {
            this.objects = context.getAllObjects(
                "footpath_addition"
            );
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
                    onClick: () => ui.activateTool({
                        id: "scenery-manager-bench-select",
                        cursor: "cross_hair",
                        onStart: undefined,
                        onDown: e => {
                            const tileCoords = CoordUtils.worldToTileCoords(e.mapCoords);
                            const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
                            const element: BaseTileElement = tile.elements[e.tileElementIndex];
                            if (element.type !== "footpath")
                                return ui.showError("Cannot use this element...", "Element must be a footpath addition.");
                            const footpath: FootpathElement = <FootpathElement>element;
                            if (footpath.addition === null)
                                return ui.showError("Cannot use this element...", "Footpath has no addition.");
                            this.updateEntry(idx, this.getIndex(context.getObject("footpath_addition", footpath.addition).identifier));
                            ui.tool.cancel();
                        },
                        onMove: undefined,
                        onUp: undefined,
                        onFinish: undefined,
                    }),
                });
                hbox.addTextButton({
                    text: "Remove",
                    onClick: () => {
                        this.entries.splice(idx, 1);
                        this.onChange();
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
                    this.onChange();
                },
            });
            pattern.addBox(hbox);

            builder.addGroupBox({
                text: "Pattern",
            }, pattern);
        }
        {
            const brush = builder.getGroupBox();
            const hbox = brush.getHBox([2, 4, 1, 2, 4, 1, 4]);
            hbox.addLabel({
                text: "Size:",
            });
            hbox.addSpinner({
                text: String(this.brushSize),
                name: "bench_brush_size",
                onDecrement: () => {
                    if (this.brushSize !== 1) {
                        this.brushSize--;
                        SceneryManager.handle.findWidget<SpinnerWidget>("bench_brush_size").text = String(this.brushSize);
                    }
                },
                onIncrement: () => {
                    this.brushSize++;
                    SceneryManager.handle.findWidget<SpinnerWidget>("bench_brush_size").text = String(this.brushSize);
                },
            });
            hbox.addSpace();
            hbox.addLabel({
                text: "Shape:",
            });
            hbox.addDropdown({
                items: [
                    "square",
                    "circle",
                ],
                selectedIndex: this.brushShape,
                onChange: (idx: number) => this.brushShape = idx,
            });
            hbox.addSpace();
            hbox.addTextButton({
                text: "Activate",
                onClick: () => this.activate(),
            });
            brush.addBox(hbox);
            builder.addGroupBox({
                text: "Brush",
            }, brush);
        }
    }
}
export default BenchBrush.instance;
