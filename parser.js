// Записуємо посилання на першу сторінку сайту, який нам потрібно парсить
const URL = 'http://vitannya.com/komplimenti-hloptsevi-v-prozi-svoyimi-slovami-ukrayinskoyu-movoyu/';

// Ініціалізуємо константи 
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

// Створюємо масив для запису результатів парсингу
const results = [];

// Створюємо чергу
const queue = tress((URL, callback) => {
    needle.get(URL, (err, res) => {
        if (err) throw err;

        // Парсимо DOM
        const $ = cheerio.load(res.body);

        $('.gerf > p').each(function () {
            // $(this).text();
            if (!($(this).text().includes('<'))) {
                results.push(
                    $(this).text().trim()
                );
            }
        });

        // Наступні сторінки
        $('page-numbers').each(function () {
            queue.push($(this).attr('href'));
        });

        callback();
    });
}, 6);

// створюємо функцію, яка виконається після завершення черги
queue.drain = () => {
    fs.writeFileSync('./dataBase/boys1.json', JSON.stringify(results, null, 4));
}

queue.push(URL);