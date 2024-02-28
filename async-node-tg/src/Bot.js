// это функция засыпания
const sleep = (delay) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    })
}

class EndPointManager {
    createCommand = (body, callback) => ({
        body: body,
        callback: callback
    })

    createCallback = (filter, callback) => ({
        filter: filter,
        callback: callback
    })

    createTextFilter = this.createCallback;
}

const endPointManager = new EndPointManager();

// это класс нашего крутого бота
module.exports = class AsyncTgBot {
    constructor(token) {
        this.TOKEN = token;
        this.lastUpdate = 0;
        this.endPoints = {
            commands: [],
            text: [],
            callbackQuery: []
        };
    }

    infinityPolling = async (interval = 50) => {
        this.nonStop = true;
        while (this.nonStop) {
            const res = await fetch (
                `https://api.telegram.org/bot${this.TOKEN}/getUpdates?offset=${this.lastUpdate}`
            );
            if (res.status === 200) {
                const result = (await res.json()).result;
                if (result.length > 0) {
                    this.lastUpdate = result[result.length - 1].update_id + 1;
                    await this._processNewUpdates(result);
                }
            }
            await sleep(interval);
        }
    }

    sendMessage = async (chatId, text, replyMarkup) => {
        // creating url for request
        let url = `https://api.telegram.org/bot${this.TOKEN}/sendMessage?chat_id=${chatId}&text=${text}`
        if (replyMarkup) {
            url += `&reply_markup=${replyMarkup.exportJSON()}`
        }

        // sending request
        const result = await fetch(url);
        // parse result
        if (result.status === 200) {
            return result.json();
        } else {
            throw new Error("Fatal Error: message not sanded");
        }
    }

    _processNewUpdates = async (newUpdates) => {
        newUpdates.map(value => {
            if (value.callback_query) {
                this._processCallbackQuery(value);
            }
            else if (value.message && value.message.text[0] === "/") {
                this._processCommands(value.message);
            } else {
                this._processTextFilter(value.message);
            }
        });
    }

    _processCommands = async (message) => {
        const commands = this.endPoints.commands;
        for (let i = 0; i < commands.length; i++) {
            if (message.text === `/${commands[i].body}`) {
                commands[i].callback(message);
                return;
            }
        }
    }

    _processCallbackQuery = async (call) => {
        const callbacks = this.endPoints.callbackQuery;
        for (let i = 0; i < callbacks.length; i++) {
            if (callbacks[i].filter(call.callback_query.data)) {
                callbacks[i].callback(call);
                return;
            }
        }
    }

    _processTextFilter = async (message) => {
        const filters = this.endPoints.text;
        for (let i = 0; i < filters.length; i++) {
            if (message.text === filters[i].body) {
                filters[i].callback(message);
                return;
            }
        }
    }

    addCommand = (body, callback) => {
        this.endPoints.commands.push(endPointManager.createCommand(body, callback));
    }

    addCallback = (filter, callback) => {
        this.endPoints.callbackQuery.push(endPointManager.createCallback(filter, callback));
    }

    addTextFilter = (body, callback) => {
        this.endPoints.text.push(endPointManager.createTextFilter(body, callback));
    }

    _setPolling = () => {
        this.nonStop = !this.nonStop;
    }
}
