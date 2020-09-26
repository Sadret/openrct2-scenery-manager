import Oui from "./OliUI";

interface Button {
    text: string,
    onClick(): void,
}

export default function showPrompt(title: string, description: string, buttons: Button[]) {
    const window = new Oui.Window("", title);
    window.setWidth(300);
    window.addChild(new Oui.Widgets.Label(description));

    const hBox = new Oui.HorizontalBox();
    window.addChild(hBox);
    buttons.forEach(button => {
        const element = new Oui.Widgets.Button(button.text, button.onClick);
        element.setRelativeWidth(100 / buttons.length);
        hBox.addChild(element);
    });

    window.open();
}

function test() {
    showPrompt("my title", "my desc", [
        { text: "myButton1", onClick: () => console.log("onclick1") },
        { text: "myButton2", onClick: () => console.log("onclick2") },
        { text: "myButton3", onClick: () => console.log("onclick3") },
    ]);
}
