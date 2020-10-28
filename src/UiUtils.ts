/// <reference path="./../../openrct2.d.ts" />

export function showConfirm(title: string, message: string[], callback: (confirmed: boolean) => void, okText: string = "OK", cancelText: string = "Cancel") {
    // const callCallback = (confirmed: boolean) => {
    //     callback(confirmed);
    //     win.setOnClose(null);
    //     if (win.isOpen())
    //         win._handle.close();
    // };
    // const win = new Oui.Window("confirm", title);
    // win.setWidth(256);
    // win._openAtPosition = true;
    // win._x = ui.width / 2 - 128;
    // win._y = ui.height / 2 - 64;
    //
    // message.forEach(line => win.addChild(new Oui.Widgets.Label(line)));
    //
    // const hBox = new Oui.HorizontalBox();
    // {
    //     const ok = new Oui.Widgets.TextButton(okText, () => callCallback(true));
    //     ok.setRelativeWidth(50);
    //     hBox.addChild(ok);
    //
    //     const cancel = new Oui.Widgets.TextButton(cancelText, () => callCallback(false));
    //     cancel.setRelativeWidth(50);
    //     hBox.addChild(cancel);
    // }
    // win.addChild(hBox);
    //
    // win.setOnClose(() => callCallback(false));
    // win.open();
}
