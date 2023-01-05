/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Property from "./Property";

export default class BooleanProperty extends Property<boolean> implements ObservableBoolean {
    public flip(): void {
        this.setValue(!this.getValue());
    }
}
