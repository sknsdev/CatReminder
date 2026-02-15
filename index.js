require('dotenv').config();
const { Telegraf } = require('telegraf');
const path = require('path');
const keyboards = require('./keyboards');
const db = require('./db');

// Проверка токена
if (!process.env.BOT_TOKEN) {
    throw new Error('Токен не найден');
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 1048416784;

// Команда старт
bot.start((ctx) => {
    if (ctx.from) {
        db.createUser(ctx.from.id, ctx.from.username);
    }
    ctx.reply('Добро пожаловать! Выберите пункт меню:', keyboards.getMainMenu());
});

// Обработка кнопки Назад и Главное меню
bot.action('menu_main', async (ctx) => {
    try {
        await ctx.editMessageText('Главное меню:', keyboards.getMainMenu());
    } catch (e) {
        // Если не получилось (например, было фото), пересоздаем сообщение
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply('Главное меню:', keyboards.getMainMenu());
    }
});

// Переход к задачам
bot.action('menu_tasks', async (ctx) => {
    try {
        await ctx.editMessageText('Что вы сделали?', keyboards.getTasksMenu());
    } catch (e) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply('Что вы сделали?', keyboards.getTasksMenu());
    }
});

// Переход к инструкциям
bot.action('menu_instructions', async (ctx) => {
    try {
        await ctx.editMessageText('Выберите инструкцию:', keyboards.getInstructionsMenu());
    } catch (e) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply('Выберите инструкцию:', keyboards.getInstructionsMenu());
    }
});

// Переход к эмоциям
bot.action('menu_emotions', async (ctx) => {
    try {
        await ctx.editMessageText('😺 Как понять кошку? Выберите эмоцию:', keyboards.getEmotionsMenu());
    } catch (e) {
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply('😺 Как понять кошку? Выберите эмоцию:', keyboards.getEmotionsMenu());
    }
});

// Получение текущей даты YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Обработка статуса
bot.action('action_status', async (ctx) => {
    const today = getTodayDate();
    const status = db.getDailyStatus(today);
    
    const text = `📊 Статус на сегодня (${today}):\n\n` +
                 `🍗 Корм: ${status.is_fed ? '✅' : '❌'}\n` +
                 `🧶 Игры: ${status.is_played ? '✅' : '❌'}\n` +
                 `💩 Туалет: ${status.is_cleaned ? '✅' : '❌'}`;

    await ctx.answerCbQuery();
    // Отправляем новым сообщением или редактируем
    try {
        await ctx.editMessageText(text, keyboards.getMainMenu());
    } catch (e) {
        // Если текст не изменился, телеграм кинет ошибку, игнорим
    }
});

