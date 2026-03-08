const fs = require('fs');
['en.json', 'es.json'].forEach(file => {
    console.log('---', file);
    const lines = fs.readFileSync('src/i18n/locales/' + file, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('taxData')) {
            console.log(i + 1, l);
        }
    });
});
