require('dotenv').config()
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');

// const express = require('express')
// const bodyParser = require('body-parser')

const TOKEN = process.env.TOKEN;
const url = process.env.URL;

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);

    console.log(text);

    await browser.close();
}

run();

// const name_data = [];

// async function getName() {
//     try {
//         const response = await axios.get(url);
//         const $ = cheerio.load(response.data);
//         const info = $("noscript").text();

//         console.log(info || 'hello world');

//     } catch(error) {
//         console.error(error);
//     }
// }

// getName();

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Whats up my G.');
});