const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '7720553112:AAHPoO9-EqPWLBtDqbonQqDbMVk6fmJqCj4';
const webAppUrl = 'https://funny-manatee-929c25.netlify.app';

let bot;

if (!bot) {
  bot = new TelegramBot(token, {polling: true});
}

const app = express();
app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') { 
    await bot.sendMessage(chatId, 'Ниже появится кнопка', {
      reply_markup: {
        keyboard: [
          [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
        ],
      resize_keyboard: true,
      }
    })

      await bot.sendMessage(chatId, 'Store', {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
        ],
      resize_keyboard: true,
      }
    });
  }
  if(msg?.web_app_data?.data) {
    try {
      //  в tg мы их отправили, здесь получили 
      const data = JSON.parse(msg.web_app_data.data); //прилетают данные отправленные с веб-приложения
      //добавляем chatId чтобы бот понимал куда это сообщение отправить
      await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
      await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
      await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

      setTimeout(async () => {
      await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
      }, 3000)
    } catch (error) {
      console.log(error)
    }
  }

});

app.post('/web-data', async (req, res) => {
  const {query_id, products = [], totalPrice} = req.body;
  console.log(products)
  try {
    await bot.answerWebAppQuery(query_id, {
      id: query_id,
      type: 'article',
      title: 'Успешная покупка',
      input_message_content: {
        message_text: `Поздравляем с покупкой! На сумму ${totalPrice}, 
        ${products.map((item) => item.title).join('')} 
        `}
    })
      return res.status(200).json({})
  } catch (e) {
    return res.status(500).json({})
  }
})

const PORT = 8000
app.listen(PORT, () => console.log('start server ' + PORT))