/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

class Settings {
    public static instance = new Settings();
    private constructor() { }

    readonly filter: { [key in ElementType]: boolean } = {
        banner: true,
        entrance: true,
        footpath: true,
        footpath_addition: true,
        large_scenery: true,
        small_scenery: true,
        track: true,
        wall: true,
    };

    rotation: number = 0;
    mirrored: boolean = false;
    height: number = 0;
}
export default Settings.instance;
