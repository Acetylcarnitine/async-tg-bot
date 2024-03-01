const endPointManager = require("../utils/EndPointManager");

// sleep function
// for making a timeout for executing callbacks
const sleep = (delay) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    })
}

class AsyncTgBot {
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
            throw new Error("Bad Request: message not sanded");
        }
    }

    answerCallbackQuery = async (callbackQueryId, text, showAlert, url) => {
        let uri = `https://api.telegram.org/bot${this.TOKEN}/answerCallbackQuery?callback_query_id=${callbackQueryId}`;

        // adding optional variables to request
        if (text !== undefined) {
            uri += `&text=${text}`
        }
        if (showAlert !== undefined) {
            uri += `&show_alert=${showAlert}`
        }
        if (url !== undefined) {
            uri += `&url=${url}`
        }

        // sending request
        const result = await fetch(uri);
        // throw error if had wrong answer
        if (result.status !== 200) {
            throw new Error("Bad Request: query do not answered");
        }
    }

    editMessageText = async (chatId, messageId, text, replyMarkup) => {
        let url = `https://api.telegram.org/bot${this.TOKEN}/editMessageText?chat_id=${chatId}&message_id=${messageId}&text=${text}`
        if (replyMarkup !== undefined) {
            url += `&reply_markup=${replyMarkup.exportJSON()}`
        }

        const result = await fetch(url);
        if (result.status !== 200) {
            throw new Error("Bad Request: Message not modified")
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
            if (~message.text.indexOf(`/${commands[i].body}`)) {
                try {
                    if (commands[i].sep === undefined) {
                        commands[i].callback(message);
                    } else {
                        commands[i].callback(message, (await commands[i].parseArgs(message.text)));
                    }
                    return;
                } catch (e) {
                    await this.sendMessage(message.chat.id, commands[i].errMessage);
                }
            }
        }
    }

    _processCallbackQuery = async (call) => {
        const callbacks = this.endPoints.callbackQuery;
        for (let i = 0; i < callbacks.length; i++) {
            if (callbacks[i].filter(call.callback_query.data)) {
                callbacks[i].callback(call.callback_query);
                return;
            }
        }
    }

    _processTextFilter = async (message) => {
        const filters = this.endPoints.text;
        for (let i = 0; i < filters.length; i++) {
            if (filters[i].filter(message.text)) {
                filters[i].callback(message);
                return;
            }
        }
    }

    addCommand = (body, callback, sep, args, err) => {
        this.endPoints.commands.push(
            endPointManager.createCommand(
                body, callback, sep, args, err
            )
        );
    }

    addCallback = (filter, callback) => {
        this.endPoints.callbackQuery.push(endPointManager.createCallback(filter, callback));
    }

    addTextFilter = (filter, callback) => {
        this.endPoints.text.push(endPointManager.createTextFilter(filter, callback));
    }
}

module.exports = AsyncTgBot;
