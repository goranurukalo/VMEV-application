(function () {
    wdtEmojiBundle.defaults.emojiSheets = {
        'emojione': 'images/emoji/sheet_emojione_64_indexed_128.png'
    };

    wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
    wdtEmojiBundle.changeType('emojione');
})();

function myEmojiRenderer(text) {
    return wdtEmojiBundle.render(text);
}