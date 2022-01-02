type Action =
    "error" |
    "warning" |
    "ignore";

type BrushShape =
    "square" |
    "circle";

type BuildMode =
    "down" |
    "move" |
    "up";

type PlaceMode =
    "safe_merge" |
    "safe_replace" |
    "raw_merge" |
    "raw_replace";

type CursorMode =
    "surface" |
    "scenery";

type SceneryFilterType =
    "footpath" |
    "small_scenery" |
    "large_scenery" |
    "wall";

// TODO: move?
type ElementFilter = (element: TileElement | ElementData, addition: boolean) => boolean;
