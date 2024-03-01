class InlineKeyboardMarkup {
    constructor(keyboard = []) {
        this.inline_keyboard = keyboard;
    }

    exportJSON = () => {
        return JSON.stringify(this);
    }
}

module.exports = InlineKeyboardMarkup