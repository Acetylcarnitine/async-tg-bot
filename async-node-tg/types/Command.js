class Command {
    constructor (
        body,
        callback,
        separator,
        args,
        errorMessage
    ) {
        this.body = body;
        this.callback = callback;
        this.sep = separator;
        this.args = args;
        this.errMessage = errorMessage;
    }

    parseArgs = async (commandText) => {
        if (this.sep !== undefined) {
            const args = commandText.split(this.sep);
            let i = 1;
            for (let key in this.args) {
                if (args[i] !== undefined) {
                    this.args[key] = args[i];
                    i++
                } else {
                    throw new Error(this.errMessage)
                }
            }

            return this.args;
        }

        return undefined;
    }
}

module.exports = Command;