const telegramApi = require('node-telegram-bot-api');

const token = '1914884725:AAES0VinxYjk9m52vvAy7K4iBOIdx1vDDc8';

const bot = new telegramApi(token, {polling: true});

const fs = require('fs');

const users = JSON.parse(fs.readFileSync('./dataBase/users.json', 'utf-8'));

//id админа
const adminId = 648575895;
const testId = 600494175;

const complimentUrl = {
    boy: './dataBase/boys.json',
    girl: './dataBase/data.json',
};

//Команды
bot.setMyCommands([
    {command: '/start', description: 'Початкове привітання'},
    {command: '/info', description: 'Інформація про бота'},
    {command: '/get_compliment', description:'Отримати комплімент'},
    {command: '/set_timer', description:'Встановити таймер'},
    {command: '/stop_timer', description:'Зупинити таймер'},
    {command: '/set_sex', description:'Встановити стать'},
    {command: '/error', description:'Повідомити про помилку'},
]);

const timerOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Раз на годину', callback_data: 1*60*60*1000}],
            [{text: 'Раз на 2 години', callback_data: 2*60*60*1000}],
            [{text: 'Раз на добу', callback_data: 24*60*60*1000}],
            [{text: 'Раз на 10 секунд', callback_data: 10*1000}],
        ]
    })
}

const sexOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Хлопець', callback_data: 'boy'}],
            [{text: 'Дівчина', callback_data: 'girl'}]
        ]
    })
}

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Админка
    if (chatId === adminId) {
        if (text === '/start') {
            return bot.sendMessage(chatId, 'Привіт! Я романтичний бот🥰🥰🥰\nНадішли мені чат айді користувача та запиши йому повідомлення. Я відправлю йому твої слова)');
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, `Привіт! Ти зараз в адмінці бота.
                                            
Ти можеш надіслати мені айді користувача та записати повідомлення. Я тоді відправлю твої слова)
Формат повідомлення:

000000000
Як би погано тобі не було, пам'ятай, що ти вчишся не на фіоті)

Також ось всі доступні тобі команди:
/get_users - отримати список користувачів`);
        }

        const regExp = /\d{9,9}/g;

        // отправка сообщения пользователю
        if (regExp.test(text)) {
            const [userId, message] = text.trim().split(/\n/);

            const user = findUser(+userId);
            
            if (!user) {
                return bot.sendMessage(chatId, `Такого користувача(${userId}) не знайдено(`);
            }

            // await bot.sendPhoto(+userId, './photos/forLisa_1.jpg');
            
            return bot.sendMessage(+userId, message);

            // return bot.sendSticker(+userId, getSticker(+userId));
        }

        // получение списка пользователей
        if (text === '/get_users') {
            return bot.sendMessage(chatId, 'Users: ' + JSON.stringify(users, null, 2));
        }
    }

    // Для всех пользователей
    if (text === '/start' && chatId !== adminId) {
        if (!users.find(user => user?.id === chatId)) {
            users.push({
                first_name: msg.chat.first_name,
                last_name: msg.chat.last_name,
                username: `@${msg.chat.username}`,
                id: chatId
            });
            await bot.sendMessage(adminId, `Користувач: ${msg.chat?.first_name} ${msg.chat?.last_name}\nUsername: @${msg.chat?.username}\nChatId: ${chatId}`);
            writeUsers();
        }
        await bot.sendMessage(chatId, 'Привіт! Я романтичний бот🥰🥰🥰\nТепер я буду надсилати тобі компліменти❤️');
        return bot.sendMessage(chatId, 'Мені потрібно підбирати правильні слова, тому обери свою стать:', sexOptions);
    }

    if (text === '/set_sex') {
        return bot.sendMessage(chatId, 'Мені потрібно підбирати правильні слова, тому обери свою стать:', sexOptions);
    }

    if (text === '/error') {
        return bot.sendMessage(chatId, 'Якщо в роботі бота виникла помилка, напиши автору @Die_Macht, прикріпивши скріни');
    }

    if (text === '/info') {
        return bot.sendMessage(chatId, 'Цей бот був зроблений руками Влада Форощі\nВін особисто для тебе придумав всі ці гарні слова)');
    }

    if (text === '/get_compliment') {
        const user = findUser(chatId);

        try {
            await bot.sendMessage(chatId, getCompliment(user?.sex));
            return bot.sendSticker(chatId, getSticker(chatId));
        } catch (e) {
            //Если пользователь забанил бота, то его тоже забанить(удалить из списка)
            if (e.message === 'ETELEGRAM: 403 Forbidden: bot was blocked by the user') {
                users.splice(i, 1);

                console.log(`User '${user?.first_name}' was deleted`);
            }
        }
    }

    if (text === '/set_timer') {
        return bot.sendMessage(chatId, 'Обери, як часто ти хочеш отримувати компліменти:', timerOptions);
    }

    if (text === '/stop_timer') {
        const user = findUser(chatId);

        delete user.outputTime;
        delete user.clickTime;
        delete user.dataChoice;

        writeUsers();

        await bot.sendMessage(chatId, 'Таймер зупинено');

        return bot.sendMessage(chatId, 'Щоб встановити таймер знову, скористайся командою /set_timer');
    }

    // if (chatId === lisaId && !text.includes('/')) {

    if (!text) {
        return bot.sendMessage(chatId, 'Вибач, я тебе не розумію(');
    }

    if (!text.includes('/')) {
        const user = findUser(chatId);

        await bot.sendMessage(chatId, 'Вибач, я тебе не розумію(');

        return bot.sendMessage(adminId, `Повідомлення від ${user?.first_name} ${user?.last_name}:\n${text}`);
    }

    return bot.sendMessage(chatId, 'Вибач, я тебе не розумію(');
});

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const user = findUser(chatId);

    if (data === 'girl' || data === 'boy') {
        user.sex = data;

        await writeUsers();

        await bot.sendMessage(chatId, 'Чудово! Тепер обери, як часто ти хочеш отримувати компліменти:', timerOptions);

        return bot.deleteMessage(chatId, msg.message.message_id);
    }

    await bot.sendMessage(chatId, getCompliment(user?.sex));
    await bot.sendSticker(chatId, getSticker(chatId));
    await bot.sendMessage(chatId, 'Очікуй наступний комплімент через вказаний тобою час)');

    await setTimer(chatId, data);

    return bot.deleteMessage(chatId, msg.message.message_id);
});

