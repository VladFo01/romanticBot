const needle = require("needle");
const tress = require('tress');
const cheerio = require('cheerio');
// const resolve = require('url').resolve;
const fs = require('fs');

const URL = 'http://happybirthday.co.ua/komplimenti-hloptsevi-svoyimi-slovami-v-prozi-ukrayinskoyu-movoyu/';
const prevResults = JSON.parse(fs.readFileSync('./dataBase/girls.json', 'utf-8'));
const results = [...prevResults];

const q = tress(function (url, callback) {
    needle.get(url, function (err, res) {
        if (err) throw err;

        const $ = cheerio.load(res.body);

        const content = $('.entry-content > p').contents().text().trim().split("\n");
        content.forEach(text => results.push(text));

        // $('ul.related_posts > li > a').each(() => {
        //     q.push(resolve(URL, $(this).attr('href')));
        // });
        
        callback();
    });
}, 6);

q.drain = () => {
    fs.writeFileSync('./dataBase/girls.json', JSON.stringify(results, null, 4));
}

q.push(URL);
