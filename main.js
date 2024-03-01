require("dotenv").config();
const AsyncTgBot = require("./async-node-tg/src/Bot.js");
const InlineKeyboardMarkup = require("./async-node-tg/types/InlineKeyboardMarkup");

// creating inline keyboard markup
markup = new InlineKeyboardMarkup([
    [{text: "Fine", callback_data: "good"}],
    [{text: "Not fine(((", callback_data: "bad"}]
]);

// creating new bot with token from env
const bot = new AsyncTgBot(process.env.BOT_TOKEN);

// bind new command
bot.addCommand('start',
    async message => {
        await bot.sendMessage(message.chat.id, "Hello, are you fine?", markup);
    })

// you can also send dome args for a command and lib will parse it splitting by separator
// lib do not type checking you args, but you can do it
bot.addCommand('feeling',
    // callback binding for this command
    async (message, args) => {
        await bot.sendMessage(message.chat.id, `You are feeling ${args.feedback}`);
    },
    ' ',
    // send the object that we want to see like args in callback
    {feedback: "bad"},
    // error message that bot will send if user send not enough args
    'Некорректно указан список аргуметов'
);

// adding callback handler to bot
// first you need to write a filter function
bot.addCallback(callback_data => callback_data === "good",
    async call => {
        // you can answer callback query
        // field text, showAlert, etc. is optional
        await bot.answerCallbackQuery(call.id, "That's so good", true);
        await bot.sendMessage(call.from.id, "It is amazing!");
        // and you can edit messages text
        await bot.editMessageText(call.from.id, call.message.message_id, "Thank you for answer");
    })

bot.addCallback(callback_data => callback_data === "bad",
    async call => {
        await bot.answerCallbackQuery(call.id, "Oh no((");
        await bot.sendMessage(call.from.id, "Sad(");
        await bot.editMessageText(call.from.id, call.message.message_id, "Thank you for answer");
    })

// and you can filter text messages to answer
bot.addTextFilter(text => text === "So, how are you bro?",
    async message => {
        await bot.sendMessage(message.chat.id, "I am always fine%0AThank you!");
    })

// now bot can only use polling
bot.infinityPolling().then(() => console.log("Polling stopped"));
