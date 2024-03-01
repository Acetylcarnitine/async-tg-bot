const Command = require("../types/Command");

class EndPointManager {
    createCommand = (body, callback, sep, args, err) => {
        if (sep !== undefined) {
            return new Command(body, callback, sep, args, err);
        } else {
            return new Command(body, callback);
        }
    }

    createCallback = (filter, callback) => ({
        filter: filter,
        callback: callback
    })

    createTextFilter = this.createCallback;
}

const endPointManager = new EndPointManager();
module.exports = endPointManager;