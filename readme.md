# OpenRCT2 Scenery Manager

An OpenRCT2 plug-in to copy and paste scenery, with many more features.

## Installation

1. Make sure that your OpenRCT2 version is up-to-date. You need at least version `0.3.3` (as of 2020-11-19: not yet released) or the current development version.
2. Go to the [releases](https://github.com/Sadret/openrct2-scenery-manager/releases) page and download the `scenery-manager.js` file from the latest release. Save it in the `plugin` subfolder of your OpenRCT2 user directory.\
On Windows, this is usually at `C:Users\{User}\Documents\OpenRCT2\plugin`.
3. Start OpenRCT2. If this is the first time that you use this plug-in, it should show a welcome message.

## Usage

#### Copy and Paste

To open the graphical user interface, click on "Scenery Manager" in the map menu in the upper toolbar of OpenRCT2.

Click the "Select Area" button to activate the selection tool. You can now select an area of the map with click and drag (click the left mouse button and hold it down, move the cursor, release the button).\
Click the button again to cancel the selection.

Click the "Copy area" button to copy the selected region to the clipboard.

Click on any scenery template in the clipboard or the library to paste it. If you now hover the cursor over the map, a ghost of the scenery template will be shown. Click anywhere to place the scenery template at the shown location.

#### Filter

Check or uncheck any of the checkboxes in the filter section of the window. It will affect both copy and paste actions.

#### Options

When pasting a scenery template, rotate or mirror it via the elements in the options section.

There are two different modes how the paste height is calculated:\
\- "Relative to surface" (default): The pasted scenery template has the same height relative to the surface as the original scenery.\
\- "Absolute height": The pasted scenery has the same absolute height as the original scenery.\
Additionally, you can manually change the height with an offset.

#### Clipboard

The clipboard is a simple temporal storage for every copied scenery template. Although it won't be cleared automatically at any point, it should be seen as a short-lived for quick use.

Click on any scenery template in the clipboard to paste it. Once selected, you can also rename, delete, or save it to the library.

#### Library

The library consists of an editable structure of folders and files (i.e. scenery templates), just like any other file system. Here you can store all your creations in a well-ordered manner.\

## Known Problems

- Sloped fences and walls do not copy.
- Banner text and color do not copy.
- Ghost banners sometimes does not show.
- Scroll position resets when list content changes.

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

Follow me on social media to learn about upcoming features:\
YouTube: [Sadret Gaming](https://www.youtube.com/channel/UCLF2DGVDbo_Od5K4MeGNTRQ/) or
Twitter: [@SadretGaming](https://twitter.com/SadretGaming)

## Support Me

If you find any bugs or if you have any ideas for improvements, you can open an issue on GitHub or contact me on Discord: Sadret#2502.

If you like this plug-in, please leave a star on GitHub.

If you really want to support me, you can [buy me a coffee](https://www.BuyMeACoffee.com/SadretGaming).

## Copyright and License

Copyright (c) 2020 Sadret\
The OpenRCT2 plug-in "Scenery Manager" is licensed under the GNU General Public License version 3.
