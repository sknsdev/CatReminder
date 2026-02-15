const { Markup } = require('telegraf');

// Главное меню
const getMainMenu = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('📝 Отметить выполнение', 'menu_tasks')],
        [Markup.button.callback('📊 Статус сегодня', 'action_status')],
        [Markup.button.callback('📖 Инструкции', 'menu_instructions')],
        [Markup.button.callback('😺 Эмоции кошки', 'menu_emotions')]
    ]);
};

// Меню эмоций
const getEmotionsMenu = () => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('🧐 Стандартная', 'emo_c1'),
            Markup.button.callback('🤪 Безумие', 'emo_c2'),
            Markup.button.callback('😴 Ужас', 'emo_c3')
        ],
        [
            Markup.button.callback('😡 Манечка', 'emo_c4'),
            Markup.button.callback('🥺 Спит', 'emo_c5'),
            Markup.button.callback('🥰 Ожидание', 'emo_c6')
        ],
        [
            Markup.button.callback('🦁 Ожидание 2', 'emo_c7'),
            Markup.button.callback('😳 Тупость', 'emo_c8'),
            Markup.button.callback('😎 Безмятежность', 'emo_c9')
        ],
        [Markup.button.callback('🔙 Назад', 'menu_main')]
    ]);
};

// Меню задач (отметок)
const getTasksMenu = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🍗 Покормил', 'task_fed')],
        [Markup.button.callback('🧶 Поиграл', 'task_played')],
        [Markup.button.callback('💩 Убрал туалет', 'task_cleaned')],
        [Markup.button.callback('🔙 Назад', 'menu_main')]
    ]);
};

// Меню инструкций
const getInstructionsMenu = () => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('📍 Корм', 'info_food'),
            Markup.button.callback('🍬 Вкусняшки', 'info_treats')
        ],
        [
            Markup.button.callback('🍪 Как давать лакомства', 'info_treats_guide')
        ],
        [
            Markup.button.callback('🧹 Туалет', 'info_toilet'),
            Markup.button.callback('🧶 Игры', 'info_play')
        ],
        [
            Markup.button.callback('🔌 Плита', 'info_stove')
        ],
        [
            Markup.button.callback('🗺 Адрес', 'info_addr')
        ],
        [Markup.button.callback('🔙 Назад', 'menu_main')]
    ]);
};

// Кнопка назад к инструкциям
const getBackToInstructions = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Назад к инструкциям', 'menu_instructions')]
    ]);
};

// Кнопка назад к эмоциям
const getBackToEmotions = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Назад к эмоциям', 'menu_emotions')]
    ]);
};

module.exports = {
    getMainMenu,
    getTasksMenu,
    getInstructionsMenu,
    getEmotionsMenu,
    getBackToInstructions,
    getBackToEmotions
};
