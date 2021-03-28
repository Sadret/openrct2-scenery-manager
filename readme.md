# OpenRCT2 Scenery Manager

An OpenRCT2 plug-in to copy and paste scenery, with many more features.

## Installation

1. Make sure that your OpenRCT2 version is up-to-date. You need at least version `0.3.3` or a recent development version.
2. Go to the [releases](https://github.com/Sadret/openrct2-scenery-manager/releases) page and download the `scenery-manager.js` file from the latest release. Save it in the `plugin` subfolder of your OpenRCT2 user directory.\
On Windows, this is usually at `C:Users\{User}\Documents\OpenRCT2\plugin`.
3. Start OpenRCT2. If this is the first time that you use this plug-in, it should show a welcome message.

## Usage

#### User Interface

The preferred way to work with this plug-in is to use hotkeys. Nevertheless, everything can also be done via the Scenery Manager window.\

To open the window the graphical user interface, click on "Scenery Manager" in the map menu in the upper toolbar of OpenRCT2, or simply press the `[W]` key.

If you want to change any hotkey, go to the 'Controls and Interface' tab of OpenRCT2's 'Options' window.

#### Copy and Paste

- Select Area `[CTRL + A]`: Activates the selection tool. You can now select an area of the map with click and drag (click the left mouse button and hold it down, move the cursor, release the button).\
Click the button again to cancel the selection.

- Copy Area `[CTRL + C]`: Copies the selected region to the clipboard and switches to paste mode.

- Paste Area `[CTRL + V]`: Activates the paste mode. If you now hover the cursor over the map, a ghost of the scenery template will be shown. Click anywhere to place the template at the shown location.

- Cut Area `[CTRL + X]`: Copies and then removes the selected area.

- Rotate Template `[Y]`: Rotates the template. Only works in paste mode.

- Mirror Template `[CTRL + M]`: Mirrors the template. Only works in paste mode.

Note that any tool in OpenRCT2 can be cancelled by pressing the `[ESC]` key.

#### Filter

Check or uncheck any of the checkboxes in the filter section of the window. It will affect both copy and paste actions.\
You can also use the `[CTRL + 1]` through `[CTRL + 0]` hotkeys.

#### Additional Copy & Paste Features

- You can paste the template at a certain height offset, which you can set in the 'Options' area of the first tab.

- Another way to change the height is by enabling 'height offset with mouse cursor' in the settings tab. If enabled, hold down the mouse button in paste mode and then move the cursor up and down to adjust the height of the template.

- The same thing as above works with rotation by moving the cursor left or right.

- There are two different area selection modes:
 - "surface" (default): The map tile that the cursor selects is determined by the surface element that the cursor points to. So it ignores any scenery, track or entities.
 - "scenery" (old behaviour): The map tile that the cursor selects is determined by the element directly under the cursor, let it be scenery, track or surface.

 You can change the mode in the 'Options' area or by pressing `[CTRl + T]`.

- By default, if you try to paste a template which includes elements that cannot be pasted on the current map, it gives you an error. This behaviour can be changed in the settings tab.

#### Clipboard

Any copied or loaded template gets added to the clipboard. You can cycle through the entries of the clipboard with the `[Q]` (previous template) and `[E]` (next template) keys. You can delete the current template with the `[CTRL + D]` hotkey.

IMPORTANT: Unlike in previous versions of the Scenery Manager, the clipboard will not be persistent across sessions. If you want o keep your copied templates, save them to the library!

#### Library

The library consists of an editable structure of folders and files (i.e. scenery templates), just like any other file system. Here you can store all your creations in a well-ordered manner.

You can find the library in the second tab. Double-click any template to load it. Alternatively you can use the buttons in the first tab or the hotkeys:

- Load Template `[SHIFT + L]`: Opens a window to select and load a template. The template is then added to the clipboard.

- Save Template `[SHIFT + S]`: Opens a window to save the clipboard's current template to a new file or override and existing one.

#### Scatter Tool

The third tab includes the scatter tool. It is a brush that randomly places scenery from a previously selected palette.\
You can enable 'drag to place' in the settings.

#### Bench Brush

The fourth tab is the bench brush, which works similar to the scatter tool. It can place footpath additions, such as benches, litter bins, lamps or queue TVs, in a predefined pattern onto existing footpaths.

## Known Problems

- Copy / paste does not work well on sloped surfaces.
- Banner text and colour do not copy.
- Large scenery does not mirror.
- Scroll position resets when list content changes.
- Queue layouts do not copy correctly.

## Planned Features

- Colour brush.
- Path replacing tool.
- Flood fill tool.
- Trackitecture support.
- Blueprint placing.
- Localisation (language support).
- Share your creations online.
- (Edit history and undo function.)
- (Instancing system.)
- Whatever you propose.

Subscribe to my YouTube channel to learn about upcoming features:
[Sadret Gaming](https://www.youtube.com/channel/UCLF2DGVDbo_Od5K4MeGNTRQ/)

## Support Me

If you find any bugs or if you have any ideas for improvements, you can open an issue on GitHub or contact me on Discord: Sadret#2502.

If you like this plug-in, please leave a star on GitHub.

If you really want to support me, you can [buy me a coffee](https://www.BuyMeACoffee.com/SadretGaming).

## Copyright and License

Copyright (c) 2020 Sadret\
The OpenRCT2 plug-in "Scenery Manager" is licensed under the GNU General Public License version 3.
