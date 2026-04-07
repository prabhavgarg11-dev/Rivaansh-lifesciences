const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'style.css');
let css = fs.readFileSync(file, 'utf8');

css = css.replace('.chatbot-wrapper { position: fixed; bottom: 80px; right: 20px; z-index: 1000; }', '.chatbot-wrapper { position: fixed; bottom: 80px; left: 20px; z-index: 1000; }');

css = css.replace('.chatbot-window { position: absolute; bottom: 80px; right: 0;', '.chatbot-window { position: absolute; bottom: 80px; left: 0;');

css = css.replace('.chatbot-wrapper { bottom: 70px; right: 15px; }', '.chatbot-wrapper { bottom: 70px; left: 15px; }');
css = css.replace('.chatbot-window { width: 330px; position: fixed; right: 10px; bottom: 140px; }', '.chatbot-window { width: 330px; position: fixed; left: 10px; right: auto; bottom: 140px; }');

let html = fs.readFileSync(path.join(__dirname, 'frontend', 'index.html'), 'utf8');
html = html.replace('right: 15px;', 'left: 15px;');

fs.writeFileSync(file, css);
console.log('Fixed overlapping chatbot properly!');
