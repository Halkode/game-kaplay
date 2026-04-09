export function showDialog(k, title, content, onEnd) {
    const dialogBox = k.add([
        k.rect(k.width() - 20, 48, { radius: 4 }),
        k.pos(10, k.height() - 58),
        k.color(10, 10, 10),
        k.outline(2, k.Color.fromHex("#ffffff")),
        k.fixed(),
        k.z(10000),
        k.area(),
        "dialog"
    ]);

    dialogBox.add([
        k.text(title, { size: 8 }),
        k.pos(6, 4),
        k.color(255, 255, 100),
    ]);

    const contentText = dialogBox.add([
        k.text("", {
            size: 6,
            width: k.width() - 32,
        }),
        k.pos(6, 16),
        k.color(255, 255, 255),
    ]);

    let letterCount = 0;
    let typingFinished = false;
    const totalLetters = content.length;

    const typeTimer = k.loop(0.03, () => {
        letterCount = Math.min(letterCount + 1, totalLetters);
        contentText.text = content.substring(0, letterCount); // Puxa na força bruta
        if (letterCount >= totalLetters) {
            typeTimer.cancel();
            typingFinished = true;
        }
    });

    const advance = () => {
        if (!typingFinished) {
            typeTimer.cancel();
            letterCount = totalLetters;
            contentText.text = content;
            typingFinished = true;
        } else {
            k.destroy(dialogBox);
            clickListener.cancel();
            if (onEnd) onEnd();
        }
    };
    const clickListener = k.onClick(advance);
}