// Обработка задач
const handleTask = async (ctx, taskType, taskName) => {
    const today = getTodayDate();
    db.markTask(today, taskType);
    
    // Уведомление админу
    const performerName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const performer = performerName.replace(/[_*[`]/g, '\\$&');
    const message = `🔔 *Отметка от кэтситтера:*\n👤 ${performer}\n✅ ${taskName}\n📅 ${today}`;
    
    try {
        await ctx.telegram.sendMessage(ADMIN_ID, message, { parse_mode: 'Markdown' });
    } catch (e) {
        console.error('Ошибка отправки уведомления админу:', e);
    }

    await ctx.answerCbQuery(`Отмечено: ${taskName}`);
    
    // Показываем меню задач снова с обновленным статусом (опционально) или главное
    // Для простоты вернем в главное меню с подтверждением
    await ctx.editMessageText(`✅ Вы отметили: ${taskName}\nСпасибо!`, keyboards.getMainMenu());
};

bot.action('task_fed', (ctx) => handleTask(ctx, 'is_fed', 'Покормил'));
bot.action('task_played', (ctx) => handleTask(ctx, 'is_played', 'Поиграл'));
bot.action('task_cleaned', (ctx) => handleTask(ctx, 'is_cleaned', 'Убрал туалет'));

// Обработка инструкций
bot.action('info_food', async (ctx) => {
    try {
        await ctx.deleteMessage(); // Удаляем меню, чтобы отправить фото
        await ctx.replyWithMediaGroup([
            {
                media: { source: path.join(__dirname, 'food1.jpg') },
                type: 'photo',
                caption: '📍 *Где найти корм*',
                parse_mode: 'Markdown'
            },
            {
                media: { source: path.join(__dirname, 'food2.jpg') },
                type: 'photo'
            }
        ]);
        await ctx.reply(
            'Контейнер с кормом находится либо рядом с мисками, либо в нижнем выдвижном ящике справа от мисок. В ящике также находится вся пачка корма, если почему то закончилось в контейнере.',
            { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
        );
    } catch (e) {
        console.error('Ошибка отправки фото:', e);
        // Фолбек если фото не отправляются
        await ctx.reply(
            '📍 *Где найти корм:*\nКонтейнер с кормом находится либо рядом с мисками, либо в нижнем выдвижном ящике справа от мисок. В ящике также находится вся пачка корма, если почему то закончилось в контейнере.',
            { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
        );
    }
});

bot.action('info_treats', async (ctx) => {
    try {
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(
            { source: path.join(__dirname, 'food3.jpg') },
            {
                caption: '🍬 *Вкусняшки:*\nДавать 2-3 раза в день по 4-6 штук (по глазам можно понять, насколько сильно она хочет их)',
                parse_mode: 'Markdown',
                ...keyboards.getBackToInstructions()
            }
        );
    } catch (e) {
        console.error('Ошибка отправки фото:', e);
        await ctx.reply(
            '🍬 *Вкусняшки:*\nДавать 2-3 раза в день по 4-6 штук (по глазам можно понять, насколько сильно она хочет их)',
            { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
        );
    }
});

bot.action('info_treats_guide', async (ctx) => {
    try {
        await ctx.deleteMessage();
        await ctx.replyWithMediaGroup([
            { media: { source: path.join(__dirname, 'korm1.jpg') }, type: 'photo', caption: '🍪 **Как давать лакомства**', parse_mode: 'Markdown' },
            { media: { source: path.join(__dirname, 'korm2.jpg') }, type: 'photo' },
            { media: { source: path.join(__dirname, 'korm3.jpg') }, type: 'photo' },
            { media: { source: path.join(__dirname, 'korm4.jpg') }, type: 'photo' },
            { media: { source: path.join(__dirname, 'korm5.jpg') }, type: 'photo' }
        ]);
        // Отправляем кнопку назад отдельным сообщением
        await ctx.reply('Прикольнее всего, когда она на стуле, но можно и когда она на полу. Но если она на полу, она может зачем то уходить', keyboards.getBackToInstructions());
    } catch (e) {
        console.error('Ошибка отправки фото:', e);
        await ctx.reply(
            '🍪 **Как давать лакомства:**\n(Ошибка загрузки изображений)',
            keyboards.getBackToInstructions()
        );
    }
});

bot.action('info_toilet', async (ctx) => {
    await ctx.editMessageText(
        '🧹 **Как убирать туалет:**\nЛопатка лежит рядом в лотке. Уберите комки в унитаз. Если песка мало — досыпьте из пакета в под ванной.',
        { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
    );
});

bot.action('info_play', async (ctx) => {
    await ctx.editMessageText(
        '🧶 **Как играть:**\nРукой под одеялом, либо фонариком - вытянуть линзу в тонкий пучок, и водить по полу. На третью пробежку она устанет. (Фонарик над компьютером на полке на стене)',
        { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
    );
});

bot.action('info_addr', async (ctx) => {
    await ctx.editMessageText(
        '🗺 **Как добраться:**\nЮпитера 1.\nПроезд в нашу сторону - 65, 65а, 63 автобусы, конечная остановка',
        { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
    );
});

bot.action('info_stove', async (ctx) => {
    await ctx.editMessageText(
        '🔌 **Как пользоваться электроплитой:**\n1. Нажмите кнопку включения (справа).\n2. Выберите конфорку зажатием на соответствующий кружок.\n3. Установите мощность кнопками + и -, где 0 не работает, 9 максимум.\n4. Чтобы выключить, выбери конфорку зажатием и уведи кнопкой -.\n⚠️ Не забудьте выключить после использования!',
        { parse_mode: 'Markdown', ...keyboards.getBackToInstructions() }
    );
});

// Хелпер для отправки эмоции
const sendEmotion = async (ctx, photo, text) => {
    try {
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(
            { source: photo },
            {
                caption: text,
                parse_mode: 'Markdown',
                ...keyboards.getBackToEmotions()
            }
        );
    } catch (e) {
        console.error('Ошибка отправки эмоции:', e);
        await ctx.reply(text, keyboards.getBackToEmotions());
    }
};

// Обработчики эмоций
bot.action('emo_c1', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c1.jpg'), '🧐 **Стандарт:**\nСтандартная глупость, не представляет опасности'));
bot.action('emo_c2', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c2.jpg'), '🤪 **Безумие:**\nНевероятный интерес, возможно нападение на одеяло'));
bot.action('emo_c3', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c3.jpg'), '😴 **Ужас:**\nУжас и страх от внезапного касания, опасность минимальна. Возможно уйдет подальше'));
bot.action('emo_c4', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c4.jpg'), '😡 **Манечка:**\nБольной манией величия, не представляет опасности'));
bot.action('emo_c5', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c5.jpg'), '🥺 **Спит:**\nОтруб, опасность нулевая'));
bot.action('emo_c6', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c6.jpg'), '🥰 **Ожидание:**\nБулка хлеба, ждёт когда ты встанешь чтобы напасть (она не царапается)'));
bot.action('emo_c7', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c7.jpg'), '🦁 **Ожидание 2:**\nОжидание хрустиков, 50% надежды и 50% опасности'));
bot.action('emo_c8', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c8.jpg'), '😳 **Тупость:**\nВыражение тупости, опасность непредсказуема'));
bot.action('emo_c9', (ctx) => sendEmotion(ctx, path.join(__dirname, 'c9.jpg'), '😎 **Безмятежность:**\nЖизнь удалась, полная расслабленность.'));

// Запуск бота
bot.launch();

// Остановка при завершении
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});