const TelegramBot = require('node-telegram-bot-api');
const token = '7617497785:AAFt0Pz6yzw7WuciTmA1iRkRCIK5bnBkxbg';
const bot = new TelegramBot(token, { polling: true });
const adminChatId = '1519634971';
const questions = [
  {
    question: "What is the most popular programming language in 2024?",
    options: ["Python", "JavaScript", "C++", "Java"],
    correctAnswer: "JavaScript"
  },
  {
    question: "Which company developed the first computer mouse?",
    options: ["Microsoft", "Apple", "Xerox", "IBM"],
    correctAnswer: "Xerox"
  },
  {
    question: "Who created the Python programming language?",
    options: ["Guido van Rossum", "Linus Torvalds", "Dennis Ritchie", "James Gosling"],
    correctAnswer: "Guido van Rossum"
  },
  {
    question: "What does HTML stand for?",
    options: ["HyperText Markup Language", "HyperText Machine Language", "Home Tool Markup Language", "Hyperlink Text Markup Language"],
    correctAnswer: "HyperText Markup Language"
  },
  {
    question: "What is the full form of SQL?",
    options: ["Structured Query Language", "Simple Query Language", "Structured Question Language", "Standard Query Language"],
    correctAnswer: "Structured Query Language"
  }
];
let userState = {};
function sendQuestion(chatId, questionIndex) {
  const question = questions[questionIndex];
  const options = question.options.map(option => ({
    text: option,
    callback_data: option
  }));
  bot.sendMessage(chatId, question.question, {
    reply_markup: {
      inline_keyboard: [options]
    }
  });
}
bot.on('callback_query', (callbackQuery) => {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const answer = callbackQuery.data;
  if (!userState[userId]) {
    userState[userId] = { currentQuestion: 0, correctAnswers: 0 };
  }
  const currentQuestion = userState[userId].currentQuestion;
  if (answer === questions[currentQuestion].correctAnswer) {
    userState[userId].correctAnswers++;
  }
    userState[userId].currentQuestion++;
  if (userState[userId].currentQuestion < questions.length) {
    sendQuestion(chatId, userState[userId].currentQuestion);
  } else {
    const correctAnswers = userState[userId].correctAnswers;
    const result = ` got ${correctAnswers} out of ${questions.length} questions correct!`;
    bot.sendMessage(chatId, result);
    const username = callbackQuery.from.username
      ? `@${callbackQuery.from.username}`
      : callbackQuery.from.first_name;
    bot.sendMessage(adminChatId, `User ${username} (${chatId}) completed the quiz:\n${result}`);
    delete userState[userId];
  }
  bot.answerCallbackQuery(callbackQuery.id);
});
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (msg.text.toLowerCase() === 'start') {
    const introPhoto = "./Qs.jpg";
    bot.sendPhoto(chatId, introPhoto, {
      caption: "Welcome to the Tech Quiz!"
    }).then(() => {
      bot.sendMessage(chatId, 'Let\'s start the tech quiz. Please answer the following questions using the buttons.');
      sendQuestion(chatId, 0);
    });
  } else {
    bot.sendMessage(chatId, 'Send "start" to begin the quiz!');
  }
});
console.log('Bot is up and running!');