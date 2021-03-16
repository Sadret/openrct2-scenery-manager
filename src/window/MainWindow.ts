/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";
import CopyPaste from "./tabs/CopyPaste";
import Scatter from "./tabs/Scatter";

export default new GUI.WindowManager(384, [CopyPaste, Scatter]);
