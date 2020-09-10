/// <reference path="./../../openrct2.d.ts" />

function insertTileElement(tile: Tile, baseHeight: number, clearanceHeight: number): BaseTileElement {
    var index = findPlacementPosition(tile, baseHeight, clearanceHeight);
    if (index === undefined)
        return undefined;
    var element = tile.insertElement(index);
    element.baseHeight = baseHeight;
    element.clearanceHeight = clearanceHeight;
    return element;
};

function findPlacementPosition(tile: Tile, baseHeight: number, clearanceHeight: number): number {
    for (var index = 0; index < tile.numElements; index++) {
        var element = tile.getElement(index);
        if (element.baseHeight >= clearanceHeight)
            return index;
        if (element.clearanceHeight > baseHeight)
            return undefined;
    }
    return tile.numElements;
};

function getSurface(tile: Tile): SurfaceElement {
    for (var index = 0; index < tile.numElements; index++)
        if (tile.elements[index].type === "surface")
            return <SurfaceElement>tile.elements[index];
}

function getFirstSetBit(n: number) {
    for (let i = 0; n != 0; i++ , n >>= 1) {
        if ((n & 1) == 1)
            return i;
    }
    return undefined;
}
