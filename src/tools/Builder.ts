/*****************************************************************************
 * Copyright (c) 2020-2026 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Map from "../core/Map";
import * as UI from "../core/UI";
import * as Coordinates from "../utils/Coordinates";

import Configuration from "../config/Configuration";

const CONFIRM_WINDOW = "scenery-manager.confirm-paste";

function closeConfirmWindow(): void {
    ui.closeWindows(CONFIRM_WINDOW);
}
import MapIterator from "../utils/MapIterator";
import Tool from "./Tool";

export default abstract class Builder extends Tool {
    protected mode: BuildMode = "down";

    constructor(id: string) {
        super(id);
        this.setCursor("tree_down");
        Configuration.tools.cursorMode.bind(value => this.setFilter(value === "surface" ? ["terrain"] : undefined));
    }

    // ghost
    private coords: CoordsXY | undefined = undefined;
    private offset = Coordinates.NULL;
    private tileData: TileData[] | undefined = undefined;
    private tileSelection: Selection = undefined;
    private placeMode: PlaceMode = "safe";
    // offset of a ghost that waits for confirmation while the tool is released
    private pendingPaste: CoordsXY | undefined = undefined;

    // drag
    private dragStartCoords = Coordinates.NULL;
    private dragEndCoords = Coordinates.NULL;

    protected abstract getTileData(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TileData[] | undefined;
    protected abstract getTileSelection(
        coords: CoordsXY,
        offset: CoordsXY,
    ): Selection;
    protected getFilter(): TypeFilter {
        return () => true;
    }
    protected doAppendToEnd(): boolean {
        return false;
    }
    protected doMergeSurface(): boolean {
        return false;
    }

    private removeGhost(): void {
        if (this.tileData !== undefined) {
            new MapIterator(
                this.tileData,
            ).map(
                Map.getTile,
            ).forEach(
                tile => {
                    Map.read(tile).forEach(element => {
                        if (element.isGhost)
                            Map.remove(tile, element, this.placeMode, false);
                        if (element.type === "footpath" && element.addition !== null && element.isAdditionGhost)
                            Map.remove(tile, element, this.placeMode, true);
                    });
                },
            );
            UI.setTileSelection(undefined);
            this.tileData = [];
            this.tileSelection = [];
        }
    }

    public build(
        isGhost = true,
    ): void {
        if (!this.isActive())
            return;
        this.removeGhost();
        if (this.coords !== undefined && this.coords.x !== 0 && this.coords.y !== 0) {
            if (!isGhost || Configuration.tools.showGhost.getValue()) {
                this.tileData = this.getTileData(this.coords, this.offset);
                if (this.tileData === undefined)
                    return this.cancel();
                this.placeMode = Configuration.tools.placeMode.getValue();
                Map.place(
                    this.tileData,
                    this.placeMode,
                    isGhost,
                    this.getFilter(),
                    this.doAppendToEnd(),
                    this.doMergeSurface(),
                );
            }
            this.tileSelection = this.getTileSelection(this.coords, this.offset);
            if (this.tileSelection === undefined)
                return this.cancel();
            UI.setTileSelection(this.tileSelection);
        }
    }

    public onStart(): void {
        ui.mainViewport.visibilityFlags |= 1 << 7;
    }
    public onDown(
        e: ToolEventArgs,
    ): void {
        // touch input has no hover before the tap
        if (e.mapCoords !== undefined) {
            this.coords = e.mapCoords;
            if (this.mode === "up")
                this.offset = Coordinates.NULL;
        }
        this.dragStartCoords = e.screenCoords;
        if (this.mode !== "up")
            this.build(false);
    }
    public onMove(
        e: ToolEventArgs,
    ): void {
        if (this.mode === "up" && e.isDown) {
            if (!Coordinates.equals(e.screenCoords, this.dragEndCoords)) {
                this.offset = Coordinates.sub(e.screenCoords, this.dragStartCoords);
                return this.build();
            }
        } else {
            if (!Coordinates.equals(e.mapCoords, this.coords)) {
                this.coords = e.mapCoords;
                this.build(this.mode !== "move" || !e.isDown);
            }
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        if (this.mode === "up") {
            if (Configuration.paste.confirm.getValue())
                return this.askConfirmation();
            this.build(false);
            this.offset = Coordinates.NULL;
        }
    }
    /*
     * On touch screens the finger is lifted where it was put down, so the ghost is kept and the tool is released:
     * the camera can move, and the template is only pasted from the confirmation window.
     */
    private askConfirmation(): void {
        this.build();
        this.pendingPaste = this.offset;
        this.cancel();
        if (ui.getWindow(CONFIRM_WINDOW) !== null)
            return;
        ui.openWindow({
            classification: CONFIRM_WINDOW,
            title: "Confirm paste",
            x: 10,
            y: ui.height - 120,
            width: 240,
            height: 66,
            widgets: [{
                type: "label",
                x: 6,
                y: 18,
                width: 228,
                height: 12,
                text: "Move the camera, then paste here.",
            }, {
                type: "button",
                x: 6,
                y: 34,
                width: 74,
                height: 24,
                text: "Paste here",
                onClick: () => {
                    if (!this.resumePaste())
                        return;
                    this.build(false);
                    this.cancel();
                },
            }, {
                type: "button",
                x: 83,
                y: 34,
                width: 74,
                height: 24,
                text: "Move",
                onClick: () => this.resumePaste() && closeConfirmWindow(),
            }, {
                type: "button",
                x: 160,
                y: 34,
                width: 74,
                height: 24,
                text: "Cancel",
                onClick: closeConfirmWindow,
            }],
            onClose: () => {
                if (this.pendingPaste === undefined)
                    return;
                this.pendingPaste = undefined;
                this.removeGhost();
                this.offset = Coordinates.NULL;
            },
        });
    }

    private resumePaste(): boolean {
        const offset = this.pendingPaste;
        if (offset === undefined)
            return false;
        this.pendingPaste = undefined;
        this.activate();
        this.offset = offset;
        return true;
    }

    public onFinish(): void {
        ui.mainViewport.visibilityFlags &= ~(1 << 7);
        if (this.pendingPaste !== undefined)
            return;
        this.removeGhost();
        this.offset = Coordinates.NULL;
        closeConfirmWindow();
    }
}
