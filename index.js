require("dotenv").config();

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

    createCallback = (body, callback) => {

    }

    createTextFilter = () => {

    }
}

const endPointManager = new EndPointManager();

// это класс нашего крутого бота
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

    sendMessage = async (chatId, text, replyMarkup = {}) => {
        // creating url for request
        let url = `https://api.telegram.org/bot${this.TOKEN}/sendMessage?chat_id=${chatId}&text=${text}`
        if (replyMarkup) {
            url += `&reply_markup=${JSON.stringify(replyMarkup)}`
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
            if (value.message !== undefined && value.message.text[0] === "/") {
                this._processCommands(value.message);
            }
        });
    }

    _processCommands = async (message) => {
        const commands = this.endPoints.commands
        for (let i = 0; i < commands.length; i++) {
            if (message.text === `/${commands[i].body}`) {
                commands[i].callback(message);
                return;
            }
        }
    }

    addCommand = async (body, callback) => {
        this.endPoints.commands.push(endPointManager.createCommand(body, callback));
    }

    _setPolling = () => {
        this.nonStop = !this.nonStop;
    }
}

// эти строчки придется писать пользователю нашего фреймворка
markup = {
    inline_keyboard: [
            [
                {
                    text: "Cосать",
                    callback_data: "minet"
                }
            ],
    ]
}

console.log(markup);
bot = new AsyncTgBot(process.env.BOT_TOKEN);
bot.addCommand('start',
    async message => {
        await bot.sendMessage(message.chat.id, "Привет, пососешь?", markup);
    }
).then();
bot.addCommand('sosat',
    async message => {
        await bot.sendMessage(message.chat.id, "Ооооо да, наконец-то");
    }
).then();
bot.infinityPolling().then();
