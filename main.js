const AsyncTgBot = require("./async-node-tg/src/Bot.js");
require("dotenv").config();
const InlineKeyboardMarkup = require("./async-node-tg/types/InlineKeyboardMarkup");

// эти строчки придется писать пользователю нашего фреймворка
markup = new InlineKeyboardMarkup([
    [{text: "Пососать", callback_data: "minet"}],
    [{text: "Фу, нет", callback_data: "otkaz"}]
]);

const bot = new AsyncTgBot(process.env.BOT_TOKEN);
bot.addCommand('start',
    async message => {
        await bot.sendMessage(message.chat.id, "Привет, пососешь?", markup);
    })
bot.addCommand('sosat',
    async message => {
        await bot.sendMessage(message.chat.id, "Ооооо да, наконец-то");
    })
bot.addCallback(callback_data => callback_data === "minet",
    async call => {
        await bot.sendMessage(call.callback_query.from.id, "Круто, спасибо тебе большое");
    })
bot.addCallback(callback_data => callback_data === "otkaz",
    async call => {
        await bot.sendMessage(call.callback_query.from.id, "Ты че бля, я с тобой больше не общаюсь");
    })
bot.addTextFilter("Пососешь мне?",
    async message => {
        await bot.sendMessage(message.chat.id, "Конечно, бро\n\n Я обязательно займусь этим");
    })
bot.infinityPolling().then(() => console.log("Polling stopped"));
