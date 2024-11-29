const TelegramBot = require('node-telegram-bot-api');
const token = '7712353309:AAFosY88Fvpuqgc_9_IUQJBh8n9zvEG4MUI';
const bot = new TelegramBot(token, { polling: true });
const adminChatId = '7171468165';
const userStates = {};
const foodPrices = {
  fasting: {
    "Shiro Feses": 100,
    "Tegabino": 120,
    "Misir Wat": 130,
    "Gomen": 110,
    "Beyaynet": 100,
    "Kik Alicha": 140,
    "Salad": 100,
    "Vegetable Tibs": 130,
  },
  nonFasting: {
    "Doro Wat": 200,
    "Kitfo": 180,
    "Tibs": 150,
    "Zilzil Tibs": 220,
    "Dulet": 130,
    "Fasolia": 140,
    "Berbere Chicken": 250,
    "Spicy Lamb Stew": 240,
    "Fish Wat": 210
  },
  drinks: {
    "Fresh Juice (Mango, Orange, etc.)": 50,
    "Bottled Water": 20,
    "Traditional Beer (Siga)": 130,
    "Tej": 50,
    "Soft Drink": 30,
    "Coffee (Buna)": 30,
    "Herbal Tea": 30,
    "Fruit Smoothie": 60,
  }
};
const adminAccountNumber = "10005300945945";
const phoneNumberRegex = /^\+251\d{9}$/;
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `*Welcome Family! This is the 5kilo Fast Food Delivery Bot!* 🍔🍔\n\nChoose your food category below:`;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🍴 Fasting', callback_data: 'fasting' }
                ],
                [
                    { text: '🍖 Non-Fasting', callback_data: 'nonFasting' }
                ],
                [
                    { text: '🥤 Drinks', callback_data: 'drinks' }
                ]
            ]
        }
    };
    const photoUrl = 'college.jpg'; // Update with your image URL or file path
    bot.sendPhoto(chatId, photoUrl, { caption: welcomeMessage, parse_mode: 'Markdown', ...options });
});

  bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `Here are the commands you can use:\n\n` +
                      `- /start - Start a new order or browse the menu\n` +
                      `- /help - Get help with the bot\n` +
                      `- /myorders - View your previous orders (if implemented)\n` +
                      `- /showorder - Review your current order\n` +
                      `- /about - Learn about the bot and service`;
  bot.sendMessage(chatId, helpMessage);
});

