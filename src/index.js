require('dotenv').config()
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;
const URL = process.env.URL;
const bot = new TelegramBot(TOKEN, { polling: true });
let intervalId;

async function fetchData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);

    // const html = await page.content();
    // const text = await page.evaluate(() => document.body.innerText);
    // const links = await page.evaluate(() =>
    //     Array.from(document.querySelectorAll('a'), (e) => e.href)
    // );

    const info = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.MuiTableBody-root .MuiTableRow-root'), (e) => ({
            title: e.querySelector('td div div div span a').innerText,
            link: e.querySelector('td div div div span a').href,
            liq: e.querySelector('td:nth-child(6) div div span').innerText,
            mcap: e.querySelector('td:nth-child(8) div div span').innerText,
        })))
    
    console.log(info.map(coin => `Title: ${coin.title}\nAddress: ${coin.link.slice(-42)}\nLink: ${coin.link}\nLiquidity: ${coin.liq}eth\nMarketcap: ${coin.mcap}`).join('\n\n'));
    await browser.close();

    return info;
}

fetchData()

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Whats up my G.');
// });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('Bot started.');
    bot.sendMessage(chatId, 'Bot started. Fetching data every 20 seconds...');

    // Clear any existing interval
    if (intervalId) clearInterval(intervalId);

    // Set up a new interval to fetch data every 10 seconds
    intervalId = setInterval(async () => {
        const info = await fetchData();
        const messages = info.map(coin => `Title: ${coin.title}\nAddress: ${coin.link.slice(-42)}\nLink: ${coin.link}\nLiquidity: ${coin.liq}eth\nMarketcap: ${coin.mcap}`).join('\n\n');
        bot.sendMessage(chatId, messages);
    }, 20000);
});

bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    if (intervalId) {
        clearInterval(intervalId);
        console.log('Bot stopped.')
        bot.sendMessage(chatId, 'Bot stopped. No more data will be fetched.');
    } else {
        bot.sendMessage(chatId, 'Bot is not running.');
    }
});