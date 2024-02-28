module.exports = class InlineKeyboardMarkup {
    constructor(keyboard = []) {
        this.inline_keyboard = keyboard;
    }

    exportJSON = () => {
        return JSON.stringify(this);
    }
}