// /about command
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  const aboutMessage = `This is the *5kilo Fast Food Delivery Bot* 🇪🇹🍽️. We offer a variety of traditional Ethiopian dishes and drinks.\n\n` +
                      `You can place your order by selecting a category, adding food items to your cart, and then proceeding to checkout. We also provide a secure payment method for your convenience.`;
  bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/showorder/, (msg) => {
  const chatId = msg.chat.id;
  if (!userStates[chatId] || !userStates[chatId].foodItems || userStates[chatId].foodItems.length === 0) {
    bot.sendMessage(chatId, 'You have not added any items to your order yet.');
    return;
  }

  const userState = userStates[chatId];
  const foodList = userState.foodItems.map(item => `${item} - ${foodPrices[userState.currentCategory][item]} Birr`).join('\n');
  const totalPrice = userState.foodItems.reduce((total, item) => total + foodPrices[userState.currentCategory][item], 0);

  const orderSummary = `*Your current order:*\n${foodList}\n\n*Total Price*: ${totalPrice} Birr\n\nYou can proceed with checkout or add more items.`;
  bot.sendMessage(chatId, orderSummary, { parse_mode: 'Markdown' });
});
bot.onText(/\/myorders/, (msg) => {
  const chatId = msg.chat.id;
  const ordersMessage = `You can track your previous orders here. (Feature not yet implemented.)`;
  bot.sendMessage(chatId, ordersMessage);
});
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  if (!userStates[chatId]) {
    userStates[chatId] = { foodItems: [] }; // Initialize foodItems array for multiple selections
  }
  if (data === 'fasting' || data === 'nonFasting' || data === 'drinks') {
    let category;
    if (data === 'fasting') {
      category = 'fasting';
    } else if (data === 'nonFasting') {
      category = 'nonFasting';
    } else if (data === 'drinks') {
      category = 'drinks';
    }
    const menuOptions = {
      reply_markup: {
        inline_keyboard: Object.keys(foodPrices[category]).map(item => {
          return [{ text: `${item} - ${foodPrices[category][item]} Birr`, callback_data: item }];
        })
      }
    };

    bot.sendMessage(chatId, `Choose an item from the ${category === 'fasting' ? 'Fasting' : category === 'nonFasting' ? 'Non-Fasting' : 'Drinks'} category:`, { parse_mode: 'Markdown', ...menuOptions });
    userStates[chatId].currentCategory = category;
  } else if (foodPrices[userStates[chatId].currentCategory][data]) {
    userStates[chatId].foodItems.push(data);
    let item = data;
    let price = foodPrices[userStates[chatId].currentCategory][data];
    bot.sendMessage(chatId, `✅ *${item}* added to your order! 🍽️\n*Price*: ${price} Birr`, { parse_mode: 'Markdown' });
    const menuOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add More Items', callback_data: 'add_more' }],
          [{ text: '💳 Proceed to Checkout', callback_data: 'checkout' }]
        ]
      }
    };
    bot.sendMessage(chatId, 'Would you like to add more items or proceed to checkout?', menuOptions);
  }

  bot.answerCallbackQuery(query.id);
});
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  if (data === 'add_more') {
    const category = userStates[chatId].currentCategory;
    const menuOptions = {
      reply_markup: {
        inline_keyboard: Object.keys(foodPrices[category]).map(item => {
          return [{ text: `${item} - ${foodPrices[category][item]} Birr`, callback_data: item }];
        })
      }
    };
    bot.sendMessage(chatId, `Choose another item from the ${category === 'fasting' ? 'Fasting' : category === 'nonFasting' ? 'Non-Fasting' : 'Drinks'} category:`, menuOptions);
  } else if (data === 'checkout') {
    let totalPrice = 0;
    userStates[chatId].foodItems.forEach(item => {
      totalPrice += foodPrices[userStates[chatId].currentCategory][item];
    });
    const totalPriceWithDiscount = totalPrice * 0.2; // 20% payment
    const checkoutMessage = `💰 *Your total order price*: ${totalPrice} Birr\n\n` +
                            `Please pay 20% of the total price, which is: *${totalPriceWithDiscount} Birr*\n\n` +
                            `🔑 Admin's account number for payment: *${adminAccountNumber}*`;

    bot.sendMessage(chatId, checkoutMessage, { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, 'Please provide your *name*:', { parse_mode: 'Markdown' });
    userStates[chatId].step = 'name';
  }
  bot.answerCallbackQuery(query.id);
});
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!userStates[chatId]) return;  // Prevent undefined state errors
  const userState = userStates[chatId];
  if (userState.step === 'name') {
    userState.name = msg.text;
    bot.sendMessage(chatId, 'Please provide your *address*:', { parse_mode: 'Markdown' });
    userState.step = 'address';
  } else if (userState.step === 'address') {
    userState.address = msg.text;
    bot.sendMessage(chatId, 'Please provide your *phone number* (in international format):', { parse_mode: 'Markdown' });
    userState.step = 'phone';
  } else if (userState.step === 'phone') {
    const phone = msg.text;
    if (!phoneNumberRegex.test(phone)) {
      bot.sendMessage(chatId, '❌ Invalid phone number. Please enter your phone number in the format: +251xxxxxxxxx');
      return;
    }
    userState.phone = phone;
    const username = msg.from.username || 'N/A'; 
    let totalPrice = 0;
    userState.foodItems.forEach(item => {
      totalPrice += foodPrices[userState.currentCategory][item];
    });
    const userInfo = `New Order from *${userState.name}* (@${username}):\n` +
                     `Food: *${userState.foodItems.join(', ')}*\n` +
                     `Total Price: *${totalPrice}* Birr\n` +
                     `Address: *${userState.address}*\n` +
                     `Phone: *${userState.phone}*`;
    bot.sendMessage(adminChatId, userInfo, { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, `✅ Your order has been placed! We will contact you soon.`);
    const userCommandsMessage = `Here are some commands you can use:\n` +
                                `- /start - Start a new order or browse the menu\n` +
                                `- /help - Get help with the bot\n` +
                                `- /showorder - Review your current order\n` +
                                `- /myorders - View your previous orders (if implemented)`;
    bot.sendMessage(chatId, userCommandsMessage);
  }
});
console.log('Bot is up and running!');