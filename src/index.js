require('dotenv').config()
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const express = require('express')
// const bodyParser = require('body-parser')

const TOKEN = process.env.TOKEN;
const url = process.env.URL;
const bot = new TelegramBot(TOKEN, { polling: true });
let intervalId;

async function fetchData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // const html = await page.content();
    // const text = await page.evaluate(() => document.body.innerText);
    // const links = await page.evaluate(() =>
    //     Array.from(document.querySelectorAll('a'), (e) => e.href)
    // );

    const info = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.MuiTableBody-root .MuiTableRow-root'), (e) => ({
            title: e.querySelector('td div div div span a').innerText,
            address: e.querySelector('td div div div div div span').innerText,
            // liq: e.querySelector('td div div span.MuiTypography-root.MuiTypography-caption').innerText,
        })))

    await browser.close();
    return info;
}

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Whats up my G.');
// });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Bot started. Fetching data every 10 seconds...');

    // Clear any existing interval
    if (intervalId) clearInterval(intervalId);

    // Set up a new interval to fetch data every 10 seconds
    intervalId = setInterval(async () => {
        const info = await fetchData();
        const messages = info.map(coin => `Title: ${coin.title}\nAddress: ${coin.address}`).join('\n\n');
        bot.sendMessage(chatId, messages);
    }, 10000);
});

bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    if (intervalId) {
        clearInterval(intervalId);
        bot.sendMessage(chatId, 'Bot stopped. No more data will be fetched.');
    } else {
        bot.sendMessage(chatId, 'Bot is not running.');
    }
});