// генерация рандомного комплимента
const getCompliment = sex => {
    if (!sex) {
        sex = 'girl';
    }
    const url = complimentUrl[sex];
    const arrLength = complimentUrl[sex].length;

    const textArray = JSON.parse(fs.readFileSync(url, 'utf-8'));

    const index = Math.floor(Math.random() * arrLength);

    return textArray[index];
}

const getSticker = id => {
    const stickers = JSON.parse(fs.readFileSync('./dataBase/stickers.json', 'utf-8'));
    const stickersAmount = stickers.length;

    const index = Math.floor(Math.random() * stickersAmount);

    return stickers[index];
}

// знайти користувача за його id
const findUser = id => {
    return users.find(user => user?.id === id);
}

// запись пользователей в файл users.json
const writeUsers = () => {
    return fs.writeFileSync('./dataBase/users.json', JSON.stringify(users, null, 2));
}

// встановити таймер для наступного компліменту
const setTimer = async (id, data) => {
    const user = findUser(id);

    if (!user) {
        return console.log('Error! No such user exists');
    }

    const clickTime = new Date().getTime();
    const outputTime = +clickTime + +data;

    user.clickTime = clickTime;
    user.outputTime = outputTime;
    user.dataChoice = +data;

    const userIndex = await users.findIndex(user => user?.id === id);

    return users.splice(userIndex, 1, user);
}

//періодична перевірка часу та відправлення компліменту згідно розкладу
const getTimerCompliment = async () => {
    for (let i = 0; i < users.length; i++) {
        const outputTime = users[i]?.outputTime;

        if (outputTime && outputTime <= new Date().getTime()) {
            const userId = users[i].id;
            const data = users[i].dataChoice;

            try {
                await bot.sendMessage(userId, getCompliment(users[i]?.sex));
                await bot.sendSticker(userId, getSticker(userId));
            } catch (e) {
                //Если пользователь забанил бота, то его тоже забанить(удалить из списка)
                if (e.message === 'ETELEGRAM: 403 Forbidden: bot was blocked by the user') {
                    users.splice(i, 1);

                    console.log(`User '${users[i]?.first_name}' was deleted`);
                }
                
            }
            
            await setTimer(userId, data);

            writeUsers();
        }
    }
    return setTimeout(() => {
        getTimerCompliment();
    }, 1000);
}

// Постоянный запуск таймера комплиментов
getTimerCompliment();