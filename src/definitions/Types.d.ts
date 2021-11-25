type Action = "error" | "warning" | "ignore";
type BrushShape = "square" | "circle";
type BuildMode = "down" | "move" | "up";

// no surface or corrupt, but footpath_addition
type ElementType =
    "banner" |
    "entrance" |
    "footpath" |
    "footpath_addition" |
    "large_scenery" |
    "small_scenery" |
    "track" |
    "wall";

type SceneryObjectType =
    "footpath_surface" |
    "footpath_railings" |
    "footpath_addition" |
    "small_scenery" |
    "large_scenery" |
    "wall";
