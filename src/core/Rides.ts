/*****************************************************************************
 * Copyright (c) 2020-2026 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const TRACK_COLOURS = [0, 1, 2];
const VEHICLE_COLOURS = [3, 4, 5];

function getRideObject(ride: Ride | null, rideType: number): number | undefined {
    if (ride !== null && ride.type === rideType)
        return ride.object.index;
    const object = objectManager.getAllObjects("ride").filter(object => object.rideType.indexOf(rideType) !== -1)[0];
    return object && object.index;
}

function copyAppearance(source: Ride | null, rideId: number): void {
    if (source === null)
        return;
    const set = (type: number, value: number, index: number) =>
        context.executeAction("ridesetappearance", { ride: rideId, type: type, value: value, index: index });
    source.colourSchemes.forEach((colour, index) =>
        [colour.main, colour.additional, colour.supports].forEach((value, i) => set(TRACK_COLOURS[i], value, index))
    );
    source.vehicleColours.forEach((colour, index) =>
        [colour.body, colour.trim, colour.tertiary].forEach((value, i) => set(VEHICLE_COLOURS[i], value, index))
    );
}

// Rides of the same type created in the same tick get the same default name.
function setUniqueName(rideId: number, callback: () => void): void {
    const ride = map.getRide(rideId);
    const used = map.rides.filter(other => other.id !== rideId).map(other => other.name);
    if (ride === null || used.indexOf(ride.name) === -1)
        return callback();
    const base = ride.name.replace(/\s+\d+$/, "");
    let number = 1;
    while (used.indexOf(base + " " + number) !== -1)
        number++;
    context.executeAction("ridesetname", { ride: rideId, name: base + " " + number }, () => callback());
}

function createRide(rideId: number, rideType: number, callback: (newId: number | undefined) => void): void {
    const source = map.getRide(rideId) as Ride | null;
    const rideObject = getRideObject(source, rideType);
    if (rideObject === undefined)
        return callback(undefined);
    context.executeAction("ridecreate", {
        rideType: rideType,
        rideObject: rideObject,
        entranceObject: 0,
        colour1: 0,
        colour2: 0,
        inspectionInterval: 0,
    }, result => {
        const newId = (result as GameActionResult & { ride?: number }).ride;
        if (result.error || newId === undefined)
            return callback(undefined);
        copyAppearance(source, newId);
        setUniqueName(newId, () => callback(newId));
    });
}

/*
 * Pasted track and entrances would extend the copied ride, so each copied ride gets a new ride.
 * Rides are created one after the other; elements of rides that could not be created are dropped.
 */
export function remap(
    templateData: TileData[],
    filter: TypeFilter,
    callback: (templateData: TileData[]) => void,
): void {
    const rideTypes: { [rideId: number]: number } = {};
    if (filter("track"))
        templateData.forEach(tileData => tileData.elements.forEach(element => {
            if (element.type === "track" && rideTypes[element.ride] === undefined)
                rideTypes[element.ride] = element.rideType;
        }));
    const rideIds = Object.keys(rideTypes).map(Number);
    const newIds: { [rideId: number]: number | undefined } = {};

    const isRideElement = (element: ElementData): element is TrackData | EntranceData =>
        element.type === "track" || (element.type === "entrance" && element.object !== 2);

    const done = () => {
        const failed = rideIds.filter(rideId => newIds[rideId] === undefined).length;
        if (failed > 0)
            ui.showError("Can't paste rides...", failed + " ride(s) could not be created.");
        callback(templateData.map(tileData => ({
            x: tileData.x,
            y: tileData.y,
            elements: tileData.elements.filter(element =>
                !isRideElement(element) || rideTypes[element.ride] === undefined || newIds[element.ride] !== undefined
            ).map(element =>
                isRideElement(element) && newIds[element.ride] !== undefined
                    ? { ...element, ride: newIds[element.ride] as number }
                    : element
            ),
        })));
    };

    const next = (index: number): void => {
        if (index === rideIds.length)
            return done();
        const rideId = rideIds[index];
        createRide(rideId, rideTypes[rideId], newId => {
            newIds[rideId] = newId;
            next(index + 1);
        });
    };
    next(0);
}
